import type { AudioTrack } from "../types";

interface AudioPlayerProps {
  track: AudioTrack | null;
}

function formatDuration(seconds?: number): string {
  if (seconds === undefined) {
    return "--:--";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function AudioPlayer({ track }: AudioPlayerProps) {
  return (
    <section
      className="panel audio-player"
      aria-labelledby="audio-player-heading"
    >
      <div className="panel-heading">
        <div>
          <p className="section-eyebrow">PLAYBACK</p>

          <h2 id="audio-player-heading">
            Audio Player
          </h2>
        </div>

        <span className="status-pill">
          Not playing
        </span>
      </div>

      <div className="player-content">
        <div
          className="track-artwork"
          aria-hidden="true"
        >
          <span>♫</span>
        </div>

        <div className="track-information">
          <p className="track-label">
            SELECTED TRACK
          </p>

          <h3>
            {track?.title ?? "No track selected"}
          </h3>

          <p>
            {track
              ? "Ready for future audio integration"
              : "Choose a track to get started"}
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
          aria-valuetext="No playback in progress"
        >
          <div className="progress-fill" />
        </div>

        <div className="time-labels">
          <span>0:00</span>

          <span>
            {formatDuration(track?.duration)}
          </span>
        </div>
      </div>

      <div className="player-controls">
        <button type="button" disabled>
          Play
        </button>

        <button type="button" disabled>
          Stop
        </button>
      </div>

      <p className="helper-text">
        Playback controls will be enabled after
        the audio engine is implemented.
      </p>
    </section>
  );
}

export default AudioPlayer;