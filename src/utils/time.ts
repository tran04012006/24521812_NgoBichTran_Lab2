
export function formatCountdown(
  remainingMs: number
): string {
  const safeMs = Math.max(0, Math.ceil(remainingMs));

  const hours = Math.floor(safeMs / 3_600_000);

  const minutes = Math.floor(
    (safeMs % 3_600_000) / 60_000
  );

  const seconds = Math.floor(
    (safeMs % 60_000) / 1_000
  );

  const milliseconds = safeMs % 1_000;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":") + "." +
    String(milliseconds).padStart(3, "0");
}
