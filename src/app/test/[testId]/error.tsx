"use client";

export default function TestError() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4">
      <h1 className="text-3xl font-semibold text-foreground">Examination unavailable</h1>
      <p className="mt-3 text-base leading-6 text-foreground">
        This page could not be shown. If an attempt was already in progress, reopening
        the examination will not start a new one.
      </p>
      <p className="mt-3 text-base leading-6 text-foreground">
        Please contact the examination administrator.
      </p>
    </main>
  );
}
