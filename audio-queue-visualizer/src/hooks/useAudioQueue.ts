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

  // Protect React state against late Play results.
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

      // Store the most recently decoded track.
      // Returning the same Promise preserves
      // the existing QueueControls API.
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
          // QueueControls handles the error.
          // This rejection handler prevents an
          // unhandled branch from this observer.
        }
      );

      return promise;
    },
    [queue, engine]
  );

  const cancel = useCallback(
    (taskId: string): void => {
      queue.cancel(taskId);
    },
    [queue]
  );

  const stop = useCallback((): void => {
    playbackVersionRef.current++;

    engine.stop();

    if (mountedRef.current) {
      setIsPlaying(false);
    }
  }, [engine]);

  const play = useCallback(async (): Promise<void> => {
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

  return {
    snapshot,
    enqueue,
    cancel,

    loadedAudio,
    isPlaying,
    playbackError,
    play,
    stop,
  };
}