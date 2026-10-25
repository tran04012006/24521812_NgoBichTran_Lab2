import { useState } from "react";

import { mockTracks } from "../data/mockTracks";

import {
  AudioTaskQueue,
} from "../services/AudioTaskQueue";

import type {
  AudioProcessor,
} from "../services/AudioTaskQueue";

import {
  createMockAudioProcessor,
} from "../services/createMockAudioProcessor";

import type {
  QueueSnapshot,
} from "../types";

type TestMode = "success" | "failure";

function QueueTestPanel() {
  const [logs, setLogs] = useState<string[]>([]);

  const [isRunning, setIsRunning] = useState(false);

  const [finalSnapshot, setFinalSnapshot] =
    useState<QueueSnapshot | null>(null);

  const runTest = async (mode: TestMode) => {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    setLogs([]);
    setFinalSnapshot(null);

    const output: string[] = [];

    const addLog = (message: string) => {
      output.push(message);
      setLogs([...output]);
    };

    const baseProcessor = createMockAudioProcessor(
      (title) => addLog(`START: ${title}`),

      (title) => addLog(`FINISH: ${title}`)
    );

    /**
     * Failure mode:
     * Simulate a processing error for Song B.
     */
    const processor: AudioProcessor =
      async (track, signal) => {
        const buffer = await baseProcessor(
          track,
          signal
        );

        if (
          mode === "failure" &&
          track.id === "track-2"
        ) {
          throw new Error(
            "Simulated processing failure for Song B"
          );
        }

        return buffer;
      };

    const queue = new AudioTaskQueue(processor);

    const unsubscribe = queue.subscribe((snapshot) => {
      const active =
        snapshot.activeTask?.track.title ?? "None";

      const pending = snapshot.pendingTasks.length;

      const history = snapshot.history.length;

      addLog(
        `STATE: ${snapshot.status} | ` +
        `Active: ${active} | ` +
        `Pending: ${pending} | ` +
        `History: ${history}`
      );
    });

    try {
      const promises = mockTracks.map((track) =>
        queue.enqueue(track)
      );

      addLog("All tracks enqueued.");

      const results = await Promise.allSettled(
        promises
      );

      results.forEach((result, index) => {
        const title = mockTracks[index].title;

        if (result.status === "fulfilled") {
          addLog(`RESOLVED: ${title}`);
        } else {
          addLog(`REJECTED: ${title}`);
        }
      });

      // processNext may still be finishing its final
      // synchronous cleanup when Promise callbacks run.
      // One microtask gives that cleanup a chance to finish.
      await Promise.resolve();

      const snapshot = queue.getSnapshot();

      setFinalSnapshot(snapshot);

      addLog("TEST FINISHED");
    } catch (error: unknown) {
      addLog(`UNEXPECTED ERROR: ${String(error)}`);
    } finally {
      unsubscribe();
      setIsRunning(false);
    }
  };

  return (
    <section
      className="panel"
      aria-labelledby="queue-test-heading"
    >
      <div className="panel-heading">
        <div>
          <p className="section-eyebrow">
            TASK 2 — STEP 2
          </p>

          <h2 id="queue-test-heading">
            Queue Lifecycle Test
          </h2>
        </div>
      </div>

      <p className="helper-text">
        Test FIFO execution, task lifecycle,
        subscriptions, and failure recovery.
      </p>

      <div className="player-controls">
        <button
          type="button"
          disabled={isRunning}
          onClick={() => void runTest("success")}
        >
          Run Success Test
        </button>

        <button
          type="button"
          disabled={isRunning}
          onClick={() => void runTest("failure")}
        >
          Run Failure Test
        </button>
      </div>

      <pre
        className="queue-test-output"
        aria-label="Queue lifecycle test output"
      >
        {logs.length > 0
          ? logs.join("\n")
          : "No test has been executed."}
      </pre>

      {finalSnapshot && (
        <div className="queue-test-summary">
          <h3>Final Queue Snapshot</h3>

          <p>
            Queue Status: {finalSnapshot.status}
          </p>

          <p>
            Pending Tasks:{" "}
            {finalSnapshot.pendingTasks.length}
          </p>

          <p>
            History Count:{" "}
            {finalSnapshot.history.length}
          </p>

          <ul>
            {finalSnapshot.history.map((task) => (
              <li key={task.id}>
                {task.track.title}: {task.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default QueueTestPanel;