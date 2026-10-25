import type { AudioProcessor } from "./AudioTaskQueue";

import { AudioEngine } from "./AudioEngine";

/**
 * Create a real audio processor from AudioEngine.
 *
 * The queue controls execution order.
 * AudioEngine handles download and decoding.
 */
export function createAudioProcessor(
  engine: AudioEngine
): AudioProcessor {
  return async (track, signal) => {
    return engine.load(track, signal);
  };
}