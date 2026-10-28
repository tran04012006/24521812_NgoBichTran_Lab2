import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  frequencyBinCount: number;
  readFrequencyData: (data: Uint8Array) => boolean;
}

const BAR_COUNT = 48;

function AudioVisualizer({
  isPlaying,
  frequencyBinCount,
  readFrequencyData,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    const frequencyData =
      new Uint8Array(frequencyBinCount);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationId: number | null = null;
    let disposed = false;

    const draw = () => {
      if (disposed) return;

      context.fillStyle = "#0b1120";
      context.fillRect(0, 0, width, height);

      const hasData =
        isPlaying && readFrequencyData(frequencyData);

      const gap = 4;
      const barWidth =
        (width - (BAR_COUNT - 1) * gap) /
        BAR_COUNT;

      for (let i = 0; i < BAR_COUNT; i++) {
        let average = 0;

        if (hasData) {
          const start = Math.floor(
            i * frequencyData.length / BAR_COUNT
          );

          const end = Math.max(
            start + 1,
            Math.floor(
              (i + 1) * frequencyData.length /
              BAR_COUNT
            )
          );

          let sum = 0;

          for (let j = start; j < end; j++) {
            sum += frequencyData[j];
          }

          average = sum / (end - start);
        }

        const barHeight = hasData
          ? Math.max(2, average / 255 * (height - 8))
          : 4;

        const x = i * (barWidth + gap);

        context.fillStyle = hasData
          ? (i < BAR_COUNT / 2
              ? "#38bdf8"
              : "#a78bfa")
          : "#475569";

        context.fillRect(
          x,
          height - barHeight,
          barWidth,
          barHeight
        );
      }

      if (isPlaying && !prefersReducedMotion) {
        animationId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      disposed = true;

      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [
    isPlaying,
    frequencyBinCount,
    readFrequencyData,
  ]);

  return (
    <section
      className="panel audio-visualizer"
      aria-labelledby="audio-visualizer-heading"
    >
      <div className="panel-heading">
        <div>
          <p className="section-eyebrow">
            REAL-TIME FFT ANALYSIS
          </p>

          <h2 id="audio-visualizer-heading">
            Audio Visualizer
          </h2>
        </div>

        <span className="status-pill">
          {isPlaying ? "Live" : "Idle"}
        </span>
      </div>

      <div className="visualizer-container">
        <canvas
          ref={canvasRef}
          width={960}
          height={220}
          role="img"
          aria-label={
            isPlaying
              ? "Audio frequency spectrum"
              : "Audio visualizer is idle"
          }
        />
      </div>

      <div className="visualizer-labels">
        <span>Low Frequency</span>
        <span>High Frequency</span>
      </div>

      <p className="helper-text">
        FFT size: 256. Live frequency visualization
        using Web Audio API.
      </p>
    </section>
  );
}

export default AudioVisualizer;