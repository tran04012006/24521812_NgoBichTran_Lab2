import { AudioEngine } from "./AudioEngine";
import { AudioTaskQueue } from "./AudioTaskQueue";

import { createAudioProcessor } from
  "./createAudioProcessor";

/**
 * Owns the FIFO queue and AudioEngine.
 *
 * Resource shutdown order:
 * 1. Stop queue activity.
 * 2. Wait for active processing to settle.
 * 3. Close AudioContext.
 */
export class AudioQueueSession {
  public readonly engine: AudioEngine;

  public readonly queue: AudioTaskQueue;

  private disposePromise: Promise<void> | null = null;

  constructor() {
    this.engine = new AudioEngine();

    this.queue = new AudioTaskQueue(
      createAudioProcessor(this.engine)
    );
  }

  public dispose(): Promise<void> {
    if (this.disposePromise) {
      return this.disposePromise;
    }

    this.disposePromise = (async () => {
      try {
        await this.queue.dispose();
      } finally {
        await this.engine.close();
      }
    })();

    return this.disposePromise;
  }
}