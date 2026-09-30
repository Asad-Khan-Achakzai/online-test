import { EXAM_CONFIG } from "@/config/examConfig";
import { COMPLETION_REASON_TEXT } from "@/lib/exam/reasonText";
import { formatDuration } from "@/lib/exam/time";
import type { ExamAttempt } from "@/types/exam";

export function CompletionScreen({ attempt }: { attempt: ExamAttempt }) {
  const result = attempt.result;
  const note = attempt.completionReason
    ? COMPLETION_REASON_TEXT[attempt.completionReason]
    : "Your test has been submitted successfully.";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8">
      <div className="rounded-2xl border border-line bg-surface px-5 py-6">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-ok uppercase">
          Examination completed
        </p>
        <h1 className="mt-2 text-3xl leading-9 font-semibold text-foreground">
          Your test has been submitted successfully.
        </h1>
        <p className="mt-3 text-base leading-6 text-muted">{note}</p>

        <dl className="mt-6 grid gap-4">
          <div>
            <dt className="text-sm font-semibold text-muted">Candidate</dt>
            <dd className="text-lg font-semibold text-foreground">{attempt.candidateName}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-muted">CNIC number</dt>
            <dd className="text-lg font-semibold text-foreground">{attempt.candidateId}</dd>
          </div>
          {EXAM_CONFIG.showScoreToCandidate && result ? (
            <>
              <div>
                <dt className="text-sm font-semibold text-muted">Score</dt>
                <dd className="text-lg font-semibold text-foreground">
                  {result.score} / {result.totalQuestions}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-muted">Percentage</dt>
                <dd className="text-lg font-semibold text-foreground">{result.percentage}%</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-muted">Time</dt>
                <dd className="text-lg font-semibold text-foreground">
                  {formatDuration(result.timeTakenMs)}
                </dd>
              </div>
            </>
          ) : null}
        </dl>

        <p className="mt-6 text-base leading-6 text-foreground">
          Your responses have been recorded.
        </p>
        <p className="mt-2 text-base leading-6 text-foreground">
          Please wait for further instructions.
        </p>
      </div>
    </main>
  );
}
