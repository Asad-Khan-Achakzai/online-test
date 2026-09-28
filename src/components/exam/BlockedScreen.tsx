export function BlockedScreen() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8">
      <div className="rounded-2xl border border-line bg-surface px-5 py-6">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-navy uppercase">
          Examination record
        </p>
        <h1 className="mt-2 text-3xl leading-9 font-semibold text-foreground">
          This device cannot start the examination.
        </h1>
        <p className="mt-4 text-base leading-6 text-foreground">
          The examination record stored on this browser is unreadable or the browser
          storage is blocked. A new attempt cannot be created here.
        </p>
        <p className="mt-4 text-base leading-6 text-foreground">
          Please contact the examination administrator.
        </p>
      </div>
    </main>
  );
}
