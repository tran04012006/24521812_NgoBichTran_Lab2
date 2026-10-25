import type { AudioTrack } from "./audio.types";

export type QueueStatus =
  | "idle"
  | "processing";

export type TaskStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Internal task representation.
 */
export interface AudioTask {
  id: string;
  track: AudioTrack;
  status: TaskStatus;

  controller: AbortController;

  resolve: (buffer: AudioBuffer) => void;
  reject: (reason?: unknown) => void;
}

/**
 * Public information about a task.
 */
export interface AudioTaskInfo {
  readonly id: string;
  readonly track: Readonly<AudioTrack>;
  readonly status: TaskStatus;
}

/**
 * Public state of the entire queue.
 */
export interface QueueSnapshot {
  readonly status: QueueStatus;

  readonly pendingTasks:
    readonly AudioTaskInfo[];

  readonly activeTask:
    AudioTaskInfo | null;

  readonly history:
    readonly AudioTaskInfo[];
}

/**
 * Called when the queue state changes.
 */
export type QueueListener = (
  snapshot: QueueSnapshot
) => void;

/**
 * Function used to unsubscribe.
 */
export type QueueUnsubscribe = () => void;

/**
 * Public contract for the FIFO queue.
 */
export interface AudioTaskQueueInterface {
  enqueue(
    track: AudioTrack
  ): Promise<AudioBuffer>;

  cancel(taskId: string): void;

  getSnapshot(): QueueSnapshot;

  subscribe(
    listener: QueueListener
  ): QueueUnsubscribe;
}