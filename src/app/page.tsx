import Link from "next/link";
import { EXAM_CONFIG } from "@/config/examConfig";
import { questionCount } from "@/data/test";

export default function Home() {
  const testPath = `/test/${EXAM_CONFIG.testId}`;
  const displayPath = `/display/${EXAM_CONFIG.testId}`;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-10">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-navy uppercase">
        {EXAM_CONFIG.organization}
      </p>
      <h1 className="mt-3 text-4xl leading-10 font-semibold text-foreground">
        {EXAM_CONFIG.title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-7 text-muted">{EXAM_CONFIG.description}</p>
      <p className="mt-3 text-base text-foreground">
        {questionCount()} questions · {EXAM_CONFIG.durationMinutes} minutes · one attempt
        per device
      </p>

      <section className="mt-8 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-xl font-semibold">Venue display</h2>
        <p className="mt-2 text-base leading-6 text-muted">
          Open the QR page on the hall screen. Candidates scan that code with their own
          phones. The code does not contain a name or roll number.
        </p>
        <Link
          href={displayPath}
          className="mt-4 flex h-12 items-center justify-center rounded-xl bg-navy text-base font-semibold text-white"
        >
          Open QR display
        </Link>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-xl font-semibold">Candidate entrance</h2>
        <p className="mt-2 text-base leading-6 text-muted">
          The QR code opens <span className="font-mono text-sm">{testPath}</span>. Use
          this link only to check the page. A started attempt on this browser cannot be
          taken again.
        </p>
        <Link
          href={testPath}
          className="mt-4 flex h-12 items-center justify-center rounded-xl border border-line text-base font-semibold text-navy"
        >
          Open examination
        </Link>
      </section>

      <p className="mt-8 text-sm text-muted">
        <Link href="/admin" className="font-semibold text-navy">
          Administrator records
        </Link>
      </p>
    </main>
  );
}
