import {
  useState,
  useSyncExternalStore,
} from "react";

import {
  AudioTaskQueue,
} from "../services/AudioTaskQueue";

import {
  createMockAudioProcessor,
} from "../services/createMockAudioProcessor";

import type { AudioTrack } from "../types";

/**
 * Connects AudioTaskQueue to React.
 *
 * The processor is currently simulated.
 * Real audio processing will be integrated later.
 */
export function useAudioQueue() {
  const [queue] = useState(
    () =>
      new AudioTaskQueue(
        createMockAudioProcessor()
      )
  );

  const snapshot = useSyncExternalStore(
    queue.subscribe,
    queue.getSnapshot,
    queue.getSnapshot
  );

  const enqueue = (
    track: AudioTrack
  ): Promise<AudioBuffer> => {
    return queue.enqueue(track);
  };

  const cancel = (taskId: string): void => {
    queue.cancel(taskId);
  };

  return {
    snapshot,
    enqueue,
    cancel,
  };
}