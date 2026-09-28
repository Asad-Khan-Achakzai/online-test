"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { remainingMs } from "@/lib/exam/time";

/**
 * Remaining time is derived from the original start timestamp.
 * The interval only refreshes the clock. It does not accumulate time of its own,
 * so a slow timer cannot give the candidate extra minutes.
 */
let clockNow = 0;
const clockListeners = new Set<() => void>();
let clockTimer: number | null = null;

function ensureClock(): void {
  if (clockTimer != null || typeof window === "undefined") return;
  clockNow = Date.now();
  clockTimer = window.setInterval(() => {
    clockNow = Date.now();
    clockListeners.forEach((listener) => listener());
  }, 250);
}

function stopClockIfIdle(): void {
  if (clockListeners.size > 0 || clockTimer == null || typeof window === "undefined") return;
  window.clearInterval(clockTimer);
  clockTimer = null;
}

function subscribeClock(listener: () => void): () => void {
  clockListeners.add(listener);
  ensureClock();
  return () => {
    clockListeners.delete(listener);
    stopClockIfIdle();
  };
}

function subscribeNoop(): () => void {
  return () => {};
}

function readClock(): number {
  return clockNow;
}

function readServerClock(): number {
  return 0;
}

export function useExamTimer({
  startedAt,
  durationMs,
  running,
  onExpire,
}: {
  startedAt: string | null;
  durationMs: number;
  running: boolean;
  onExpire: () => void;
}): number {
  const now = useSyncExternalStore(
    running ? subscribeClock : subscribeNoop,
    readClock,
    readServerClock,
  );
  const remaining =
    !running || !startedAt
      ? 0
      : now > 0
        ? remainingMs(startedAt, durationMs, now)
        : durationMs;

  const firedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!running || !startedAt || now <= 0 || remaining > 0) return;
    if (firedFor.current === startedAt) return;
    firedFor.current = startedAt;
    onExpire();
  }, [durationMs, now, onExpire, remaining, running, startedAt]);

  return remaining;
}
