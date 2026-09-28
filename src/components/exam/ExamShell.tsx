"use client";

import { useCallback, useState } from "react";
import { BlockedScreen } from "@/components/exam/BlockedScreen";
import { CompletionScreen } from "@/components/exam/CompletionScreen";
import { DetailsScreen } from "@/components/exam/DetailsScreen";
import { ExamHeader } from "@/components/exam/ExamHeader";
import { InstructionsScreen } from "@/components/exam/InstructionsScreen";
import { QuestionCard } from "@/components/exam/QuestionCard";
import { TerminationScreen } from "@/components/exam/TerminationScreen";
import { EXAM_CONFIG, EXAM_DURATION_MS } from "@/config/examConfig";
import { questionCount } from "@/data/test";
import { useExamSecurity } from "@/hooks/useExamSecurity";
import { useExamSession } from "@/hooks/useExamSession";
import { useExamTimer } from "@/hooks/useExamTimer";
import { useFullscreen } from "@/hooks/useFullscreen";
import { validateCandidate, type CandidateFieldErrors } from "@/lib/exam/candidate";

export function ExamShell({ testId }: { testId: string }) {
  const session = useExamSession(testId);
  const { requestFullscreen } = useFullscreen();
  const [step, setStep] = useState<"details" | "instructions">("details");
  const [name, setName] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [errors, setErrors] = useState<CandidateFieldErrors>({});
  const [acknowledged, setAcknowledged] = useState(false);
  const [startError, setStartError] = useState<string>();
  const [starting, setStarting] = useState(false);

  const examActive = session.phase === "exam";
  const completeAttempt = session.completeAttempt;
  const onExpire = useCallback(() => {
    completeAttempt("TIME_EXPIRED");
  }, [completeAttempt]);
  const remainingMs = useExamTimer({
    startedAt: session.attempt?.startedAt ?? null,
    durationMs: EXAM_DURATION_MS,
    running: examActive,
    onExpire,
  });

  useExamSecurity({
    enabled: examActive,
    attemptId: examActive ? (session.attempt?.attemptId ?? null) : null,
    testId,
    onTerminate: session.terminateAttempt,
  });

  if (session.phase === "loading") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-lg items-center px-4">
        <p className="text-base text-muted">Preparing examination…</p>
      </main>
    );
  }

  if (session.phase === "blocked") return <BlockedScreen />;
  if (session.phase === "terminated" && session.attempt) {
    return <TerminationScreen attempt={session.attempt} />;
  }
  if (session.phase === "completed" && session.attempt) {
    return <CompletionScreen attempt={session.attempt} />;
  }

  if (session.phase === "details" && step === "details") {
    return (
      <DetailsScreen
        organization={EXAM_CONFIG.organization}
        title={EXAM_CONFIG.title}
        description={EXAM_CONFIG.description}
        questionCount={questionCount()}
        durationMinutes={EXAM_CONFIG.durationMinutes}
        name={name}
        candidateId={candidateId}
        errors={errors}
        onNameChange={(value) => {
          setName(value);
          setErrors((current) => ({ ...current, name: undefined }));
        }}
        onCandidateIdChange={(value) => {
          setCandidateId(value);
          setErrors((current) => ({ ...current, candidateId: undefined }));
        }}
        onContinue={() => {
          const nextErrors = validateCandidate(name, candidateId);
          setErrors(nextErrors);
          if (nextErrors.name || nextErrors.candidateId) return;
          setAcknowledged(false);
          setStartError(undefined);
          setStep("instructions");
        }}
      />
    );
  }

  if (session.phase === "details" && step === "instructions") {
    return (
      <InstructionsScreen
        title={EXAM_CONFIG.title}
        acknowledged={acknowledged}
        startError={startError}
        starting={starting}
        onAcknowledgedChange={setAcknowledged}
        onBack={() => {
          setAcknowledged(false);
          setStartError(undefined);
          setStep("details");
        }}
        onStart={() => {
          if (!acknowledged || starting) return;
          setStarting(true);
          setStartError(undefined);
          requestFullscreen();
          void session.startExam(name, candidateId).then(
            (result) => {
              if (!result.ok) {
                setStarting(false);
                setStartError(result.error ?? "The examination could not be started.");
              }
            },
            () => {
              setStarting(false);
              setStartError("The examination could not be started. Try again.");
            },
          );
        }}
      />
    );
  }

  if (
    session.phase === "exam" &&
    session.attempt &&
    session.currentQuestion
  ) {
    const isLast = session.questionNumber === session.totalQuestions;
    return (
      <main className="mx-auto flex h-dvh w-full max-w-lg flex-col px-4">
        <ExamHeader
          title={EXAM_CONFIG.title}
          questionNumber={session.questionNumber}
          totalQuestions={session.totalQuestions}
          remainingMs={remainingMs}
        />
        <QuestionCard
          question={session.currentQuestion}
          optionOrder={session.optionOrder}
          selectedOptionId={session.selectedOptionId}
          isLast={isLast}
          disabled={false}
          onSelect={(optionId) => {
            if (!session.currentQuestion) return;
            session.selectAnswer(session.currentQuestion.id, optionId);
          }}
          onAdvance={session.advance}
        />
      </main>
    );
  }

  return <BlockedScreen />;
}
