import { getQuestion } from "@/data/test";
import type {
  AttemptStatus,
  CompletionReason,
  ExamAttempt,
  ExamResult,
  ViolationReason,
} from "@/types/exam";

export function scoreAttempt(
  attempt: ExamAttempt,
  endedAt: string,
  outcome: {
    status: AttemptStatus;
    terminationReason?: ViolationReason;
    completionReason?: CompletionReason;
  },
): ExamResult {
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unanswered = 0;

  for (const questionId of attempt.questionOrder) {
    const question = getQuestion(questionId);
    const selected = attempt.answers[questionId];
    if (!selected) {
      unanswered += 1;
      continue;
    }
    if (question && selected === question.correctAnswer) {
      correctAnswers += 1;
    } else {
      incorrectAnswers += 1;
    }
  }

  const totalQuestions = attempt.questionOrder.length;
  const percentage =
    totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);
  const started = Date.parse(attempt.startedAt);
  const ended = Date.parse(endedAt);
  const timeTakenMs =
    Number.isNaN(started) || Number.isNaN(ended) ? 0 : Math.max(0, ended - started);

  return {
    attemptId: attempt.attemptId,
    testId: attempt.testId,
    candidateName: attempt.candidateName,
    candidateId: attempt.candidateId,
    score: correctAnswers,
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unanswered,
    percentage,
    timeTakenMs,
    startedAt: attempt.startedAt,
    endedAt,
    status: outcome.status,
    terminationReason: outcome.terminationReason,
    completionReason: outcome.completionReason,
  };
}
