import { scoreAttempt } from "@/lib/exam/examScoring";
import type { CompletionReason, ExamAttempt, ViolationReason } from "@/types/exam";

/**
 * Once an attempt is COMPLETED or TERMINATED it must never return to IN_PROGRESS.
 * Both finalizers no-op when the attempt has already ended.
 */
export function terminateStoredAttempt(
  attempt: ExamAttempt,
  reason: ViolationReason,
  now: Date = new Date(),
): ExamAttempt {
  if (attempt.status !== "IN_PROGRESS") return attempt;
  const endedAt = now.toISOString();
  const result = scoreAttempt(attempt, endedAt, {
    status: "TERMINATED",
    terminationReason: reason,
  });
  return {
    ...attempt,
    status: "TERMINATED",
    endedAt,
    terminationReason: reason,
    completionReason: undefined,
    violationCount: attempt.violationCount + 1,
    result,
  };
}

export function completeStoredAttempt(
  attempt: ExamAttempt,
  reason: CompletionReason,
  now: Date = new Date(),
): ExamAttempt {
  if (attempt.status !== "IN_PROGRESS") return attempt;
  const endedAt = now.toISOString();
  const result = scoreAttempt(attempt, endedAt, {
    status: "COMPLETED",
    completionReason: reason,
  });
  return {
    ...attempt,
    status: "COMPLETED",
    endedAt,
    completionReason: reason,
    terminationReason: undefined,
    result,
  };
}
