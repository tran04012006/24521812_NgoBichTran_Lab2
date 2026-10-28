
export type TimerStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed";

export type TimerCallback = (
  remainingMs: number
) => void;

export interface AntiDriftTimer {
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  stop: () => void;
  getRemaining: () => number;
  getStatus: () => TimerStatus;
}

export function createAntiDriftTimer(
  durationMs: number,
  onTick: TimerCallback,
  onComplete?: () => void
): AntiDriftTimer {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    throw new Error(
      "durationMs must be a non-negative finite number"
    );
  }

  let remainingMs = durationMs;
  let targetTime = 0;
  let frameId: number | null = null;
  let status: TimerStatus = "idle";

  function cancelFrame(): void {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  function readRemaining(): number {
    if (status === "running") {
      return Math.max(0, targetTime - Date.now());
    }

    return remainingMs;
  }

  function tick(): void {
    if (status !== "running") {
      return;
    }

    frameId = null;
    remainingMs = readRemaining();

    if (remainingMs === 0) {
      status = "completed";
      onTick(0);
      onComplete?.();
      return;
    }

    onTick(remainingMs);

    if (status === "running") {
      frameId = requestAnimationFrame(tick);
    }
  }

  function start(): void {
    if (status !== "idle") {
      return;
    }

    targetTime = Date.now() + remainingMs;

    if (remainingMs === 0) {
      status = "completed";
      onTick(0);
      onComplete?.();
      return;
    }

    status = "running";
    onTick(remainingMs);

    if (status === "running") {
      frameId = requestAnimationFrame(tick);
    }
  }

  function pause(): void {
    if (status !== "running") {
      return;
    }

    remainingMs = readRemaining();
    status = "paused";
    cancelFrame();
    onTick(remainingMs);
  }

  function resume(): void {
    if (status !== "paused") {
      return;
    }

    if (remainingMs === 0) {
      status = "completed";
      onTick(0);
      onComplete?.();
      return;
    }

    targetTime = Date.now() + remainingMs;
    status = "running";
    onTick(remainingMs);

    if (status === "running") {
      frameId = requestAnimationFrame(tick);
    }
  }

  function restart(): void {
    cancelFrame();

    remainingMs = durationMs;
    targetTime = 0;
    status = "idle";

    start();
  }

  function stop(): void {
    cancelFrame();

    remainingMs = durationMs;
    targetTime = 0;
    status = "idle";
  }

  return {
    start,
    pause,
    resume,
    restart,
    stop,
    getRemaining: readRemaining,
    getStatus: () => status,
  };
}
