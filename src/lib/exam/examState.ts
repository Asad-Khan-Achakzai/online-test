import { EXAM_CONFIG } from "@/config/examConfig";
import { listQuestions } from "@/data/test";
import {
  normalizeCandidateId,
  normalizeCandidateName,
} from "@/lib/exam/candidate";
import { buildAttemptOrder } from "@/lib/exam/examOrder";
import { terminateStoredAttempt } from "@/lib/exam/examTermination";
import { isLiveSession } from "@/lib/exam/liveSession";
import { randomId } from "@/lib/exam/randomId";
import { STORAGE_UNAVAILABLE } from "@/lib/exam/examStorage";
import type { ExamAttempt, InterpretedAttempt } from "@/types/exam";

export function createAttempt(input: {
  testId: string;
  candidateName: string;
  candidateId: string;
  now?: Date;
  attemptId?: string;
}): ExamAttempt {
  const attemptId = input.attemptId ?? randomId();
  const { questionOrder, optionOrders } = buildAttemptOrder(attemptId);
  return {
    attemptId,
    testId: input.testId,
    candidateName: normalizeCandidateName(input.candidateName),
    candidateId: normalizeCandidateId(input.candidateId),
    startedAt: (input.now ?? new Date()).toISOString(),
    status: "IN_PROGRESS",
    currentQuestion: 0,
    answers: {},
    questionOrder,
    optionOrders,
    violationCount: 0,
  };
}

export function isValidAttempt(value: unknown, testId: string): value is ExamAttempt {
  if (!value || typeof value !== "object") return false;
  const attempt = value as ExamAttempt;
  if (attempt.testId !== testId) return false;
  if (typeof attempt.attemptId !== "string" || attempt.attemptId.length < 8) return false;
  if (typeof attempt.candidateName !== "string" || attempt.candidateName.trim().length < 2) {
    return false;
  }
  if (typeof attempt.candidateId !== "string" || attempt.candidateId.trim().length < 1) {
    return false;
  }
  if (
    attempt.status !== "IN_PROGRESS" &&
    attempt.status !== "COMPLETED" &&
    attempt.status !== "TERMINATED"
  ) {
    return false;
  }
  if (typeof attempt.startedAt !== "string" || Number.isNaN(Date.parse(attempt.startedAt))) {
    return false;
  }
  if (!Array.isArray(attempt.questionOrder)) return false;

  const questions = listQuestions();
  const knownIds = questions.map((question) => question.id);
  if (attempt.questionOrder.length !== knownIds.length) return false;
  if (new Set(attempt.questionOrder).size !== knownIds.length) return false;
  if (!attempt.questionOrder.every((id) => knownIds.includes(id))) return false;
  if (typeof attempt.currentQuestion !== "number") return false;
  if (attempt.currentQuestion < 0 || attempt.currentQuestion > attempt.questionOrder.length) {
    return false;
  }
  if (!attempt.answers || typeof attempt.answers !== "object" || Array.isArray(attempt.answers)) {
    return false;
  }
  if (!attempt.optionOrders || typeof attempt.optionOrders !== "object") return false;
  if (typeof attempt.violationCount !== "number" || attempt.violationCount < 0) return false;
  if (attempt.status === "TERMINATED") {
    if (
      attempt.terminationReason !== "PAGE_HIDDEN" &&
      attempt.terminationReason !== "WINDOW_BLUR" &&
      attempt.terminationReason !== "FULLSCREEN_EXIT" &&
      attempt.terminationReason !== "NAVIGATION_ATTEMPT" &&
      attempt.terminationReason !== "BROWSER_EXIT" &&
      attempt.terminationReason !== "MULTI_TAB"
    ) {
      return false;
    }
  }
  if (
    attempt.status === "COMPLETED" &&
    attempt.completionReason !== "TIME_EXPIRED" &&
    attempt.completionReason !== "MANUAL_SUBMISSION"
  ) {
    return false;
  }

  for (const question of questions) {
    const order = attempt.optionOrders[question.id];
    if (!Array.isArray(order)) return false;
    const expected = question.options.map((option) => option.id);
    if (order.length !== expected.length || new Set(order).size !== expected.length) return false;
    if (!order.every((id) => expected.includes(id))) return false;
  }

  for (const [questionId, optionId] of Object.entries(attempt.answers)) {
    if (typeof optionId !== "string") return false;
    if (!attempt.optionOrders[questionId]?.includes(optionId)) return false;
  }

  return true;
}

/**
 * Decides what a stored record means when the page is read.
 * An in-progress record whose JavaScript context has died is a departure:
 * the attempt is terminated instead of being offered again.
 */
export function interpretStoredAttempt(
  raw: string | null,
  testId: string,
  policy: { terminateOnReload: boolean } = {
    terminateOnReload: EXAM_CONFIG.terminateOnReload,
  },
): InterpretedAttempt {
  if (raw == null) {
    return { phase: "details", attempt: null, persist: null };
  }
  if (raw === STORAGE_UNAVAILABLE) {
    return { phase: "blocked", attempt: null, persist: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { phase: "blocked", attempt: null, persist: null };
  }
  if (!isValidAttempt(parsed, testId)) {
    return { phase: "blocked", attempt: null, persist: null };
  }
  if (parsed.status === "COMPLETED") {
    return { phase: "completed", attempt: parsed, persist: null };
  }
  if (parsed.status === "TERMINATED") {
    return { phase: "terminated", attempt: parsed, persist: null };
  }
  if (isLiveSession(parsed.attemptId) || !policy.terminateOnReload) {
    return { phase: "exam", attempt: parsed, persist: null };
  }

  const terminated = terminateStoredAttempt(parsed, "BROWSER_EXIT");
  return { phase: "terminated", attempt: terminated, persist: terminated };
}
