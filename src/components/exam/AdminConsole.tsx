"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { EXAM_CONFIG } from "@/config/examConfig";
import {
  downloadTextFile,
  listStoredResults,
  localCollectorUrl,
  resultsToCsv,
} from "@/lib/exam/examResults";
import { allowAnotherAttempt, type RollRetake } from "@/lib/exam/rollClaim";
import { normalizeCandidateId } from "@/lib/exam/candidate";
import type { ExamResult } from "@/types/exam";
import {
  clearExamBrowserData,
  readRawAttempt,
  resultsStorageKey,
  subscribeExamStorage,
} from "@/lib/exam/examStorage";
import { clearLiveSession } from "@/lib/exam/liveSession";
import { formatDuration } from "@/lib/exam/time";

function ExportButton({
  busy,
  disabled,
  label,
  busyLabel,
  onClick,
  variant,
}: {
  busy: boolean;
  disabled: boolean;
  label: string;
  busyLabel: string;
  onClick: () => void;
  variant: "primary" | "secondary";
}) {
  const tone =
    variant === "primary"
      ? "bg-navy text-white"
      : "border border-line bg-surface text-navy";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy}
      className={`flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold ${tone} ${
        disabled && !busy ? "opacity-40" : ""
      } ${busy ? "cursor-wait" : ""}`}
    >
      {busy ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      {busy ? busyLabel : label}
    </button>
  );
}

function readResultsRaw(): string {
  try {
    return localStorage.getItem(resultsStorageKey()) ?? "";
  } catch {
    return "";
  }
}

export function AdminConsole() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState<string>(EXAM_CONFIG.adminAccessCode);
  const [error, setError] = useState("");

  if (!open) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-8">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-navy uppercase">
          {EXAM_CONFIG.organization}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Administrator</h1>
        <p className="mt-3 text-base leading-6 text-muted">
          Candidates are not registered in advance. Each person enters a name and CNIC
          number on their own phone. When an attempt ends, the name, CNIC number, and
          score are sent to this computer. The access code is a local convenience check,
          not an account system.
        </p>
        <form
          className="mt-6 flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (code === EXAM_CONFIG.adminAccessCode) {
              setOpen(true);
              setError("");
              return;
            }
            setError("The access code is not correct.");
          }}
        >
          <label htmlFor="access-code" className="text-sm font-semibold">
            Access code
          </label>
          <input
            id="access-code"
            type="password"
            value={code}
            autoComplete="off"
            onChange={(event) => setCode(event.target.value)}
            className="h-12 rounded-xl border border-line bg-surface px-3 text-base outline-none focus:border-navy"
          />
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="flex h-12 items-center justify-center rounded-xl bg-navy text-base font-semibold text-white"
          >
            Continue
          </button>
        </form>
      </main>
    );
  }

  return <AdminRecords />;
}

function AdminRecords() {
  const raw = useSyncExternalStore(subscribeExamStorage, readResultsRaw, () => "");
  const attemptRaw = useSyncExternalStore(
    subscribeExamStorage,
    () => readRawAttempt(EXAM_CONFIG.testId) ?? "",
    () => "",
  );
  const storedResults = useMemo(() => listStoredResults(), [raw]);
  const [received, setReceived] = useState<ExamResult[]>([]);
  const [retakes, setRetakes] = useState<RollRetake[]>([]);
  const [collectorOnline, setCollectorOnline] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [retakeError, setRetakeError] = useState("");
  const [pendingRetakeId, setPendingRetakeId] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "csv" | "json" | "attempt" | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = localCollectorUrl();

    async function load() {
      if (!url) return;
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error("Collector unavailable");
        const body = (await response.json()) as { results?: ExamResult[]; retakes?: RollRetake[] };
        if (cancelled) return;
        const rows = Array.isArray(body.results) ? body.results : [];
        setReceived(rows.filter((row) => row.testId === EXAM_CONFIG.testId));
        setRetakes(
          Array.isArray(body.retakes)
            ? body.retakes.filter((row) => row.testId === EXAM_CONFIG.testId)
            : [],
        );
        setCollectorOnline(true);
      } catch {
        if (!cancelled) setCollectorOnline(false);
      }
    }

    void load();
    const timer = window.setInterval(() => void load(), 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const results = useMemo(() => {
    const byId = new Map<string, ExamResult>();
    for (const result of storedResults) byId.set(result.attemptId, result);
    for (const result of received) byId.set(result.attemptId, result);
    return [...byId.values()].sort((left, right) => left.startedAt.localeCompare(right.startedAt));
  }, [received, storedResults]);

  async function runExport(kind: "pdf" | "csv" | "json" | "attempt") {
    if (exporting) return;
    setExporting(kind);
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });
    try {
      if (kind === "pdf") {
        const { downloadResultsPdf } = await import("@/lib/exam/resultsPdf");
        downloadResultsPdf(results);
        return;
      }
      if (kind === "csv") {
        downloadTextFile(
          `${EXAM_CONFIG.testId}-results.csv`,
          resultsToCsv(results),
          "text/csv;charset=utf-8",
        );
        return;
      }
      if (kind === "json") {
        downloadTextFile(
          `${EXAM_CONFIG.testId}-results.json`,
          JSON.stringify(results, null, 2),
          "application/json",
        );
        return;
      }
      downloadTextFile(
        `${EXAM_CONFIG.testId}-attempt.json`,
        attemptRaw,
        "application/json",
      );
    } finally {
      setExporting(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-8">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-navy uppercase">
        {EXAM_CONFIG.organization}
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-foreground">Received results</h1>
      <p className="mt-3 max-w-2xl text-base leading-6 text-muted">
        Each row is a person who entered their own name and CNIC number. The score is
        saved when they submit, when time runs out, or when the attempt is terminated.
        Allow another attempt if someone closed the app by mistake. The next finished
        attempt for that CNIC number replaces the score shown here.
      </p>
      {retakeError ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {retakeError}
        </p>
      ) : null}
      {collectorOnline ? null : (
        <p className="mt-3 rounded-xl border border-danger/30 bg-danger-bg px-3 py-3 text-sm leading-5 text-foreground">
          Results could not be loaded. On Vercel, connect Upstash Redis and redeploy.
          Locally, refresh this page.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <ExportButton
          busy={exporting === "pdf"}
          disabled={exporting !== null}
          label="Export PDF"
          busyLabel="Preparing PDF…"
          onClick={() => void runExport("pdf")}
          variant="primary"
        />
        <ExportButton
          busy={exporting === "csv"}
          disabled={exporting !== null}
          label="Export CSV"
          busyLabel="Preparing CSV…"
          onClick={() => void runExport("csv")}
          variant="secondary"
        />
        <ExportButton
          busy={exporting === "json"}
          disabled={exporting !== null}
          label="Export JSON"
          busyLabel="Preparing JSON…"
          onClick={() => void runExport("json")}
          variant="secondary"
        />
        <ExportButton
          busy={exporting === "attempt"}
          disabled={exporting !== null || !attemptRaw || attemptRaw === "__STORAGE_UNAVAILABLE__"}
          label="Download attempt record"
          busyLabel="Preparing record…"
          onClick={() => void runExport("attempt")}
          variant="secondary"
        />
      </div>

      <div className="mt-6 max-h-[28rem] overflow-y-auto rounded-xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="sticky top-0 bg-surface px-3 py-3 font-semibold shadow-[inset_0_-1px_0_0_var(--line)]">
                CNIC number
              </th>
              <th className="sticky top-0 bg-surface px-3 py-3 font-semibold shadow-[inset_0_-1px_0_0_var(--line)]">
                Name
              </th>
              <th className="sticky top-0 bg-surface px-3 py-3 font-semibold shadow-[inset_0_-1px_0_0_var(--line)]">
                Score
              </th>
              <th className="sticky top-0 bg-surface px-3 py-3 font-semibold shadow-[inset_0_-1px_0_0_var(--line)]">
                Status
              </th>
              <th className="sticky top-0 bg-surface px-3 py-3 font-semibold shadow-[inset_0_-1px_0_0_var(--line)]">
                Time
              </th>
              <th className="sticky top-0 bg-surface px-3 py-3 font-semibold shadow-[inset_0_-1px_0_0_var(--line)]">
                Reason
              </th>
              <th className="sticky top-0 bg-surface px-3 py-3 font-semibold whitespace-nowrap shadow-[inset_0_-1px_0_0_var(--line)]">
                Another attempt
              </th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-muted" colSpan={7}>
                  No results have been received yet.
                </td>
              </tr>
            ) : (
              results.map((result) => {
                const waiting = retakes.some(
                  (retake) =>
                    normalizeCandidateId(retake.candidateId) ===
                    normalizeCandidateId(result.candidateId),
                );
                const confirming = pendingRetakeId === result.candidateId;
                return (
                  <tr key={result.attemptId} className="border-b border-line last:border-0">
                    <td className="px-3 py-3 whitespace-nowrap">{result.candidateId}</td>
                    <td className="px-3 py-3">{result.candidateName}</td>
                    <td className="px-3 py-3">
                      {result.score}/{result.totalQuestions} ({result.percentage}%)
                    </td>
                    <td className="px-3 py-3">{result.status}</td>
                    <td className="px-3 py-3">{formatDuration(result.timeTakenMs)}</td>
                    <td className="px-3 py-3">
                      {result.terminationReason ?? result.completionReason ?? ""}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {waiting ? (
                        <span className="text-muted">Waiting for the new attempt</span>
                      ) : confirming ? (
                        <button
                          type="button"
                          onClick={() => {
                            void allowAnotherAttempt(result.testId, result.candidateId).then(
                              (outcome) => {
                                if (!outcome.ok) {
                                  setRetakeError(outcome.error);
                                  setPendingRetakeId(null);
                                  return;
                                }
                                setRetakeError("");
                                setPendingRetakeId(null);
                                setRetakes((current) => [
                                  ...current,
                                  { testId: result.testId, candidateId: result.candidateId },
                                ]);
                              },
                            );
                          }}
                          className="flex h-10 items-center justify-center rounded-lg bg-navy px-3 text-xs font-semibold text-white"
                        >
                          Confirm retake
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setRetakeError("");
                            setPendingRetakeId(result.candidateId);
                          }}
                          className="flex h-10 items-center justify-center rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-navy"
                        >
                          Allow another attempt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-8 rounded-xl border border-danger/30 bg-danger-bg px-4 py-4">
        <h2 className="text-lg font-semibold text-danger">Clear this browser</h2>
        <p className="mt-2 text-sm leading-5 text-foreground">
          This deletes only the attempt stored in this browser, so this browser can
          start again. Results already received from candidate phones stay in the list.
        </p>
        {confirmClear ? (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                clearExamBrowserData(EXAM_CONFIG.testId);
                clearLiveSession();
                setConfirmClear(false);
              }}
              className="flex h-11 items-center justify-center rounded-xl bg-danger px-4 text-sm font-semibold text-white"
            >
              Delete records
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="flex h-11 items-center justify-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-navy"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="mt-3 flex h-11 items-center justify-center rounded-xl border border-danger/40 bg-surface px-4 text-sm font-semibold text-danger"
          >
            Clear examination data
          </button>
        )}
      </section>
    </main>
  );
}
