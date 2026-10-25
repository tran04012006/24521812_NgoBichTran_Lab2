import AudioPlayer from "./components/AudioPlayer";
import TrackQueue from "./components/TrackQueue";
import AudioVisualizer from "./components/AudioVisualizer";

import QueueControls from "./components/QueueControls";
import QueueTestPanel from "./components/QueueTestPanel";

import CancellationTestPanel from
  "./components/CancellationTestPanel";

import AudioDecodeTestPanel from
  "./components/AudioDecodeTestPanel";

import { useAudioQueue } from "./hooks/useAudioQueue";

import { mockTracks } from "./data/mockTracks";

import "./styles/App.css";

function App() {
  const {
    snapshot,
    enqueue,
    cancel,

    loadedAudio,
    isPlaying,
    playbackError,
    play,
    stop,
  } = useAudioQueue();

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
          FIFO queue management, real audio decoding,
          and audio playback using Web Audio API.
        </p>
      </header>

      <QueueControls
        tracks={mockTracks}
        onEnqueue={enqueue}
      />

      <div className="dashboard">
        <AudioPlayer
          track={loadedAudio?.track ?? null}
          duration={loadedAudio?.buffer.duration ?? null}
          isPlaying={isPlaying}
          playbackError={playbackError}
          onPlay={play}
          onStop={stop}
        />

        <TrackQueue
          snapshot={snapshot}
          onCancel={cancel}
        />

        <AudioVisualizer />
      </div>

      <div className="audio-decode-test-section">
        <AudioDecodeTestPanel />
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