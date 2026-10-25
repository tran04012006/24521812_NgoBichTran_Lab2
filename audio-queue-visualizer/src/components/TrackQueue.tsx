import type {
  AudioTaskInfo,
  QueueSnapshot,
  TaskStatus,
} from "../types";

interface TrackQueueProps {
  snapshot: QueueSnapshot;
  onCancel: (taskId: string) => void;
}

const statusLabels: Record<TaskStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

interface TaskItemProps {
  task: AudioTaskInfo;
  onCancel?: (taskId: string) => void;
}

function TaskItem({
  task,
  onCancel,
}: TaskItemProps) {
  const canCancel =
    task.status === "pending" ||
    task.status === "processing";

  return (
    <li className="track-item">
      <div className="track-item-info">
        <span className="track-item-title">
          {task.track.title}
        </span>

        <span className="track-item-id">
          {task.id}
        </span>

        <span
          className={
            `task-status task-status--${task.status}`
          }
        >
          {statusLabels[task.status]}
        </span>
      </div>

      {canCancel && onCancel && (
        <button
          type="button"
          className="queue-cancel-button"
          onClick={() => onCancel(task.id)}
          aria-label={
            `Cancel ${task.track.title}, ${task.id}`
          }
        >
          Cancel
        </button>
      )}
    </li>
  );
}

function TrackQueue({
  snapshot,
  onCancel,
}: TrackQueueProps) {
  const completedCount = snapshot.history.filter(
    (task) => task.status === "completed"
  ).length;

  const pendingCount = snapshot.pendingTasks.length;

  const activeTask = snapshot.activeTask;

  const activeTasks = activeTask
    ? [activeTask]
    : [];

  return (
    <section
      className="panel track-queue"
      aria-labelledby="track-queue-heading"
    >
      <div className="panel-heading">
        <div>
          <p className="section-eyebrow">
            LIVE TASK MANAGEMENT
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
          <strong>
            {pendingCount +
              activeTasks.length +
              snapshot.history.filter(
                (task) =>
                  task.id !== activeTask?.id
              ).length}
          </strong>

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

      <div className="queue-group">
        <h3>Active Task</h3>

        {activeTask ? (
          <ol className="track-list">
            <TaskItem
              task={activeTask}
              onCancel={onCancel}
            />
          </ol>
        ) : (
          <p className="queue-empty">
            No active task.
          </p>
        )}
      </div>

      <div className="queue-group">
        <h3>
          Pending Tasks ({pendingCount})
        </h3>

        {pendingCount > 0 ? (
          <ol className="track-list">
            {snapshot.pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onCancel={onCancel}
              />
            ))}
          </ol>
        ) : (
          <p className="queue-empty">
            No pending tasks.
          </p>
        )}
      </div>

      <div className="queue-group">
        <h3>
          Task History ({snapshot.history.length})
        </h3>

        {snapshot.history.length > 0 ? (
          <ol className="track-list">
            {snapshot.history.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
              />
            ))}
          </ol>
        ) : (
          <p className="queue-empty">
            No completed tasks yet.
          </p>
        )}
      </div>

      <p className="helper-text">
        Live FIFO queue state using a simulated
        audio processor.
      </p>
    </section>
  );
}

export default TrackQueue;