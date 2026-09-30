import { VIOLATION_REASON_TEXT } from "@/lib/exam/reasonText";
import type { ExamAttempt } from "@/types/exam";

export function TerminationScreen({ attempt }: { attempt: ExamAttempt }) {
  const reason = attempt.terminationReason
    ? VIOLATION_REASON_TEXT[attempt.terminationReason]
    : "The examination environment was left.";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8">
      <div className="rounded-2xl border border-danger/30 bg-danger-bg px-5 py-6">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-danger uppercase">
          Examination terminated
        </p>
        <h1 className="mt-2 text-3xl leading-9 font-semibold text-danger">
          You left the examination environment.
        </h1>
        <p className="mt-4 text-base leading-6 text-foreground">
          Your examination attempt has been terminated because you left the examination
          environment.
        </p>
        <p className="mt-4 text-sm font-semibold tracking-wide text-muted uppercase">Reason</p>
        <p className="mt-1 text-base leading-6 text-foreground">{reason}</p>
        <dl className="mt-5 grid gap-3 text-sm">
          <div>
            <dt className="font-semibold text-muted">Candidate</dt>
            <dd className="text-base text-foreground">{attempt.candidateName}</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted">CNIC number</dt>
            <dd className="text-base text-foreground">{attempt.candidateId}</dd>
          </div>
        </dl>
        <p className="mt-5 text-base leading-6 font-semibold text-foreground">
          This attempt cannot be restarted.
        </p>
        <p className="mt-2 text-base leading-6 text-foreground">
          Please contact the examination administrator.
        </p>
      </div>
    </main>
  );
}
