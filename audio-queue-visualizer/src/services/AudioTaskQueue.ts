import type {
  AudioTask,
  AudioTaskInfo,
  AudioTaskQueueInterface,
  AudioTrack,
  QueueListener,
  QueueSnapshot,
  QueueUnsubscribe,
  TaskStatus,
} from "../types";

import { assertValidTransition } from "./taskStateMachine";

export type AudioProcessor = (
  track: AudioTrack,
  signal: AbortSignal,
) => Promise<AudioBuffer>;

function createAbortError(): DOMException {
  return new DOMException("Audio task was cancelled.", "AbortError");
}

/**
 * A single-consumer FIFO queue.
 *
 * Only one processor runs at a time.
 */
export class AudioTaskQueue implements AudioTaskQueueInterface {
  private pendingTasks: AudioTask[] = [];

  private activeTask: AudioTask | null = null;

  private history: AudioTaskInfo[] = [];

  private listeners = new Set<QueueListener>();

  private isProcessing = false;

  private nextTaskId = 1;

  private currentSnapshot: QueueSnapshot = Object.freeze({
    status: "idle",
    pendingTasks: Object.freeze([]),
    activeTask: null,
    history: Object.freeze([]),
  });
  private readonly processor: AudioProcessor;

  constructor(processor: AudioProcessor) {
    this.processor = processor;
  }

  /**
   * Enqueue a new audio task.
   */
  public enqueue(track: AudioTrack): Promise<AudioBuffer> {
    const promise = new Promise<AudioBuffer>((resolve, reject) => {
      const task: AudioTask = {
        id: `task-${this.nextTaskId++}`,
        track: { ...track },
        status: "pending",
        controller: new AbortController(),
        resolve,
        reject,
      };

      this.pendingTasks.push(task);
      this.publishSnapshot();
    });

    void this.processNext();

    return promise;
  }

  /**
   * Cancel a pending or active task.
   *
   * Unknown and already finished IDs
   * are ignored.
   */
  public cancel(taskId: string): void {
    const index = this.pendingTasks.findIndex((task) => task.id === taskId);

    if (index >= 0) {
      const [task] = this.pendingTasks.splice(index, 1);

      if (task) {
        this.cancelTask(task);
      }

      return;
    }

    const task = this.activeTask;

    if (task?.id === taskId && task.status === "processing") {
      this.cancelTask(task);
    }
  }

  /**
   * Cancellation settles the public Promise
   * immediately.
   *
   * The processing loop still waits for the
   * underlying processor to finish.
   */
  private cancelTask(task: AudioTask): void {
    assertValidTransition(task.status, "cancelled");

    task.status = "cancelled";

    this.archiveTask(task);
    this.publishSnapshot();

    task.controller.abort();
    task.reject(createAbortError());
  }

  /**
   * Run one sequential processing loop.
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.pendingTasks.length > 0) {
        const task = this.pendingTasks.shift();

        if (!task) {
          continue;
        }

        this.activeTask = task;

        this.transitionTask(task, "processing");

        try {
          const buffer = await this.processor(
            task.track,
            task.controller.signal,
          );

          if (task.status === "cancelled") {
            continue;
          }

          this.transitionTask(task, "completed");

          this.archiveTask(task);
          this.publishSnapshot();

          task.resolve(buffer);
        } catch (error: unknown) {
          if (task.status === "cancelled") {
            continue;
          }

          this.transitionTask(task, "failed");

          this.archiveTask(task);
          this.publishSnapshot();

          task.reject(error);
        } finally {
          this.activeTask = null;
          this.publishSnapshot();
        }
      }
    } finally {
      this.isProcessing = false;
      this.publishSnapshot();
    }
  }

  /**
   * Apply a valid state transition.
   */
  private transitionTask(task: AudioTask, nextStatus: TaskStatus): void {
    assertValidTransition(task.status, nextStatus);

    task.status = nextStatus;

    this.publishSnapshot();
  }

  /**
   * Convert an internal task to immutable
   * public task information.
   */
  private toTaskInfo(task: AudioTask): AudioTaskInfo {
    return Object.freeze({
      id: task.id,

      track: Object.freeze({
        ...task.track,
      }),

      status: task.status,
    });
  }

  /**
   * Store a terminal task once.
   */
  private archiveTask(task: AudioTask): void {
    const exists = this.history.some((item) => item.id === task.id);

    if (exists) {
      return;
    }

    this.history.push(this.toTaskInfo(task));
  }

  /**
   * Read a stable, immutable snapshot.
   */
  public getSnapshot = (): QueueSnapshot => {
    return this.currentSnapshot;
  };

  /**
   * Subscribe to queue changes.
   */
  public subscribe = (listener: QueueListener): QueueUnsubscribe => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  /**
   * Create and publish the next snapshot.
   */
  private publishSnapshot(): void {
    const pendingTasks = Object.freeze(
      this.pendingTasks.map((task) => this.toTaskInfo(task)),
    );

    const history = Object.freeze([...this.history]);

    this.currentSnapshot = Object.freeze({
      status: this.isProcessing ? "processing" : "idle",

      pendingTasks,

      activeTask: this.activeTask ? this.toTaskInfo(this.activeTask) : null,

      history,
    });

    for (const listener of this.listeners) {
      try {
        listener(this.currentSnapshot);
      } catch (error) {
        console.error("Queue listener error:", error);
      }
    }
  }
}
