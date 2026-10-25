import { useState } from "react";

import {
  runCancellationTest,
} from "../services/queueCancellationTests";

import type {
  CancellationTestName,
  CancellationTestResult,
} from "../services/queueCancellationTests";

const testCases: {
  id: CancellationTestName;
  label: string;
}[] = [
  {
    id: "pending",
    label: "Cancel Pending",
  },
  {
    id: "active",
    label: "Cancel Active",
  },
  {
    id: "unknown",
    label: "Cancel Unknown",
  },
  {
    id: "late",
    label: "Late Result",
  },
];

function CancellationTestPanel() {
  const [running, setRunning] =
    useState(false);

  const [result, setResult] =
    useState<CancellationTestResult | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const executeTest = async (
    name: CancellationTestName
  ) => {
    if (running) {
      return;
    }

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const testResult =
        await runCancellationTest(name);

      setResult(testResult);
    } catch (reason: unknown) {
      const message =
        reason instanceof Error
          ? reason.message
          : String(reason);

      setError(message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <section
      className="panel"
      aria-labelledby="cancellation-test-heading"
    >
      <div className="panel-heading">
        <div>
          <p className="section-eyebrow">
            TASK 2 — STEP 3
          </p>

          <h2 id="cancellation-test-heading">
            Cancellation Tests
          </h2>
        </div>
      </div>

      <p className="helper-text">
        Test pending cancellation, active
        cancellation, unknown task IDs,
        and late asynchronous results.
      </p>

      <div className="cancellation-actions">
        {testCases.map((test) => (
          <button
            key={test.id}
            type="button"
            disabled={running}
            onClick={() => void executeTest(test.id)}
          >
            {test.label}
          </button>
        ))}
      </div>

      {running && (
        <p role="status">
          Running cancellation test...
        </p>
      )}

      {error && (
        <p
          className="test-error"
          role="alert"
        >
          Test failed: {error}
        </p>
      )}

      {result && (
        <div className="test-result">
          <p
            className="test-success"
            role="status"
          >
            {result.passed
              ? "Test passed"
              : "Test failed"}
          </p>

          <pre className="queue-test-output">
            {result.logs.join("\n")}
          </pre>

          <h3>Final Task History</h3>

          <ul>
            {result.snapshot.history.map((task) => (
              <li key={task.id}>
                {task.id} — {task.track.title}:{" "}
                {task.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default CancellationTestPanel;