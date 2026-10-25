import type {
  AudioTaskInfo,
  QueueSnapshot,
} from "../types";

import { mockTracks } from "./mockTracks";

/**
 * Mock data for visual UI development.
 *
 * This is not a real running FIFO queue.
 */

export const mockTasks: AudioTaskInfo[] =
  mockTracks.map((track, index) => {
    let status: AudioTaskInfo["status"] = "pending";

    if (index === 0) {
      status = "completed";
    } else if (index === 1) {
      status = "processing";
    }

    return {
      id: `task-${index + 1}`,
      track,
      status,
    };
  });

export const mockQueueSnapshot: QueueSnapshot = {
  status: "processing",

  activeTask: mockTasks[1] ?? null,

  pendingTasks: mockTasks.filter(
    (task) => task.status === "pending"
  ),
};