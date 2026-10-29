
import { useCountdown } from "../hooks/useCountdown";
import { formatCountdown } from "../utils/time";

interface FlashSaleHeaderProps {
  durationMs: number;
}

export default function FlashSaleHeader({
  durationMs,
}: FlashSaleHeaderProps) {
  const {
    remainingMs,
    status,
    pause,
    resume,
    restart,
  } = useCountdown(durationMs);

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isCompleted = status === "completed";

  return (
    <header className="flash-sale-header">
      <div className="header-content">
        <span className="sale-badge">
          11.11 MEGA SALE
        </span>

        <h1>Vietnam Flash Sale</h1>

        <p>
          Discover amazing products at
          incredible prices.
        </p>

        <div className="countdown-section">
          <span className="countdown-label">
            Flash Sale Ends In
          </span>

          <div
            className="countdown-display"
            role="timer"
            aria-label="Flash Sale remaining time"
          >
            {formatCountdown(remainingMs)}
          </div>

          <p className="countdown-note">
            {isCompleted
              ? "Flash Sale has ended!"
              : isPaused
                ? "Countdown is paused."
                : "Countdown is running."}
          </p>

          <div className="timer-controls">
            <button
              type="button"
              onClick={pause}
              disabled={!isRunning}
              className="timer-button pause-button"
            >
              Pause
            </button>

            <button
              type="button"
              onClick={resume}
              disabled={!isPaused}
              className="timer-button resume-button"
            >
              Resume
            </button>

            <button
              type="button"
              onClick={restart}
              className="timer-button restart-button"
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
