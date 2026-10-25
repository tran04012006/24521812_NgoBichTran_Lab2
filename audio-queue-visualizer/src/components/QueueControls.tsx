import { useRef, useState } from "react";

import type { AudioTrack } from "../types";

interface QueueControlsProps {
  tracks: AudioTrack[];

  onEnqueue: (
    track: AudioTrack
  ) => Promise<AudioBuffer>;
}

type RequestResult = {
  id: number;
  message: string;
};

function QueueControls({
  tracks,
  onEnqueue,
}: QueueControlsProps) {
  const [selectedTrackId, setSelectedTrackId] =
    useState(tracks[0]?.id ?? "");

  const [results, setResults] = useState<RequestResult[]>(
    []
  );

  const nextResultId = useRef(1);

  const addResult = (message: string) => {
    const result: RequestResult = {
      id: nextResultId.current++,
      message,
    };

    setResults((previous) => [
      result,
      ...previous,
    ].slice(0, 8));
  };

  const enqueueTrack = (track: AudioTrack) => {
    // Do not await here: queue requests must be
    // submitted without waiting for earlier ones.
    void onEnqueue(track).then(
      () => {
        addResult(`${track.title}: Completed`);
      },
      (error: unknown) => {
        const message =
          error instanceof Error
            ? error.name
            : String(error);

        addResult(
          `${track.title}: ${message}`
        );
      }
    );
  };

  const handleAddTrack = () => {
    const track = tracks.find(
      (item) => item.id === selectedTrackId
    );

    if (!track) {
      return;
    }

    enqueueTrack(track);
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
            LIVE QUEUE CONTROLS
          </p>

          <h2 id="queue-controls-heading">
            Add Audio Tasks
          </h2>
        </div>

        <span className="status-pill">
          Mock Processor
        </span>
      </div>

      <p className="helper-text">
        Add one or more audio tasks to the real
        FIFO Queue Engine. Processing is simulated.
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
        <h3>Request Results</h3>

        {results.length === 0 ? (
          <p>No completed requests yet.</p>
        ) : (
          <ul aria-label="Recent request results">
            {results.map((result) => (
              <li key={result.id}>
                {result.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default QueueControls;