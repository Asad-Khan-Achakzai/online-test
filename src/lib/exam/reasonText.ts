import type { CompletionReason, ViolationReason } from "@/types/exam";

export const VIOLATION_REASON_TEXT: Record<ViolationReason, string> = {
  PAGE_HIDDEN: "Application/tab visibility changed.",
  WINDOW_BLUR: "The examination window lost focus.",
  FULLSCREEN_EXIT: "Fullscreen mode was exited.",
  NAVIGATION_ATTEMPT: "Browser navigation was used.",
  BROWSER_EXIT: "The examination page was closed, refreshed, or left.",
  MULTI_TAB: "Another examination tab or window was opened.",
};

export const COMPLETION_REASON_TEXT: Record<CompletionReason, string> = {
  TIME_EXPIRED: "The allotted time expired and the test was submitted automatically.",
  MANUAL_SUBMISSION: "You submitted the test.",
};
