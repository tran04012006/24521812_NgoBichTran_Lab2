
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createAntiDriftTimer,
  type AntiDriftTimer,
  type TimerStatus,
} from "../utils/anti-drift-timer";

interface CountdownResult {
  remainingMs: number;
  status: TimerStatus;
  pause: () => void;
  resume: () => void;
  restart: () => void;
}

export function useCountdown(
  durationMs: number
): CountdownResult {
  const [remainingMs, setRemainingMs] =
    useState(durationMs);

  const [status, setStatus] =
    useState<TimerStatus>("idle");

  const timerRef = useRef<AntiDriftTimer | null>(null);

  useEffect(() => {
    const timer = createAntiDriftTimer(
      durationMs,
      (remaining) => {
        setRemainingMs(remaining);
      },
      () => {
        setStatus("completed");
      }
    );

    timerRef.current = timer;

    timer.start();

    setRemainingMs(timer.getRemaining());
    setStatus(timer.getStatus());

    return () => {
      timer.stop();

      if (timerRef.current === timer) {
        timerRef.current = null;
      }
    };
  }, [durationMs]);

  const pause = useCallback(() => {
    const timer = timerRef.current;

    if (!timer) return;

    timer.pause();

    setRemainingMs(timer.getRemaining());
    setStatus(timer.getStatus());
  }, []);

  const resume = useCallback(() => {
    const timer = timerRef.current;

    if (!timer) return;

    timer.resume();

    setRemainingMs(timer.getRemaining());
    setStatus(timer.getStatus());
  }, []);

  const restart = useCallback(() => {
    const timer = timerRef.current;

    if (!timer) return;

    timer.restart();

    setRemainingMs(timer.getRemaining());
    setStatus(timer.getStatus());
  }, []);

  return {
    remainingMs,
    status,
    pause,
    resume,
    restart,
  };
}
