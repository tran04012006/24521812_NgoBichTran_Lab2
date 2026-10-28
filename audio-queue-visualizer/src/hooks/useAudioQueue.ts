import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { AudioQueueSession } from
  "../services/AudioQueueSession";

import type { AudioTrack } from "../types";

interface LoadedAudio {
  track: AudioTrack;
  buffer: AudioBuffer;
}

export function useAudioQueue() {
  const [session] = useState(
    () => new AudioQueueSession()
  );

  const queue = session.queue;
  const engine = session.engine;

  const snapshot = useSyncExternalStore(
    queue.subscribe,
    queue.getSnapshot
  );

  const [loadedAudio, setLoadedAudio] =
    useState<LoadedAudio | null>(null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [playbackError, setPlaybackError] =
    useState<string | null>(null);

  const mountedRef = useRef(false);
  const playbackVersionRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      queueMicrotask(() => {
        if (mountedRef.current) {
          return;
        }

        void session.dispose().catch((error) => {
          console.error(
            "Audio session cleanup failed:",
            error
          );
        });
      });
    };
  }, [session]);

  const enqueue = useCallback(
    (track: AudioTrack): Promise<AudioBuffer> => {
      const promise = queue.enqueue(track);

      void promise.then(
        (buffer) => {
          if (!mountedRef.current) {
            return;
          }

          playbackVersionRef.current++;

          engine.stop();
          setIsPlaying(false);
          setPlaybackError(null);

          setLoadedAudio({
            track,
            buffer,
          });
        },
        () => {
          // The caller handles rejection.
        }
      );

      return promise;
    },
    [queue, engine]
  );

  const cancel = useCallback(
    (taskId: string) => {
      queue.cancel(taskId);
    },
    [queue]
  );

  const stop = useCallback(() => {
    playbackVersionRef.current++;

    engine.stop();

    if (mountedRef.current) {
      setIsPlaying(false);
    }
  }, [engine]);

  const play = useCallback(async () => {
    if (!loadedAudio) {
      return;
    }

    const version = ++playbackVersionRef.current;

    setPlaybackError(null);

    try {
      await engine.play(
        loadedAudio.buffer,
        () => {
          if (
            mountedRef.current &&
            version === playbackVersionRef.current
          ) {
            setIsPlaying(false);
          }
        }
      );

      if (
        mountedRef.current &&
        version === playbackVersionRef.current
      ) {
        setIsPlaying(engine.isPlaying);
      }
    } catch (error: unknown) {
      if (
        !mountedRef.current ||
        version !== playbackVersionRef.current
      ) {
        return;
      }

      setIsPlaying(false);

      setPlaybackError(
        error instanceof Error
          ? error.message
          : String(error)
      );
    }
  }, [engine, loadedAudio]);

  /**
   * Read real FFT frequency data.
   *
   * Canvas calls this directly.
   * It does not update React state.
   */
  const readFrequencyData = useCallback(
    (data: Uint8Array): boolean => {
      return engine.readFrequencyData(data);
    },
    [engine]
  );

  return {
    snapshot,
    enqueue,
    cancel,
    loadedAudio,
    isPlaying,
    playbackError,
    play,
    stop,

    readFrequencyData,
    frequencyBinCount: engine.frequencyBinCount,
  };
}