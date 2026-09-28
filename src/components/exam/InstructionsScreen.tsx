const RULES = [
  "The examination must be completed in one continuous session.",
  "Do not switch applications.",
  "Do not switch browser tabs.",
  "Do not minimize the browser.",
  "Do not leave fullscreen mode.",
  "Do not lock the device.",
  "Do not navigate away from the examination page.",
  "Do not use the browser Back button or other navigation controls.",
  "Leaving the examination environment immediately terminates the attempt.",
  "A terminated attempt cannot be restarted.",
  "Make sure the phone has enough battery for the full duration.",
  "Questions are already loaded. A brief network drop after the test starts does not erase answers stored on this phone.",
];

export function InstructionsScreen({
  title,
  acknowledged,
  startError,
  starting,
  onAcknowledgedChange,
  onBack,
  onStart,
}: {
  title: string;
  acknowledged: boolean;
  startError?: string;
  starting?: boolean;
  onAcknowledgedChange: (value: boolean) => void;
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-navy uppercase">
        {title}
      </p>
      <h1 className="mt-2 text-3xl leading-9 font-semibold text-foreground">
        Examination instructions
      </h1>
      <p className="mt-3 text-base leading-6 text-muted">
        This page cannot disable the Home button or the phone app switcher. If the
        examination page becomes hidden, loses focus, leaves fullscreen, or is opened
        again, the attempt ends.
      </p>
      <ul className="mt-5 flex flex-col gap-2 text-sm leading-5 text-foreground">
        {RULES.map((rule) => (
          <li key={rule} className="rounded-xl border border-line bg-surface px-3 py-3">
            {rule}
          </li>
        ))}
      </ul>

      <label className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-surface px-3 py-3 text-sm leading-5 text-foreground">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => onAcknowledgedChange(event.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 accent-navy"
        />
        <span>
          I understand that leaving the examination environment will permanently
          terminate my attempt.
        </span>
      </label>

      {startError ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {startError}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          disabled={!acknowledged || starting}
          onClick={onStart}
          className="flex h-14 w-full touch-manipulation items-center justify-center rounded-xl bg-navy text-base font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:bg-navy/35"
        >
          {starting ? "Checking roll number…" : "Start test"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 w-full touch-manipulation items-center justify-center rounded-xl border border-line bg-surface text-base font-semibold text-navy"
        >
          Back
        </button>
      </div>
    </main>
  );
}
