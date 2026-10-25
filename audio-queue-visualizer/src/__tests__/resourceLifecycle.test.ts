import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { AudioTaskQueue } from
  "../services/AudioTaskQueue";

import { AudioEngine } from
  "../services/AudioEngine";

import {
  createDeferred,
  mockBuffer,
  observe,
  tracks,
  waitUntil,
} from "./testUtils";

describe("Queue Resource Lifecycle", () => {
  it("disposes an idle queue", async () => {
    const processor = vi.fn(
      async () => mockBuffer()
    );

    const queue = new AudioTaskQueue(processor);

    await queue.dispose();

    expect(queue.isDisposed).toBe(true);

    expect(queue.getSnapshot().status)
      .toBe("idle");

    expect(processor).not.toHaveBeenCalled();
  });

  it("rejects enqueue after disposal", async () => {
    const queue = new AudioTaskQueue(
      async () => mockBuffer()
    );

    await queue.dispose();

    await expect(
      queue.enqueue(tracks[0])
    ).rejects.toThrow("disposed queue");
  });

  it("returns the same dispose Promise", async () => {
    const queue = new AudioTaskQueue(
      async () => mockBuffer()
    );

    const first = queue.dispose();
    const second = queue.dispose();

    expect(first).toBe(second);

    await first;
  });

  it("cancels pending tasks during disposal", async () => {
    const gate = createDeferred<AudioBuffer>();

    const started: string[] = [];

    const queue = new AudioTaskQueue(
      async (track) => {
        started.push(track.id);
        return gate.promise;
      }
    );

    const resultA = observe(
      queue.enqueue(tracks[0])
    );

    const resultB = observe(
      queue.enqueue(tracks[1])
    );

    const disposal = queue.dispose();

    const cancelled = await Promise.all([
      resultA,
      resultB,
    ]);

    expect(
      cancelled.map((result) => result.status)
    ).toEqual(["rejected", "rejected"]);

    expect(started).toEqual(["a"]);

    // A ignores abort, so disposal must
    // wait for its processor.
    gate.resolve(mockBuffer());

    await disposal;

    expect(queue.isDisposed).toBe(true);

    expect(
      queue.getSnapshot().history
    ).toHaveLength(2);
  });

  it("waits for active processing to settle", async () => {
    const gate = createDeferred<AudioBuffer>();

    const queue = new AudioTaskQueue(
      async () => gate.promise
    );

    const result = observe(
      queue.enqueue(tracks[0])
    );

    let finished = false;

    const disposal = queue.dispose().then(() => {
      finished = true;
    });

    await result;

    expect(finished).toBe(false);

    gate.resolve(mockBuffer());

    await disposal;

    expect(finished).toBe(true);
    expect(queue.getSnapshot().status).toBe("idle");
  });

  it("ignores late results after disposal", async () => {
    const gate = createDeferred<AudioBuffer>();

    const queue = new AudioTaskQueue(
      async () => gate.promise
    );

    const result = observe(
      queue.enqueue(tracks[0])
    );

    const disposal = queue.dispose();

    const settled = await result;

    expect(settled.status).toBe("rejected");

    gate.resolve(mockBuffer());

    await disposal;

    const history = queue.getSnapshot().history;

    expect(history).toHaveLength(1);

    expect(history[0].status).toBe("cancelled");
  });

  it("does not start pending work after disposal", async () => {
    const gate = createDeferred<AudioBuffer>();

    const starts: string[] = [];

    const queue = new AudioTaskQueue(
      async (track) => {
        starts.push(track.id);
        return gate.promise;
      }
    );

    const results = tracks.map(
      (track) => observe(queue.enqueue(track))
    );

    const disposal = queue.dispose();

    gate.resolve(mockBuffer());

    await Promise.all(results);
    await disposal;

    expect(starts).toEqual(["a"]);
  });

  it("clears subscribers after disposal", async () => {
    const queue = new AudioTaskQueue(
      async () => mockBuffer()
    );

    const listener = vi.fn();

    queue.subscribe(listener);

    await queue.dispose();

    const count = listener.mock.calls.length;

    queue.cancel("unknown-task");

    expect(listener).toHaveBeenCalledTimes(count);
  });

  it("settles final processing before disposal resolves", async () => {
    const gate = createDeferred<AudioBuffer>();

    const queue = new AudioTaskQueue(
      async () => gate.promise
    );

    const result = observe(
      queue.enqueue(tracks[0])
    );

    const disposing = queue.dispose();

    gate.resolve(mockBuffer());

    await disposing;
    await result;

    await waitUntil(
      () => queue.getSnapshot().status === "idle"
    );

    expect(queue.getSnapshot().activeTask).toBeNull();
    expect(queue.getSnapshot().pendingTasks).toHaveLength(0);
  });
});

describe("AudioEngine Lifecycle", () => {
  it("closes without creating an unused AudioContext", async () => {
    const engine = new AudioEngine();

    await engine.close();

    expect(engine.isDisposed).toBe(true);

    await expect(
      engine.load(
        tracks[0],
        new AbortController().signal
      )
    ).rejects.toThrow("disposed");
  });

  it("returns the same close Promise", async () => {
    const engine = new AudioEngine();

    const first = engine.close();
    const second = engine.close();

    expect(first).toBe(second);

    await first;
  });
});