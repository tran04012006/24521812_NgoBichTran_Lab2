import type {
  AudioTaskInfo,
  QueueSnapshot,
  TaskStatus,
} from "../types";

interface TrackQueueProps {
  tasks: AudioTaskInfo[];
  snapshot: QueueSnapshot;
}

const statusLabels: Record<TaskStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

function TrackQueue({
  tasks,
  snapshot,
}: TrackQueueProps) {
  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const pendingCount = tasks.filter(
    (task) => task.status === "pending"
  ).length;

  return (
    <section
      className="panel track-queue"
      aria-labelledby="track-queue-heading"
    >
      <div className="panel-heading">
        <div>
          <p className="section-eyebrow">
            TASK MANAGEMENT
          </p>

          <h2 id="track-queue-heading">
            Track Queue
          </h2>
        </div>

        <span className="status-pill">
          {snapshot.status}
        </span>
      </div>

      <div className="queue-summary">
        <div>
          <strong>{tasks.length}</strong>
          <span>Total</span>
        </div>

        <div>
          <strong>{pendingCount}</strong>
          <span>Pending</span>
        </div>

        <div>
          <strong>{completedCount}</strong>
          <span>Completed</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="queue-empty">
          No audio tasks available.
        </div>
      ) : (
        <ol className="track-list">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="track-item"
            >
              <div className="track-item-info">
                <span className="track-item-title">
                  {task.track.title}
                </span>

                <span className="track-item-id">
                  {task.id}
                </span>
              </div>

              <span
                className={`task-status task-status--${task.status}`}
              >
                {statusLabels[task.status]}
              </span>
            </li>
          ))}
        </ol>
      )}

      <p className="helper-text">
        Demo queue states only. FIFO processing
        will be implemented in Task 2.
      </p>
    </section>
  );
}

export default TrackQueue;