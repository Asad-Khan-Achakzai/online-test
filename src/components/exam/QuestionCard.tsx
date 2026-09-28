import { AnswerOption } from "@/components/exam/AnswerOption";
import type { PublicQuestion } from "@/types/exam";

export function QuestionCard({
  question,
  optionOrder,
  selectedOptionId,
  isLast,
  disabled,
  onSelect,
  onAdvance,
}: {
  question: PublicQuestion;
  optionOrder: string[];
  selectedOptionId: string | null;
  isLast: boolean;
  disabled: boolean;
  onSelect: (optionId: string) => void;
  onAdvance: () => void;
}) {
  const options = optionOrder
    .map((optionId) => question.options.find((option) => option.id === optionId))
    .filter((option): option is PublicQuestion["options"][number] => Boolean(option));
  const canAdvance = Boolean(selectedOptionId) && !disabled;

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        if (canAdvance) onAdvance();
      }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        <h2 id="question-text" className="text-xl leading-7 font-semibold text-foreground">
          {question.question}
        </h2>
        <div
          role="radiogroup"
          aria-labelledby="question-text"
          className="mt-4 flex flex-col gap-3"
        >
          {options.map((option) => (
            <AnswerOption
              key={option.id}
              text={option.text}
              selected={selectedOptionId === option.id}
              disabled={disabled}
              onSelect={() => onSelect(option.id)}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-line py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="submit"
          disabled={!canAdvance}
          className="flex h-14 w-full touch-manipulation items-center justify-center rounded-xl bg-navy text-base font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:bg-navy/35"
        >
          {isLast ? "Submit test" : "Next"}
        </button>
        <p className="mt-2 text-center text-sm text-muted">
          {selectedOptionId
            ? "You cannot return to this question after continuing."
            : "Select an answer to continue."}
        </p>
      </div>
    </form>
  );
}
