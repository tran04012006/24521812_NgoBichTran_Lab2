import AudioPlayer from "./components/AudioPlayer";
import TrackQueue from "./components/TrackQueue";
import AudioVisualizer from "./components/AudioVisualizer";

import QueueControls from "./components/QueueControls";
import QueueTestPanel from "./components/QueueTestPanel";
import CancellationTestPanel from
  "./components/CancellationTestPanel";

import { useAudioQueue } from "./hooks/useAudioQueue";

import { mockTracks } from "./data/mockTracks";

import "./styles/App.css";

function App() {
  const {
    snapshot,
    enqueue,
    cancel,
  } = useAudioQueue();

  const selectedTrack =
    snapshot.activeTask?.track ??
    snapshot.pendingTasks[0]?.track ??
    null;

  return (
    <main className="app">
      <header className="app-header">
        <span className="app-badge">
          HOMEWORK 2
        </span>

        <h1>
          Concurrent FIFO Audio Visualizer
        </h1>

        <p>
          An audio player powered by FIFO queue
          management, Web Audio API, and real-time
          frequency analysis.
        </p>
      </header>

      <QueueControls
        tracks={mockTracks}
        onEnqueue={enqueue}
      />

      <div className="dashboard">
        <AudioPlayer track={selectedTrack} />

        <TrackQueue
          snapshot={snapshot}
          onCancel={cancel}
        />

        <AudioVisualizer />
      </div>

      <div className="queue-test-section">
        <QueueTestPanel />
      </div>

      <div className="cancellation-test-section">
        <CancellationTestPanel />
      </div>
    </main>
  );
}

export default App;