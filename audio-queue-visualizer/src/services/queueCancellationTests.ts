import { AudioTaskQueue } from "./AudioTaskQueue";

import type { AudioProcessor } from "./AudioTaskQueue";

import { mockTracks } from "../data/mockTracks";

import type { QueueSnapshot } from "../types";

export type CancellationTestName =
  | "pending"
  | "active"
  | "unknown"
  | "late";

export interface CancellationTestResult {
  passed: boolean;
  logs: string[];
  snapshot: QueueSnapshot;
}

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolvePromise!: (value: T) => void;
  let rejectPromise!: (reason?: unknown) => void;

  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return {
    promise,
    resolve: resolvePromise,
    reject: rejectPromise,
  };
}

function createBuffer(): AudioBuffer {
  return new AudioBuffer({
    length: 1,
    numberOfChannels: 1,
    sampleRate: 44100,
  });
}

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertStatuses(
  snapshot: QueueSnapshot,
  expected: string[]
): void {
  const actual = snapshot.history.map(
    (task) => task.status
  );

  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `Expected ${expected.join(", ")}, got ${actual.join(", ")}`
  );
}

function isAbortError(reason: unknown): boolean {
  return (
    reason instanceof Error &&
    reason.name === "AbortError"
  );
}

/**
 * Run a cancellation test using controlled
 * processor completion.
 */
export async function runCancellationTest(
  name: CancellationTestName
): Promise<CancellationTestResult> {
  const logs: string[] = [];
  const started: string[] = [];

  const gates = [
    createDeferred<AudioBuffer>(),
    createDeferred<AudioBuffer>(),
    createDeferred<AudioBuffer>(),
  ];

  const processor: AudioProcessor = async (
    track,
    signal
  ) => {
    const index = mockTracks.findIndex(
      (item) => item.id === track.id
    );

    if (index < 0) {
      throw new Error("Unknown mock track");
    }

    started.push(track.title);
    logs.push(`START: ${track.title}`);

    // The late-result test intentionally ignores abort
    // to simulate a non-cooperative processor.
    if (name !== "late") {
      signal.addEventListener(
        "abort",
        () => gates[index].reject(
          new DOMException(
            "Processor aborted",
            "AbortError"
          )
        ),
        { once: true }
      );
    }

    const buffer = await gates[index].promise;

    logs.push(`FINISH: ${track.title}`);
    return buffer;
  };

  const queue = new AudioTaskQueue(processor);

  // Observe all Promise results from the beginning.
  // This prevents unhandled rejections.
  const results = mockTracks.map((track) =>
    queue.enqueue(track).then(
      () => ({
        status: "fulfilled" as const,
      }),
      (reason: unknown) => ({
        status: "rejected" as const,
        reason,
      })
    )
  );

  assert(
    started.join(",") === "Song A",
    "Only Song A should start initially"
  );

  if (name === "pending") {
    queue.cancel("task-2");

    gates[0].resolve(createBuffer());

    await Promise.resolve();
    await Promise.resolve();

    assert(
      started.includes("Song C"),
      "Song C should start after Song A"
    );

    gates[2].resolve(createBuffer());
  }

  if (name === "active") {
    queue.cancel("task-1");

    await Promise.resolve();
    await Promise.resolve();

    assert(
      started.includes("Song B"),
      "Song B should start after Song A aborts"
    );

    gates[1].resolve(createBuffer());

    await Promise.resolve();
    await Promise.resolve();

    gates[2].resolve(createBuffer());
  }

  if (name === "unknown") {
    const before = queue.getSnapshot();

    queue.cancel("task-999");

    const after = queue.getSnapshot();

    assert(
      JSON.stringify(before) === JSON.stringify(after),
      "Unknown cancellation changed queue state"
    );

    gates[0].resolve(createBuffer());

    await Promise.resolve();
    await Promise.resolve();

    gates[1].resolve(createBuffer());

    await Promise.resolve();
    await Promise.resolve();

    gates[2].resolve(createBuffer());
  }

  if (name === "late") {
    queue.cancel("task-1");

    assert(
      started.length === 1,
      "Song B started before Song A processor ended"
    );

    // Even though task-1's public Promise was rejected,
    // the underlying processor still hasn't ended.
    gates[0].resolve(createBuffer());

    await Promise.resolve();
    await Promise.resolve();

    assert(
      started.includes("Song B"),
      "Song B should start after the late result"
    );

    gates[1].resolve(createBuffer());

    await Promise.resolve();
    await Promise.resolve();

    gates[2].resolve(createBuffer());
  }

  const settled = await Promise.all(results);

  // Allow the processing loop to finish its cleanup.
  await Promise.resolve();

  const snapshot = queue.getSnapshot();

  const expectedStatuses =
    name === "pending"
      ? ["cancelled", "completed", "completed"]
      : name === "active" || name === "late"
        ? ["cancelled", "completed", "completed"]
        : ["completed", "completed", "completed"];

  assertStatuses(snapshot, expectedStatuses);

  const cancelledIndex =
    name === "pending"
      ? 1
      : name === "active" || name === "late"
        ? 0
        : -1;

  if (cancelledIndex >= 0) {
    const result = settled[cancelledIndex];

    assert(
      result.status === "rejected" &&
        isAbortError(result.reason),
      "Cancelled task must reject with AbortError"
    );
  }

  assert(
    snapshot.status === "idle",
    "Queue should be idle after all processors finish"
  );

  assert(
    snapshot.pendingTasks.length === 0,
    "Pending queue should be empty"
  );

  assert(
    snapshot.history.length === 3,
    "All three tasks should have final history entries"
  );

  logs.push("PASS: " + name);

  return {
    passed: true,
    logs,
    snapshot,
  };
}