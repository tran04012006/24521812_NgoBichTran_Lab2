import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { AudioEngine } from "../services/AudioEngine";

import type { AudioTrack } from "../types";

interface MockSource {
  buffer: AudioBuffer | null;
  onended: (() => void) | null;

  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

const track: AudioTrack = {
  id: "test-track",
  title: "Test Song",
  url: "/test.mp3",
};

const buffer = {
  duration: 10,
  sampleRate: 44100,
  numberOfChannels: 2,
} as AudioBuffer;

function createMockSource(): MockSource {
  return {
    buffer: null,
    onended: null,

    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

function createMockContext() {
  const sources: MockSource[] = [];

  const context = {
    state: "running",

    destination: {},

    resume: vi.fn(async () => {}),

    close: vi.fn(async () => {}),

    createBufferSource: vi.fn(() => {
      const source = createMockSource();
      sources.push(source);
      return source;
    }),

    decodeAudioData: vi.fn(async () => buffer),
  };

  return { context, sources };
}

describe("AudioEngine Playback", () => {
  let mock: ReturnType<typeof createMockContext>;

  beforeEach(() => {
    mock = createMockContext();

    vi.stubGlobal(
      "AudioContext",
      class {
        constructor() {
          return mock.context;
        }
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("creates a source and starts playback", async () => {
    const engine = new AudioEngine();

    await engine.play(buffer);

    expect(
      mock.context.createBufferSource
    ).toHaveBeenCalledTimes(1);

    expect(mock.sources[0].buffer).toBe(buffer);

    expect(
      mock.sources[0].connect
    ).toHaveBeenCalledWith(
      mock.context.destination
    );

    expect(
      mock.sources[0].start
    ).toHaveBeenCalledTimes(1);

    expect(engine.isPlaying).toBe(true);

    await engine.close();
  });

  it("stops and disconnects the current source", async () => {
    const engine = new AudioEngine();

    await engine.play(buffer);

    const source = mock.sources[0];

    engine.stop();

    expect(source.stop).toHaveBeenCalledTimes(1);
    expect(source.disconnect).toHaveBeenCalledTimes(1);

    expect(source.onended).toBeNull();
    expect(engine.isPlaying).toBe(false);

    await engine.close();
  });

  it("creates a new source when restarting", async () => {
    const engine = new AudioEngine();

    await engine.play(buffer);

    const firstSource = mock.sources[0];

    await engine.play(buffer);

    const secondSource = mock.sources[1];

    expect(
      mock.context.createBufferSource
    ).toHaveBeenCalledTimes(2);

    expect(firstSource.stop).toHaveBeenCalledTimes(1);
    expect(firstSource.disconnect).toHaveBeenCalledTimes(1);

    expect(secondSource.start).toHaveBeenCalledTimes(1);

    expect(engine.isPlaying).toBe(true);

    await engine.close();
  });

  it("cleans up after natural playback completion", async () => {
    const engine = new AudioEngine();

    const onEnded = vi.fn();

    await engine.play(buffer, onEnded);

    const source = mock.sources[0];

    source.onended?.();

    expect(source.disconnect).toHaveBeenCalledTimes(1);
    expect(source.stop).not.toHaveBeenCalled();

    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(engine.isPlaying).toBe(false);

    await engine.close();
  });

  it("does not stop an already released source again", async () => {
    const engine = new AudioEngine();

    await engine.play(buffer);

    const source = mock.sources[0];

    source.onended?.();

    engine.stop();

    expect(source.disconnect).toHaveBeenCalledTimes(1);
    expect(source.stop).not.toHaveBeenCalled();

    await engine.close();
  });

  it("stops playback before closing AudioContext", async () => {
    const engine = new AudioEngine();

    await engine.play(buffer);

    const source = mock.sources[0];

    await engine.close();

    expect(source.stop).toHaveBeenCalledTimes(1);
    expect(source.disconnect).toHaveBeenCalledTimes(1);

    expect(mock.context.close).toHaveBeenCalledTimes(1);
    expect(engine.isDisposed).toBe(true);
  });

  it("does not create a source after Stop during resume", async () => {
    const engine = new AudioEngine();

    let finishResume!: () => void;

    const pendingResume = new Promise<void>((resolve) => {
      finishResume = resolve;
    });

    mock.context.state = "suspended";

    mock.context.resume.mockImplementation(
      () => pendingResume
    );

    const playing = engine.play(buffer);

    engine.stop();

    finishResume();

    await playing;

    expect(
      mock.context.createBufferSource
    ).not.toHaveBeenCalled();

    expect(engine.isPlaying).toBe(false);

    await engine.close();
  });

  it("rejects playback after closing the engine", async () => {
    const engine = new AudioEngine();

    await engine.close();

    await expect(
      engine.play(buffer)
    ).rejects.toThrow("disposed");
  });

  it("does not create an AudioContext when stopping idle", () => {
    const engine = new AudioEngine();

    engine.stop();

    expect(
      mock.context.createBufferSource
    ).not.toHaveBeenCalled();

    expect(engine.isPlaying).toBe(false);
  });

  it("downloads and decodes real-format data through the API", async () => {
    const engine = new AudioEngine();

    const arrayBuffer = new ArrayBuffer(16);

    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      arrayBuffer: async () => arrayBuffer,
    }));

    vi.stubGlobal("fetch", fetchMock);

    const controller = new AbortController();

    const result = await engine.load(
      track,
      controller.signal
    );

    expect(fetchMock).toHaveBeenCalledWith(
      track.url,
      { signal: controller.signal }
    );

    expect(
      mock.context.decodeAudioData
    ).toHaveBeenCalledWith(arrayBuffer);

    expect(result).toBe(buffer);

    await engine.close();
  });

  it("rejects a cancelled decoding result", async () => {
    const engine = new AudioEngine();

    let finishDecode!: (value: AudioBuffer) => void;

    const decoding = new Promise<AudioBuffer>((resolve) => {
      finishDecode = resolve;
    });

    mock.context.decodeAudioData.mockImplementation(
      () => decoding
    );

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        arrayBuffer: async () => new ArrayBuffer(16),
      }))
    );

    const controller = new AbortController();

    const result = engine.load(
      track,
      controller.signal
    );

    // Allow fetch and arrayBuffer awaits to complete.
    for (let i = 0; i < 5; i++) {
      await Promise.resolve();
    }

    controller.abort();

    finishDecode(buffer);

    await expect(result).rejects.toMatchObject({
      name: "AbortError",
    });

    await engine.close();
  });
});