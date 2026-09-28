export function AnswerOption({
  text,
  selected,
  disabled,
  onSelect,
}: {
  text: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`flex min-h-14 w-full touch-manipulation items-center gap-3 rounded-xl border px-4 py-3 text-left text-base leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
        selected
          ? "border-navy bg-navy text-white"
          : "border-line bg-surface text-foreground"
      } disabled:opacity-60`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-white" : "border-muted"
        }`}
        aria-hidden="true"
      >
        {selected ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : null}
      </span>
      <span>{text}</span>
    </button>
  );
}
