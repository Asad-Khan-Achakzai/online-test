import { ExamTimer } from "@/components/exam/ExamTimer";

export function ExamHeader({
  title,
  questionNumber,
  totalQuestions,
  remainingMs,
}: {
  title: string;
  questionNumber: number;
  totalQuestions: number;
  remainingMs: number;
}) {
  return (
    <header className="border-b border-line pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-navy uppercase">
        {title}
      </p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <h1 className="text-lg leading-6 font-semibold text-foreground">
          Question {questionNumber} of {totalQuestions}
        </h1>
        <ExamTimer remainingMs={remainingMs} />
      </div>
    </header>
  );
}
