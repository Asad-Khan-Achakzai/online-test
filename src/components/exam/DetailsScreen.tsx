import type { CandidateFieldErrors } from "@/lib/exam/candidate";

export function DetailsScreen({
  organization,
  title,
  description,
  questionCount,
  durationMinutes,
  name,
  candidateId,
  errors,
  onNameChange,
  onCandidateIdChange,
  onContinue,
}: {
  organization: string;
  title: string;
  description: string;
  questionCount: number;
  durationMinutes: number;
  name: string;
  candidateId: string;
  errors: CandidateFieldErrors;
  onNameChange: (value: string) => void;
  onCandidateIdChange: (value: string) => void;
  onContinue: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-navy uppercase">
        {organization}
      </p>
      <h1 className="mt-2 text-3xl leading-9 font-semibold text-foreground">{title}</h1>
      <p className="mt-3 text-base leading-6 text-muted">{description}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-surface px-3 py-3">
          <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Questions</dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">{questionCount}</dd>
        </div>
        <div className="rounded-xl border border-line bg-surface px-3 py-3">
          <dt className="text-xs font-semibold tracking-wide text-muted uppercase">Duration</dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">{durationMinutes} min</dd>
        </div>
      </dl>

      <ul className="mt-5 flex flex-col gap-2 text-sm leading-5 text-foreground">
        <li>The examination is completed in one continuous session.</li>
        <li>You cannot return to a previous question.</li>
        <li>Leaving the examination environment terminates the attempt.</li>
        <li>A terminated attempt cannot be restarted on this device.</li>
        <li>Each roll number can be used for one attempt only.</li>
      </ul>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onContinue();
        }}
      >
        <div>
          <label htmlFor="candidate-name" className="text-sm font-semibold text-foreground">
            Full name
          </label>
          <input
            id="candidate-name"
            name="candidate-name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            className="mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-foreground outline-none focus:border-navy"
          />
          {errors.name ? (
            <p className="mt-1 text-sm text-danger" role="alert">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="candidate-id" className="text-sm font-semibold text-foreground">
            Roll / candidate number
          </label>
          <input
            id="candidate-id"
            name="candidate-id"
            value={candidateId}
            onChange={(event) => onCandidateIdChange(event.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="done"
            className="mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3 text-base text-foreground outline-none focus:border-navy"
          />
          {errors.candidateId ? (
            <p className="mt-1 text-sm text-danger" role="alert">
              {errors.candidateId}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          className="mt-2 flex h-14 w-full touch-manipulation items-center justify-center rounded-xl bg-navy text-base font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
