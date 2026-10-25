import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  AudioTaskQueue,
} from "../services/AudioTaskQueue";

import type {
  AudioProcessor,
} from "../services/AudioTaskQueue";

import {
  createDeferred,
  mockBuffer,
  observe,
  tracks,
  waitUntil,
} from "./testUtils";

import type {
  Deferred,
} from "./testUtils";

/**
 * Controlled processor fixture.
 *
 * Each track starts only when the queue
 * invokes the processor.
 *
 * Tests decide when processing finishes.
 */
function createFixture() {
  const events: string[] = [];

  const gates = new Map<
    string,
    Deferred<AudioBuffer>
  >();

  let activeCount = 0;
  let maxActive = 0;

  const processor: AudioProcessor = async (
    track
  ) => {
    events.push(`START ${track.id}`);

    activeCount++;

    maxActive = Math.max(
      maxActive,
      activeCount
    );

    const gate = createDeferred<AudioBuffer>();

    gates.set(track.id, gate);

    try {
      return await gate.promise;
    } finally {
      events.push(`END ${track.id}`);
      activeCount--;
    }
  };

  const queue = new AudioTaskQueue(processor);

  const finish = (id: string) => {
    const gate = gates.get(id);

    if (!gate) {
      throw new Error(
        `Processor ${id} has not started`
      );
    }

    gate.resolve(mockBuffer());
  };

  const fail = (id: string) => {
    const gate = gates.get(id);

    if (!gate) {
      throw new Error(
        `Processor ${id} has not started`
      );
    }

    gate.reject(
      new Error(`Processing ${id} failed`)
    );
  };

  return {
    queue,
    events,
    gates,
    finish,
    fail,

    getMaxActive: () => maxActive,
  };
}

describe("AudioTaskQueue", () => {
  it("starts tasks in FIFO order", async () => {
    const fixture = createFixture();

    const results = tracks.map((track) =>
      observe(fixture.queue.enqueue(track))
    );

    expect(fixture.events).toEqual([
      "START a",
    ]);

    fixture.finish("a");

    await waitUntil(() =>
      fixture.events.includes("START b")
    );

    fixture.finish("b");

    await waitUntil(() =>
      fixture.events.includes("START c")
    );

    fixture.finish("c");

    await Promise.all(results);

    expect(fixture.events).toEqual([
      "START a",
      "END a",
      "START b",
      "END b",
      "START c",
      "END c",
    ]);
  });

  it("never overlaps two processors", async () => {
    const fixture = createFixture();

    const results = tracks.map((track) =>
      observe(fixture.queue.enqueue(track))
    );

    expect(fixture.getMaxActive()).toBe(1);

    fixture.finish("a");

    await waitUntil(() =>
      fixture.gates.has("b")
    );

    fixture.finish("b");

    await waitUntil(() =>
      fixture.gates.has("c")
    );

    fixture.finish("c");

    await Promise.all(results);

    expect(fixture.getMaxActive()).toBe(1);
  });

  it("keeps tasks pending while another runs", async () => {
    const fixture = createFixture();

    const results = tracks.map((track) =>
      observe(fixture.queue.enqueue(track))
    );

    const snapshot = fixture.queue.getSnapshot();

    expect(snapshot.status).toBe("processing");

    expect(
      snapshot.activeTask?.track.id
    ).toBe("a");

    expect(
      snapshot.pendingTasks.map(
        (task) => task.track.id
      )
    ).toEqual(["b", "c"]);

    fixture.finish("a");

    await waitUntil(() =>
      fixture.gates.has("b")
    );

    fixture.finish("b");

    await waitUntil(() =>
      fixture.gates.has("c")
    );

    fixture.finish("c");

    await Promise.all(results);
  });

  it("continues after a processor failure", async () => {
    const fixture = createFixture();

    const results = tracks.map((track) =>
      observe(fixture.queue.enqueue(track))
    );

    fixture.finish("a");

    await waitUntil(() =>
      fixture.gates.has("b")
    );

    fixture.fail("b");

    await waitUntil(() =>
      fixture.gates.has("c")
    );

    fixture.finish("c");

    const settled = await Promise.all(results);

    expect(
      settled.map((item) => item.status)
    ).toEqual([
      "fulfilled",
      "rejected",
      "fulfilled",
    ]);

    expect(
      fixture.queue.getSnapshot().history.map(
        (task) => task.status
      )
    ).toEqual([
      "completed",
      "failed",
      "completed",
    ]);
  });

  it("cancels a pending task", async () => {
    const fixture = createFixture();

    const results = tracks.map((track) =>
      observe(fixture.queue.enqueue(track))
    );

    fixture.queue.cancel("task-2");

    expect(
      fixture.queue.getSnapshot().pendingTasks.map(
        (task) => task.track.id
      )
    ).toEqual(["c"]);

    fixture.finish("a");

    await waitUntil(() =>
      fixture.gates.has("c")
    );

    fixture.finish("c");

    const settled = await Promise.all(results);

    expect(settled[1].status).toBe("rejected");

    if (settled[1].status === "rejected") {
      expect(settled[1].reason).toMatchObject({
        name: "AbortError",
      });
    }

    expect(
      fixture.events.includes("START b")
    ).toBe(false);

    expect(
      fixture.queue.getSnapshot().history.find(
        (task) => task.id === "task-2"
      )?.status
    ).toBe("cancelled");
  });

  it("cancels an active task safely", async () => {
    const fixture = createFixture();

    const resultA = observe(
      fixture.queue.enqueue(tracks[0])
    );

    const resultB = observe(
      fixture.queue.enqueue(tracks[1])
    );

    fixture.queue.cancel("task-1");

    const cancelled = await resultA;

    expect(cancelled.status).toBe("rejected");

    expect(fixture.events).toEqual([
      "START a",
    ]);

    // The processor ignores abort.
    // It is still running until we release it.
    fixture.finish("a");

    await waitUntil(() =>
      fixture.gates.has("b")
    );

    fixture.finish("b");

    await resultB;

    expect(
      fixture.queue.getSnapshot().history.find(
        (task) => task.id === "task-1"
      )?.status
    ).toBe("cancelled");

    expect(fixture.getMaxActive()).toBe(1);
  });

  it("ignores a late result after cancellation", async () => {
    const fixture = createFixture();

    const resultA = observe(
      fixture.queue.enqueue(tracks[0])
    );

    const resultB = observe(
      fixture.queue.enqueue(tracks[1])
    );

    fixture.queue.cancel("task-1");

    expect(
      fixture.events.includes("START b")
    ).toBe(false);

    // Simulate a late successful result.
    fixture.finish("a");

    await waitUntil(() =>
      fixture.gates.has("b")
    );

    fixture.finish("b");

    await Promise.all([
      resultA,
      resultB,
    ]);

    const history =
      fixture.queue.getSnapshot().history;

    expect(
      history.filter(
        (task) => task.id === "task-1"
      )
    ).toHaveLength(1);

    expect(
      history.find(
        (task) => task.id === "task-1"
      )?.status
    ).toBe("cancelled");

    expect(fixture.getMaxActive()).toBe(1);
  });

  it("ignores an unknown cancellation ID", async () => {
    const fixture = createFixture();

    const result = observe(
      fixture.queue.enqueue(tracks[0])
    );

    const before = fixture.queue.getSnapshot();

    fixture.queue.cancel("task-999");

    expect(
      fixture.queue.getSnapshot()
    ).toBe(before);

    fixture.finish("a");

    const settled = await result;

    expect(settled.status).toBe("fulfilled");
  });

  it("returns a stable immutable snapshot", async () => {
    const fixture = createFixture();

    const initial = fixture.queue.getSnapshot();

    expect(
      fixture.queue.getSnapshot()
    ).toBe(initial);

    const result = observe(
      fixture.queue.enqueue(tracks[0])
    );

    const current = fixture.queue.getSnapshot();

    expect(current).not.toBe(initial);

    expect(
      fixture.queue.getSnapshot()
    ).toBe(current);

    expect(Object.isFrozen(current)).toBe(true);

    expect(
      Object.isFrozen(current.pendingTasks)
    ).toBe(true);

    expect(
      Object.isFrozen(current.activeTask)
    ).toBe(true);

    fixture.finish("a");

    await result;
  });

  it("notifies listeners and supports unsubscribe", async () => {
    const fixture = createFixture();

    const listener = vi.fn();

    const unsubscribe =
      fixture.queue.subscribe(listener);

    const result = observe(
      fixture.queue.enqueue(tracks[0])
    );

    expect(listener).toHaveBeenCalled();

    unsubscribe();

    const callsAfterUnsubscribe =
      listener.mock.calls.length;

    fixture.finish("a");

    await result;

    expect(
      listener.mock.calls.length
    ).toBe(callsAfterUnsubscribe);
  });

  it("keeps processing when a subscriber throws", async () => {
    const fixture = createFixture();

    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      fixture.queue.subscribe(() => {
        throw new Error("Listener error");
      });

      const result = observe(
        fixture.queue.enqueue(tracks[0])
      );

      fixture.finish("a");

      const settled = await result;

      expect(settled.status).toBe("fulfilled");

      expect(errorSpy).toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
    }
  });
});