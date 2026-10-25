import type { AudioTrack } from "../types";

/**
 * Simple mock tracks.
 */
export const tracks: AudioTrack[] = [
  {
    id: "a",
    title: "Song A",
    url: "/a.mp3",
  },
  {
    id: "b",
    title: "Song B",
    url: "/b.mp3",
  },
  {
    id: "c",
    title: "Song C",
    url: "/c.mp3",
  },
];

/**
 * A Promise controlled by the test.
 */
export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error?: unknown) => void;
}

export function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

/**
 * A value typed as AudioBuffer for testing
 * queue orchestration only.
 *
 * Tests do not inspect audio samples.
 */
export function mockBuffer(): AudioBuffer {
  return {} as AudioBuffer;
}

/**
 * Wait until an asynchronous condition is true.
 *
 * This flushes microtasks and avoids arbitrary
 * real-time sleeps.
 */
export async function waitUntil(
  condition: () => boolean
): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (condition()) {
      return;
    }

    await Promise.resolve();
  }

  throw new Error(
    "Condition was not reached within 100 microtasks."
  );
}

/**
 * Collect a Promise result without allowing
 * an unhandled rejection.
 */
export function observe<T>(promise: Promise<T>) {
  return promise.then(
    (value) => ({
      status: "fulfilled" as const,
      value,
    }),

    (reason: unknown) => ({
      status: "rejected" as const,
      reason,
    })
  );
}