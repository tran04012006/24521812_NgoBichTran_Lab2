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

function createSnapshot(
  tasks: AudioTaskInfo[]
): QueueSnapshot {
  const activeTasks = tasks.filter(
    (task) => task.status === "processing"
  );

  if (activeTasks.length > 1) {
    throw new Error(
      "Mock queue cannot have multiple active tasks."
    );
  }

  const activeTask = activeTasks[0] ?? null;

  return {
    status: activeTask ? "processing" : "idle",

    activeTask,

    pendingTasks: tasks.filter(
      (task) => task.status === "pending"
    ),

    history: tasks.filter(
      (task) =>
        task.status === "completed" ||
        task.status === "failed" ||
        task.status === "cancelled"
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
    "All tasks completed successfully.",
    ["completed", "completed", "completed"]
  ),

  createScenario(
    "failed",
    "Failed",
    "One task failed during processing.",
    ["completed", "failed", "completed"]
  ),

  createScenario(
    "cancelled",
    "Cancelled",
    "One task was cancelled.",
    ["completed", "cancelled", "pending"]
  ),
];

export const defaultScenarioId: ScenarioId =
  "processing";