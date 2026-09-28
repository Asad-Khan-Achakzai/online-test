import { formatClock } from "@/lib/exam/time";

export function ExamTimer({ remainingMs }: { remainingMs: number }) {
  const urgent = remainingMs <= 5 * 60 * 1000;
  const clock = formatClock(remainingMs);
  return (
    <p
      className={`text-right ${urgent ? "text-danger" : "text-navy"}`}
      aria-label={`${clock} remaining`}
    >
      <span className="block font-mono text-2xl leading-none font-semibold tabular-nums">
        {clock}
      </span>
      <span className="mt-1 block text-[11px] font-semibold tracking-[0.14em] uppercase">
        remaining
      </span>
    </p>
  );
}
