/**
 * Marks the attempt running inside this JavaScript context.
 *
 * A full page load creates a new context, so this value is empty again.
 * A React remount in the same document does not clear it.
 * That distinction is how a reload is told apart from a component remount:
 * a reload of an in-progress attempt is treated as leaving the examination.
 */
let activeAttemptId: string | null = null;

export function markLiveSession(attemptId: string): void {
  activeAttemptId = attemptId;
}

export function clearLiveSession(): void {
  activeAttemptId = null;
}

export function isLiveSession(attemptId: string): boolean {
  return activeAttemptId === attemptId;
}
