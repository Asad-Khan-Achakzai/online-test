"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { getPublicQuestion } from "@/data/test";
import { saveResult } from "@/lib/exam/examResults";
import { claimRollNumber, fetchRollBlocked } from "@/lib/exam/rollClaim";
import {
  claimAttempt,
  clearExamBrowserData,
  loadAttempt,
  readRawAttempt,
  saveAttempt,
  subscribeExamStorage,
} from "@/lib/exam/examStorage";
import {
  createAttempt,
  interpretStoredAttempt,
} from "@/lib/exam/examState";
import {
  completeStoredAttempt,
  terminateStoredAttempt,
} from "@/lib/exam/examTermination";
import {
  clearLiveSession,
  isLiveSession,
  markLiveSession,
} from "@/lib/exam/liveSession";
import type {
  CompletionReason,
  ExamPhase,
  PublicQuestion,
  ViolationReason,
} from "@/types/exam";

function subscribeNoop(): () => void {
  return () => {};
}

function clientReady(): boolean {
  return true;
}

function serverPending(): boolean {
  return false;
}

export interface StartExamResult {
  ok: boolean;
  error?: string;
}

/**
 * One examination record per browser for this test, unless an administrator
 * allows that roll number to try again. A released roll number clears the
 * finished record on this phone so the candidate can start once more.
 */
export function useExamSession(testId: string) {
  const isClient = useSyncExternalStore(subscribeNoop, clientReady, serverPending);
  const raw = useSyncExternalStore(
    subscribeExamStorage,
    () => readRawAttempt(testId),
    () => null,
  );

  const interpreted = useMemo(
    () =>
      isClient
        ? interpretStoredAttempt(raw, testId)
        : { phase: "loading" as const, attempt: null, persist: null },
    [isClient, raw, testId],
  );

  const releasedAttempt =
    interpreted.phase === "terminated" || interpreted.phase === "completed"
      ? interpreted.attempt
      : null;
  useEffect(() => {
    if (!releasedAttempt) return;
    const candidateId = releasedAttempt.candidateId;
    let cancelled = false;

    async function lookForRetake() {
      const blocked = await fetchRollBlocked(testId, candidateId);
      if (cancelled || blocked !== false) return;
      clearExamBrowserData(testId);
      clearLiveSession();
    }

    void lookForRetake();
    const timer = window.setInterval(() => void lookForRetake(), 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [releasedAttempt, testId]);

  const persist = interpreted.persist;
  useEffect(() => {
    if (!persist) return;
    const serialized = JSON.stringify(persist);
    if (readRawAttempt(testId) === serialized) return;
    saveAttempt(persist);
    if (persist.result) saveResult(persist.result);
  }, [persist, testId]);

  const endAttempt = useCallback(
    (kind: "complete" | "terminate", reason: CompletionReason | ViolationReason) => {
      const current = loadAttempt(testId);
      if (!current || current.status !== "IN_PROGRESS") return;
      const next =
        kind === "complete"
          ? completeStoredAttempt(current, reason as CompletionReason)
          : terminateStoredAttempt(current, reason as ViolationReason);
      if (next.status === "IN_PROGRESS") return;
      saveAttempt(next);
      if (next.result) saveResult(next.result);
      clearLiveSession();
    },
    [testId],
  );

  const terminateAttempt = useCallback(
    (reason: ViolationReason) => {
      endAttempt("terminate", reason);
    },
    [endAttempt],
  );

  const completeAttempt = useCallback(
    (reason: CompletionReason) => {
      endAttempt("complete", reason);
    },
    [endAttempt],
  );

  const startExam = useCallback(
    async (candidateName: string, candidateId: string): Promise<StartExamResult> => {
      if (loadAttempt(testId)) {
        return {
          ok: false,
          error: "An examination attempt already exists on this device.",
        };
      }
      const attempt = createAttempt({ testId, candidateName, candidateId });
      const roll = await claimRollNumber({
        testId,
        candidateName: attempt.candidateName,
        candidateId: attempt.candidateId,
        attemptId: attempt.attemptId,
      });
      if (!roll.ok) return roll;
      markLiveSession(attempt.attemptId);
      if (!claimAttempt(attempt)) {
        clearLiveSession();
        return {
          ok: false,
          error: "An examination attempt already exists on this device.",
        };
      }
      return { ok: true };
    },
    [testId],
  );

  const selectAnswer = useCallback(
    (questionId: string, optionId: string) => {
      const current = loadAttempt(testId);
      if (!current || current.status !== "IN_PROGRESS") return;
      if (!isLiveSession(current.attemptId)) return;
      const activeId = current.questionOrder[current.currentQuestion];
      if (activeId !== questionId) return;
      const allowed = current.optionOrders[questionId] ?? [];
      if (!allowed.includes(optionId)) return;
      if (current.answers[questionId] === optionId) return;
      saveAttempt({
        ...current,
        answers: { ...current.answers, [questionId]: optionId },
      });
    },
    [testId],
  );

  const advance = useCallback(() => {
    const current = loadAttempt(testId);
    if (!current || current.status !== "IN_PROGRESS") return;
    const activeId = current.questionOrder[current.currentQuestion];
    if (!activeId || !current.answers[activeId]) return;
    if (current.currentQuestion >= current.questionOrder.length - 1) {
      completeAttempt("MANUAL_SUBMISSION");
      return;
    }
    saveAttempt({ ...current, currentQuestion: current.currentQuestion + 1 });
  }, [completeAttempt, testId]);

  const attempt = interpreted.phase === "loading" ? null : interpreted.attempt;
  const phase: ExamPhase = interpreted.phase;
  const currentQuestionId =
    attempt && phase === "exam"
      ? attempt.questionOrder[attempt.currentQuestion]
      : undefined;
  const currentQuestion: PublicQuestion | null = currentQuestionId
    ? getPublicQuestion(currentQuestionId)
    : null;
  const optionOrder =
    attempt && currentQuestionId ? (attempt.optionOrders[currentQuestionId] ?? []) : [];
  const selectedOptionId =
    attempt && currentQuestionId ? (attempt.answers[currentQuestionId] ?? null) : null;

  return {
    phase,
    attempt,
    currentQuestion,
    optionOrder,
    selectedOptionId,
    questionNumber: attempt ? attempt.currentQuestion + 1 : 0,
    totalQuestions: attempt?.questionOrder.length ?? 0,
    startExam,
    selectAnswer,
    advance,
    terminateAttempt,
    completeAttempt,
  };
}
