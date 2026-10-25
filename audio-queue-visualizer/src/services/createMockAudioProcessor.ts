import type { AudioProcessor } from "./AudioTaskQueue";

/**
 * Create a fake audio processor for queue testing.
 *
 * This does not download or decode an MP3 file.
 */
export function createMockAudioProcessor(
  onStart?: (title: string) => void,
  onFinish?: (title: string) => void
): AudioProcessor {
  return async (track, signal) => {
    onStart?.(track.title);

    // Simulate asynchronous processing.
    await new Promise<void>((resolve, reject) => {
      if (signal.aborted) {
        reject(
          new DOMException(
            "Task was aborted",
            "AbortError"
          )
        );
        return;
      }

      const timeoutId = window.setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      }, 300);

      function onAbort() {
        window.clearTimeout(timeoutId);

        reject(
          new DOMException(
            "Task was aborted",
            "AbortError"
          )
        );
      }

      signal.addEventListener("abort", onAbort, {
        once: true,
      });

      if (signal.aborted) {
        onAbort();
      }
    });

    /**
     * Construct a valid empty audio buffer.
     *
     * This buffer contains silence.
     */
    const buffer = new AudioBuffer({
      length: 1,
      numberOfChannels: 1,
      sampleRate: 44100,
    });

    onFinish?.(track.title);

    return buffer;
  };
}