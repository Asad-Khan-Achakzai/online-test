/**
 * Central examination settings.
 * Edit this file before an examination. Do not scatter these flags through the UI.
 */
export const EXAM_CONFIG = {
  testId: "medical-entry-2026",
  organization: "Examination Office",
  title: "Assistan Computer Operator",
  description:
    "A single-sitting multiple-choice examination. Once started, the attempt must be finished in one continuous session on this device.",
  durationMinutes: 30,
  allowQuestionRandomization: true,
  allowOptionRandomization: true,
  terminateOnVisibilityChange: true,
  terminateOnFullscreenExit: true,
  terminateOnWindowBlur: true,
  terminateOnNavigation: true,
  /**
   * Reloading or reopening the page destroys fullscreen and leaves a gap in monitoring.
   * The stored attempt is preserved and marked terminated so the candidate cannot start again.
   * Set this to false only while debugging on a development machine.
   */
  terminateOnReload: true,
  /** Shows the numeric score after a normal submission. Never reveals which answers were correct. */
  showScoreToCandidate: true,
  /**
   * Convenience gate for the export page. This is not authentication:
   * the value ships in the JavaScript bundle.
   */
  adminAccessCode: "exam-admin",
  /**
   * Optional extra copy, such as a Google Apps Script web app.
   * Each finished attempt is also saved by this site. On Vercel that store is Redis.
   * Candidates are not looked up from a saved list.
   */
  googleSheetsEndpoint: "" as string,
} as const;

export const EXAM_DURATION_MS = EXAM_CONFIG.durationMinutes * 60 * 1000;
