import { useEffect, useRef, useState } from "react";

import { AudioEngine } from "../services/AudioEngine";

import type { AudioTrack } from "../types";

const testTrack: AudioTrack = {
  id: "decode-test-1",
  title: "Song A",
  url: "/audio/song-a.mp3",
};

function AudioDecodeTestPanel() {
  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState(
    "No audio has been decoded yet."
  );

  const [duration, setDuration] =
    useState<number | null>(null);

  const [sampleRate, setSampleRate] =
    useState<number | null>(null);

  const controllerRef =
    useRef<AbortController | null>(null);

  const busyRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const handleDecode = async () => {
    if (busyRef.current) {
      return;
    }

    busyRef.current = true;
    setIsLoading(true);
    setDuration(null);
    setSampleRate(null);
    setMessage("Downloading audio...");

    const engine = new AudioEngine();
    const controller = new AbortController();

    controllerRef.current = controller;

    try {
      const buffer = await engine.load(
        testTrack,
        controller.signal
      );

      if (!mountedRef.current) {
        return;
      }

      setDuration(buffer.duration);
      setSampleRate(buffer.sampleRate);
      setMessage("Audio decoded successfully.");
    } catch (error: unknown) {
      if (!mountedRef.current) {
        return;
      }

      if (
        controller.signal.aborted ||
        (error instanceof Error &&
          error.name === "AbortError")
      ) {
        setMessage("Audio loading was cancelled.");
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error);

        setMessage(`Error: ${errorMessage}`);
      }
    } finally {
      try {
        await engine.close();
      } catch (error) {
        console.error(
          "AudioContext cleanup failed:",
          error
        );
      }

      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }

      busyRef.current = false;

      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    controllerRef.current?.abort();
  };

  return (
    <section
      className="panel audio-decode-test"
      aria-labelledby="decode-test-heading"
    >
      <div className="panel-heading">
        <div>
          <p className="section-eyebrow">
            TASK 3 — STEP 1
          </p>

          <h2 id="decode-test-heading">
            Audio Loading & Decoding Test
          </h2>
        </div>
      </div>

      <p className="helper-text">
        Download and decode a real MP3 using
        the Web Audio API.
      </p>

      <p>
        <strong>Track:</strong> {testTrack.title}
      </p>

      <p>
        <strong>URL:</strong> {testTrack.url}
      </p>

      <div className="decode-actions">
        <button
          type="button"
          onClick={() => void handleDecode()}
          disabled={isLoading}
        >
          {isLoading
            ? "Processing..."
            : "Load & Decode"}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={!isLoading}
        >
          Cancel
        </button>
      </div>

      <div className="decode-result" role="status">
        <p>{message}</p>

        {duration !== null && (
          <p>
            <strong>Duration:</strong>{" "}
            {duration.toFixed(2)} seconds
          </p>
        )}

        {sampleRate !== null && (
          <p>
            <strong>Sample Rate:</strong>{" "}
            {sampleRate} Hz
          </p>
        )}
      </div>
    </section>
  );
}

export default AudioDecodeTestPanel;