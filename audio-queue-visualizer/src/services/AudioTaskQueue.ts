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

import {
  assertValidTransition,
} from "./taskStateMachine";

export type AudioProcessor = (
  track: AudioTrack,
  signal: AbortSignal
) => Promise<AudioBuffer>;

function createAbortError(): DOMException {
  return new DOMException(
    "Audio task was cancelled.",
    "AbortError"
  );
}

export class AudioTaskQueue
  implements AudioTaskQueueInterface {

  private pendingTasks: AudioTask[] = [];

  private activeTask: AudioTask | null = null;

  private history: AudioTaskInfo[] = [];

  private listeners = new Set<QueueListener>();

  private isProcessing = false;

  private disposed = false;

  private nextTaskId = 1;

  private processingPromise: Promise<void> | null = null;

  private disposePromise: Promise<void> | null = null;

  private currentSnapshot: QueueSnapshot =
    Object.freeze({
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
   * Add a new task.
   *
   * Once disposed, the queue permanently
   * refuses new work.
   */
  public enqueue(
    track: AudioTrack
  ): Promise<AudioBuffer> {
    if (this.disposed) {
      return Promise.reject(
        new Error(
          "Cannot enqueue into a disposed queue."
        )
      );
    }

    const promise = new Promise<AudioBuffer>(
      (resolve, reject) => {
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
      }
    );

    void this.startProcessing();

    return promise;
  }

  /**
   * Start one processing loop.
   */
  private startProcessing(): void {
    if (
      this.isProcessing ||
      this.disposed
    ) {
      return;
    }

    this.processingPromise = this.processNext();
  }

  /**
   * Cancel a pending or active task.
   */
  public cancel(taskId: string): void {
    const index = this.pendingTasks.findIndex(
      (task) => task.id === taskId
    );

    if (index >= 0) {
      const [task] = this.pendingTasks.splice(
        index,
        1
      );

      if (task) {
        this.cancelTask(task);
      }

      return;
    }

    const task = this.activeTask;

    if (
      task?.id === taskId &&
      task.status === "processing"
    ) {
      this.cancelTask(task);
    }
  }

  private cancelTask(task: AudioTask): void {
    assertValidTransition(
      task.status,
      "cancelled"
    );

    task.status = "cancelled";

    this.archiveTask(task);
    this.publishSnapshot();

    task.controller.abort();

    task.reject(createAbortError());
  }

  /**
   * Sequential FIFO processing.
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      while (
        !this.disposed &&
        this.pendingTasks.length > 0
      ) {
        const task = this.pendingTasks.shift();

        if (!task) {
          continue;
        }

        this.activeTask = task;

        this.transitionTask(
          task,
          "processing"
        );

        try {
          const buffer = await this.processor(
            task.track,
            task.controller.signal
          );

          if (task.status === "cancelled") {
            continue;
          }

          this.transitionTask(
            task,
            "completed"
          );

          this.archiveTask(task);
          this.publishSnapshot();

          task.resolve(buffer);
        } catch (error: unknown) {
          if (task.status === "cancelled") {
            continue;
          }

          this.transitionTask(
            task,
            "failed"
          );

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

  private transitionTask(
    task: AudioTask,
    nextStatus: TaskStatus
  ): void {
    assertValidTransition(
      task.status,
      nextStatus
    );

    task.status = nextStatus;

    this.publishSnapshot();
  }

  private toTaskInfo(
    task: AudioTask
  ): AudioTaskInfo {
    return Object.freeze({
      id: task.id,
      track: Object.freeze({ ...task.track }),
      status: task.status,
    });
  }

  private archiveTask(
    task: AudioTask
  ): void {
    const exists = this.history.some(
      (item) => item.id === task.id
    );

    if (!exists) {
      this.history.push(
        this.toTaskInfo(task)
      );
    }
  }

  public getSnapshot = (): QueueSnapshot => {
    return this.currentSnapshot;
  };

  public subscribe = (
    listener: QueueListener
  ): QueueUnsubscribe => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  private publishSnapshot(): void {
    this.currentSnapshot = Object.freeze({
      status: this.isProcessing
        ? "processing"
        : "idle",

      pendingTasks: Object.freeze(
        this.pendingTasks.map(
          (task) => this.toTaskInfo(task)
        )
      ),

      activeTask: this.activeTask
        ? this.toTaskInfo(this.activeTask)
        : null,

      history: Object.freeze(
        [...this.history]
      ),
    });

    for (const listener of this.listeners) {
      try {
        listener(this.currentSnapshot);
      } catch (error) {
        console.error(
          "Queue listener error:",
          error
        );
      }
    }
  }

  /**
   * Shutdown the queue.
   *
   * 1. Refuse new tasks.
   * 2. Cancel pending tasks.
   * 3. Abort active task.
   * 4. Wait for the processor to settle.
   * 5. Release listeners.
   */
  public dispose(): Promise<void> {
    if (this.disposePromise) {
      return this.disposePromise;
    }

    this.disposed = true;

    // Make a copy because cancel() modifies the queue.
    const pendingIds = this.pendingTasks.map(
      (task) => task.id
    );

    for (const taskId of pendingIds) {
      this.cancel(taskId);
    }

    const activeId = this.activeTask?.id;

    if (activeId) {
      this.cancel(activeId);
    }

    const processing = this.processingPromise;

    this.disposePromise = (async () => {
      try {
        if (processing) {
          await processing;
        }
      } finally {
        this.listeners.clear();
      }
    })();

    return this.disposePromise;
  }

  public get isDisposed(): boolean {
    return this.disposed;
  }
}