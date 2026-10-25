import { useRef, useState } from "react";

import type { AudioTrack } from "../types";

interface QueueControlsProps {
  tracks: AudioTrack[];

  onEnqueue: (
    track: AudioTrack
  ) => Promise<AudioBuffer>;
}

interface RequestResult {
  id: number;
  trackTitle: string;

  status: "completed" | "failed" | "cancelled";

  message: string;
}

function QueueControls({
  tracks,
  onEnqueue,
}: QueueControlsProps) {
  const [selectedTrackId, setSelectedTrackId] =
    useState(tracks[0]?.id ?? "");

  const [results, setResults] = useState<
    RequestResult[]
  >([]);

  const nextResultId = useRef(1);

  const addResult = (
    trackTitle: string,
    status: RequestResult["status"],
    message: string
  ) => {
    const result: RequestResult = {
      id: nextResultId.current++,
      trackTitle,
      status,
      message,
    };

    setResults((previous) => [
      result,
      ...previous,
    ].slice(0, 10));
  };

  const enqueueTrack = (track: AudioTrack) => {
    /*
     * Attach both fulfillment and rejection
     * handlers immediately.
     */
    void onEnqueue(track).then(
      (buffer) => {
        addResult(
          track.title,
          "completed",
          `Decoded successfully | ` +
          `Duration: ${buffer.duration.toFixed(2)}s | ` +
          `Sample rate: ${buffer.sampleRate}Hz | ` +
          `Channels: ${buffer.numberOfChannels}`
        );
      },

      (error: unknown) => {
        const isCancelled =
          error instanceof Error &&
          error.name === "AbortError";

        const message =
          error instanceof Error
            ? error.message
            : String(error);

        addResult(
          track.title,
          isCancelled ? "cancelled" : "failed",
          isCancelled
            ? "Audio loading cancelled."
            : `Error: ${message}`
        );
      }
    );
  };

  const handleAddTrack = () => {
    const selectedTrack = tracks.find(
      (track) => track.id === selectedTrackId
    );

    if (!selectedTrack) {
      return;
    }

    enqueueTrack(selectedTrack);
  };

  const handleAddAll = () => {
    tracks.forEach((track) => {
      enqueueTrack(track);
    });
  };

  return (
    <section
      className="panel"
      aria-labelledby="queue-controls-heading"
    >
      <div className="panel-heading">
        <div>
          <p className="section-eyebrow">
            REAL AUDIO PROCESSING
          </p>

          <h2 id="queue-controls-heading">
            Add Audio Tasks
          </h2>
        </div>

        <span className="status-pill">
          Web Audio API
        </span>
      </div>

      <p className="helper-text">
        Audio tasks are downloaded and decoded
        sequentially by the FIFO Queue Engine.
      </p>

      <div className="queue-controls-form">
        <label htmlFor="queue-track-select">
          Select Track
        </label>

        <select
          id="queue-track-select"
          value={selectedTrackId}
          onChange={(event) =>
            setSelectedTrackId(event.target.value)
          }
          disabled={tracks.length === 0}
        >
          {tracks.map((track) => (
            <option
              key={track.id}
              value={track.id}
            >
              {track.title}
            </option>
          ))}
        </select>

        <div className="queue-control-buttons">
          <button
            type="button"
            onClick={handleAddTrack}
            disabled={tracks.length === 0}
          >
            Add Track
          </button>

          <button
            type="button"
            onClick={handleAddAll}
            disabled={tracks.length === 0}
          >
            Add All Tracks
          </button>
        </div>
      </div>

      <div className="queue-request-results">
        <h3>Audio Processing Results</h3>

        {results.length === 0 ? (
          <p>No processed audio requests yet.</p>
        ) : (
          <ul aria-label="Recent audio processing results">
            {results.map((result) => (
              <li key={result.id}>
                <strong>{result.trackTitle}</strong>
                {" — "}

                <span
                  className={
                    `request-status request-status--${result.status}`
                  }
                >
                  {result.status}
                </span>

                <p>{result.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default QueueControls;