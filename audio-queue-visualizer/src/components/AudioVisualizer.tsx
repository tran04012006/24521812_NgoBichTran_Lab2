import { useEffect, useRef } from "react";

const DEMO_FREQUENCIES = [
  24, 38, 52, 75, 98, 122, 109, 86,
  64, 92, 143, 170, 131, 100, 74, 59,
  91, 124, 152, 117, 88, 63, 49, 72,
  101, 82, 57, 44, 34, 26, 18, 12,
];

function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    context.clearRect(0, 0, width, height);

    const barCount = DEMO_FREQUENCIES.length;
    const gap = 5;
    const barWidth =
      (width - gap * (barCount - 1)) / barCount;

    DEMO_FREQUENCIES.forEach((frequency, index) => {
      const barHeight = (frequency / 255) * height;

      const x = index * (barWidth + gap);
      const y = height - barHeight;

      context.fillStyle = "#38bdf8";

      context.fillRect(
        x,
        y,
        barWidth,
        barHeight
      );
    });
  }, []);

  return (
    <section
      className="panel audio-visualizer"
      aria-labelledby="audio-visualizer-heading"
    >
      <div className="panel-heading">
        <div>
          <p className="section-eyebrow">
            FREQUENCY ANALYSIS
          </p>

          <h2 id="audio-visualizer-heading">
            Audio Visualizer
          </h2>
        </div>

        <span className="status-pill">
          Static preview
        </span>
      </div>

      <div className="visualizer-container">
        <canvas
          ref={canvasRef}
          width={960}
          height={220}
          role="img"
          aria-label="Static demonstration of audio frequency bars. Not live audio data."
        />
      </div>

      <div className="visualizer-labels">
        <span>Low frequency</span>
        <span>High frequency</span>
      </div>

      <p className="helper-text">
        Live FFT analysis will be implemented
        in Task 5 and Task 6.
      </p>
    </section>
  );
}

export default AudioVisualizer;