import { randomId } from "@/lib/exam/randomId";
import type { ExamAttempt, ExamResult } from "@/types/exam";

const PREFIX = "exam.v1";
export const EXAM_STATE_EVENT = "exam-state";

/** Returned when localStorage exists but cannot be read. Not valid attempt JSON. */
export const STORAGE_UNAVAILABLE = "__STORAGE_UNAVAILABLE__";

export interface TabLock {
  tabId: string;
  attemptId: string;
  updatedAt: number;
}

export function attemptStorageKey(testId: string): string {
  return `${PREFIX}.attempt.${testId}`;
}

export function resultsStorageKey(): string {
  return `${PREFIX}.results`;
}

export function lockStorageKey(testId: string): string {
  return `${PREFIX}.lock.${testId}`;
}

function tabStorageKey(): string {
  return `${PREFIX}.tabId`;
}

export function notifyExamStorage(): void {
  if (typeof window === "undefined" || typeof Event === "undefined") return;
  window.dispatchEvent(new Event(EXAM_STATE_EVENT));
}

export function subscribeExamStorage(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(EXAM_STATE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(EXAM_STATE_EVENT, handler);
  };
}

export function readRawAttempt(testId: string): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(attemptStorageKey(testId));
  } catch {
    return STORAGE_UNAVAILABLE;
  }
}

export function loadAttempt(testId: string): ExamAttempt | null {
  const raw = readRawAttempt(testId);
  if (!raw || raw === STORAGE_UNAVAILABLE) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as ExamAttempt;
  } catch {
    return null;
  }
}

export function saveAttempt(attempt: ExamAttempt): void {
  localStorage.setItem(attemptStorageKey(attempt.testId), JSON.stringify(attempt));
  notifyExamStorage();
}

/**
 * Single-writer claim for this browser. localStorage is not a real lock across
 * tabs, so the caller must also listen for a second tab and terminate.
 */
export function claimAttempt(attempt: ExamAttempt): boolean {
  if (loadAttempt(attempt.testId)) return false;
  saveAttempt(attempt);
  return loadAttempt(attempt.testId)?.attemptId === attempt.attemptId;
}

function isResult(value: unknown): value is ExamResult {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<ExamResult>;
  return (
    typeof record.attemptId === "string" &&
    typeof record.testId === "string" &&
    typeof record.candidateId === "string" &&
    typeof record.status === "string"
  );
}

export function loadResults(): ExamResult[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(resultsStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isResult);
  } catch {
    return [];
  }
}

export function writeResultSync(result: ExamResult): void {
  const next = loadResults().filter((item) => item.attemptId !== result.attemptId);
  next.push(result);
  localStorage.setItem(resultsStorageKey(), JSON.stringify(next));
  notifyExamStorage();
}

export function readTabLock(testId: string): TabLock | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(lockStorageKey(testId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TabLock>;
    if (
      typeof parsed.tabId !== "string" ||
      typeof parsed.attemptId !== "string" ||
      typeof parsed.updatedAt !== "number"
    ) {
      return null;
    }
    return {
      tabId: parsed.tabId,
      attemptId: parsed.attemptId,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

/** Lock heartbeats must not notify the exam store, or the page would redraw every second. */
export function writeTabLock(testId: string, lock: TabLock): void {
  localStorage.setItem(lockStorageKey(testId), JSON.stringify(lock));
}

export function getTabId(): string {
  const existing = sessionStorage.getItem(tabStorageKey());
  if (existing) return existing;
  const created = randomId();
  sessionStorage.setItem(tabStorageKey(), created);
  return created;
}

export function clearExamBrowserData(testId: string): void {
  localStorage.removeItem(attemptStorageKey(testId));
  localStorage.removeItem(lockStorageKey(testId));
  localStorage.removeItem(resultsStorageKey());
  notifyExamStorage();
}
