import type { AudioTrack } from "../types";

interface AudioPlayerProps {
  track: AudioTrack | null;
  duration: number | null;
  isPlaying: boolean;
  playbackError: string | null;

  onPlay: () => Promise<void>;
  onStop: () => void;
}

function formatDuration(seconds: number | null): string {
  if (
    seconds === null ||
    !Number.isFinite(seconds)
  ) {
    return "--:--";
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function AudioPlayer({
  track,
  duration,
  isPlaying,
  playbackError,
  onPlay,
  onStop,
}: AudioPlayerProps) {
  const hasAudio = track !== null;

  return (
    <section
      className="panel audio-player"
      aria-labelledby="audio-player-heading"
    >
      <div className="panel-heading">
        <div>
          <p className="section-eyebrow">
            AUDIO PLAYBACK
          </p>

          <h2 id="audio-player-heading">
            Audio Player
          </h2>
        </div>

        <span className="status-pill">
          {isPlaying ? "Playing" : "Stopped"}
        </span>
      </div>

      <div className="player-content">
        <div
          className="track-artwork"
          aria-hidden="true"
        >
          ♫
        </div>

        <div className="track-information">
          <p className="track-label">
            DECODED TRACK
          </p>

          <h3>
            {track?.title ?? "No track loaded"}
          </h3>

          <p>
            {hasAudio
              ? "Audio is ready for playback."
              : "Add a track and wait for decoding."}
          </p>
        </div>
      </div>

      <div className="progress-section">
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          aria-valuetext="Playback position tracking not implemented"
        >
          <div className="progress-fill" />
        </div>

        <div className="time-labels">
          <span>--:--</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      <div className="player-controls">
        <button
          type="button"
          onClick={() => void onPlay()}
          disabled={!hasAudio}
        >
          {isPlaying ? "Restart" : "Play"}
        </button>

        <button
          type="button"
          onClick={onStop}
          disabled={!isPlaying}
        >
          Stop
        </button>
      </div>

      {playbackError && (
        <p className="playback-error" role="alert">
          {playbackError}
        </p>
      )}

      <p className="helper-text">
        A new AudioBufferSourceNode is created
        for every playback. Playback seeking and
        progress tracking are not implemented yet.
      </p>
    </section>
  );
}

export default AudioPlayer;