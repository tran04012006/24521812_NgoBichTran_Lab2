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

export interface AudioTask {
  id: string;
  track: AudioTrack;
  status: TaskStatus;

  controller: AbortController;

  resolve: (buffer: AudioBuffer) => void;
  reject: (reason?: unknown) => void;
}

export interface AudioTaskInfo {
  readonly id: string;
  readonly track: Readonly<AudioTrack>;
  readonly status: TaskStatus;
}

export interface QueueSnapshot {
  readonly status: QueueStatus;

  readonly pendingTasks:
    readonly AudioTaskInfo[];

  readonly activeTask:
    AudioTaskInfo | null;

  readonly history:
    readonly AudioTaskInfo[];
}

export type QueueListener = (
  snapshot: QueueSnapshot
) => void;

export type QueueUnsubscribe = () => void;

export interface AudioTaskQueueInterface {
  enqueue(
    track: AudioTrack
  ): Promise<AudioBuffer>;

  cancel(taskId: string): void;

  getSnapshot(): QueueSnapshot;

  subscribe(
    listener: QueueListener
  ): QueueUnsubscribe;

  /**
   * Cancel unfinished tasks and wait
   * for active processing to settle.
   */
  dispose(): Promise<void>;
}