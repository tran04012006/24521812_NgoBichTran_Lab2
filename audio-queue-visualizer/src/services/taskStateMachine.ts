import type { TaskStatus } from "../types";

const validTransitions: Record<
  TaskStatus,
  readonly TaskStatus[]
> = {
  pending: [
    "processing",
    "cancelled",
  ],

  processing: [
    "completed",
    "failed",
    "cancelled",
  ],

  completed: [],

  failed: [],

  cancelled: [],
};

export function canTransition(
  from: TaskStatus,
  to: TaskStatus
): boolean {
  return validTransitions[from].includes(to);
}

export function assertValidTransition(
  from: TaskStatus,
  to: TaskStatus
): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid task transition: ${from} -> ${to}`
    );
  }
}