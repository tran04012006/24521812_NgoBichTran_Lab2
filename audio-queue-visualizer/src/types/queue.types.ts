import type { AudioTrack } from "./audio.types";

/**
 * Current state of the FIFO queue.
 */
export type QueueStatus =
  | "idle"
  | "processing";

/**
 * Lifecycle state of an individual audio task.
 */
export type TaskStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Represents one asynchronous audio task.
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
 * Public information about a queued task.
 *
 * Does not expose internal Promise callbacks
 * or cancellation controller.
 */
export interface AudioTaskInfo {
  id: string;

  track: AudioTrack;

  status: TaskStatus;
}

/**
 * Read-only description of the queue state.
 */
export interface QueueSnapshot {
  status: QueueStatus;

  pendingTasks: AudioTaskInfo[];

  activeTask: AudioTaskInfo | null;
}

/**
 * Public contract for the audio task queue.
 *
 * Actual implementation will be added in Task 2.
 */
export interface AudioTaskQueueInterface {
  enqueue(track: AudioTrack): Promise<AudioBuffer>;

  cancel(taskId: string): void;

  getSnapshot(): QueueSnapshot;
}