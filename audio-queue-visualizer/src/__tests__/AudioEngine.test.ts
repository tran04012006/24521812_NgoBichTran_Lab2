import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  AudioEngine,
  FFT_SIZE,
} from "../services/AudioEngine";

interface MockSource {
  buffer: AudioBuffer | null;
  onended: (() => void) | null;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

const buffer = {
  duration: 10,
  sampleRate: 44100,
  numberOfChannels: 2,
} as AudioBuffer;

function createMockContext() {
  const sources: MockSource[] = [];

  const analyser = {
    fftSize: 2048,
    smoothingTimeConstant: 0,
    connect: vi.fn(),
    disconnect: vi.fn(),
    getByteFrequencyData: vi.fn(
      (data: Uint8Array) => data.fill(100)
    ),
  };

  const context = {
    state: "running",

    destination: {},

    resume: vi.fn(async () => {}),
    close: vi.fn(async () => {}),

    createAnalyser: vi.fn(() => analyser),

    createBufferSource: vi.fn(() => {
      const source: MockSource = {
        buffer: null,
        onended: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };

      sources.push(source);
      return source;
    }),
  };

  return { context, analyser, sources };
}

describe("AudioEngine FFT Integration", () => {
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

  it("configures FFT size to 256", async () => {
    const engine = new AudioEngine();

    await engine.play(buffer);

    expect(mock.analyser.fftSize).toBe(256);
    expect(FFT_SIZE).toBe(256);
    expect(engine.frequencyBinCount).toBe(128);

    await engine.close();
  });

  it("connects source to analyser", async () => {
    const engine = new AudioEngine();

    await engine.play(buffer);

    expect(
      mock.sources[0].connect
    ).toHaveBeenCalledWith(mock.analyser);

    await engine.close();
  });

  it("connects analyser to destination", async () => {
    const engine = new AudioEngine();

    await engine.play(buffer);

    expect(
      mock.analyser.connect
    ).toHaveBeenCalledWith(
      mock.context.destination
    );

    await engine.close();
  });

  it("reads frequency data", async () => {
    const engine = new AudioEngine();

    await engine.play(buffer);

    const data = new Uint8Array(128);

    const success = engine.readFrequencyData(data);

    expect(success).toBe(true);

    expect(
      mock.analyser.getByteFrequencyData
    ).toHaveBeenCalledWith(data);

    expect(data[0]).toBe(100);

    await engine.close();
  });

  it("returns false when no source is playing", () => {
    const engine = new AudioEngine();

    const data = new Uint8Array(128);

    expect(
      engine.readFrequencyData(data)
    ).toBe(false);
  });

  it("reuses the analyser for multiple plays", async () => {
    const engine = new AudioEngine();

    await engine.play(buffer);
    await engine.play(buffer);

    expect(
      mock.context.createAnalyser
    ).toHaveBeenCalledTimes(1);

    expect(
      mock.context.createBufferSource
    ).toHaveBeenCalledTimes(2);

    await engine.close();
  });

  it("stops the old source before restart", async () => {
    const engine = new AudioEngine();

    await engine.play(buffer);

    const oldSource = mock.sources[0];

    await engine.play(buffer);

    expect(oldSource.stop).toHaveBeenCalledTimes(1);
    expect(oldSource.disconnect).toHaveBeenCalledTimes(1);

    expect(
      mock.sources[1].start
    ).toHaveBeenCalledTimes(1);

    await engine.close();
  });

  it("disconnects source after natural ending", async () => {
    const engine = new AudioEngine();

    const onEnded = vi.fn();

    await engine.play(buffer, onEnded);

    const source = mock.sources[0];

    source.onended?.();

    expect(source.disconnect).toHaveBeenCalledTimes(1);
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(engine.isPlaying).toBe(false);

    await engine.close();
  });

  it("stops playback and disconnects analyser on close", async () => {
    const engine = new AudioEngine();

    await engine.play(buffer);

    await engine.close();

    expect(
      mock.sources[0].stop
    ).toHaveBeenCalledTimes(1);

    expect(
      mock.sources[0].disconnect
    ).toHaveBeenCalledTimes(1);

    expect(
      mock.analyser.disconnect
    ).toHaveBeenCalledTimes(1);

    expect(
      mock.context.close
    ).toHaveBeenCalledTimes(1);
  });

  it("rejects playback after disposal", async () => {
    const engine = new AudioEngine();

    await engine.close();

    await expect(
      engine.play(buffer)
    ).rejects.toThrow("disposed");
  });
});