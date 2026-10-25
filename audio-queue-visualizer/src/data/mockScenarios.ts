import type {
  AudioTaskInfo,
  QueueSnapshot,
  TaskStatus,
} from "../types";

import { mockTracks } from "./mockTracks";

export type ScenarioId =
  | "empty"
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface DemoScenario {
  id: ScenarioId;
  label: string;
  description: string;
  tasks: AudioTaskInfo[];
  snapshot: QueueSnapshot;
}

/**
 * Create typed mock tasks.
 * No real queue processing occurs here.
 */
function createTasks(
  statuses: TaskStatus[]
): AudioTaskInfo[] {
  return statuses.map((status, index) => {
    const track = mockTracks[index];

    if (!track) {
      throw new Error(
        `Missing mock track at index ${index}`
      );
    }

    return {
      id: `task-${index + 1}`,
      track,
      status,
    };
  });
}

/**
 * Derive the queue snapshot from task data.
 *
 * Assumption for this UI:
 * only one task can be processing at a time.
 */
function createSnapshot(
  tasks: AudioTaskInfo[]
): QueueSnapshot {
  const activeTasks = tasks.filter(
    (task) => task.status === "processing"
  );

  if (activeTasks.length > 1) {
    throw new Error(
      "Mock queue cannot contain multiple active tasks."
    );
  }

  const activeTask = activeTasks[0] ?? null;

  return {
    status: activeTask ? "processing" : "idle",

    activeTask,

    pendingTasks: tasks.filter(
      (task) => task.status === "pending"
    ),
  };
}

function createScenario(
  id: ScenarioId,
  label: string,
  description: string,
  statuses: TaskStatus[]
): DemoScenario {
  const tasks = createTasks(statuses);

  return {
    id,
    label,
    description,
    tasks,
    snapshot: createSnapshot(tasks),
  };
}

export const demoScenarios: DemoScenario[] = [
  createScenario(
    "empty",
    "Empty",
    "There are no tasks in the queue.",
    []
  ),

  createScenario(
    "pending",
    "Pending",
    "Three tasks are waiting to be processed.",
    ["pending", "pending", "pending"]
  ),

  createScenario(
    "processing",
    "Processing",
    "One task is active and another is waiting.",
    ["completed", "processing", "pending"]
  ),

  createScenario(
    "completed",
    "Completed",
    "All tasks have completed successfully.",
    ["completed", "completed", "completed"]
  ),

  createScenario(
    "failed",
    "Failed",
    "A task has failed while other tasks are completed.",
    ["completed", "failed", "completed"]
  ),

  createScenario(
    "cancelled",
    "Cancelled",
    "A task has been cancelled.",
    ["completed", "cancelled", "pending"]
  ),
];

export const defaultScenarioId: ScenarioId = "processing";