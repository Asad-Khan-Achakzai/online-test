import { EXAM_CONFIG } from "@/config/examConfig";
import { formatDuration } from "@/lib/exam/time";
import { loadResults, writeResultSync } from "@/lib/exam/examStorage";
import type { ExamResult } from "@/types/exam";

/**
 * Result sink used by the examination UI.
 * Replace the body of `saveResult` to post to Google Sheets, a REST API,
 * Firebase, or Supabase without rewriting the screens.
 *
 * The local write is synchronous so a terminating page-hide still keeps the record.
 * A remote post is best-effort and must not block or undo the local record.
 */
/** Results API on this same site. Works locally and on Vercel. */
export function localCollectorUrl(): string {
  if (typeof window === "undefined") return "";
  return "/api/results";
}

function postResult(endpoint: string, result: ExamResult, sameOrigin: boolean): void {
  void fetch(endpoint, {
    method: "POST",
    mode: sameOrigin ? "cors" : "no-cors",
    keepalive: true,
    headers: {
      "Content-Type": sameOrigin ? "application/json" : "text/plain;charset=utf-8",
    },
    body: JSON.stringify(result),
  });
}

export function saveResult(result: ExamResult): void {
  try {
    writeResultSync(result);
  } catch {
    // Private mode or a full disk can reject the write. The attempt object is
    // saved separately and remains the primary record when that write succeeds.
  }

  if (typeof fetch === "undefined") return;

  const targets = new Set<string>();
  const local = localCollectorUrl();
  if (local) targets.add(local);
  const sheets = EXAM_CONFIG.googleSheetsEndpoint.trim();
  if (sheets) targets.add(sheets);

  for (const endpoint of targets) {
    try {
      postResult(endpoint, result, endpoint.startsWith("/"));
    } catch {
      // A failed remote copy does not undo the copy stored on this phone.
    }
  }
}

export function listStoredResults(): ExamResult[] {
  return loadResults();
}

function escapeCsv(value: string): string {
  const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\n\r]/.test(guarded)) {
    return `"${guarded.replaceAll('"', '""')}"`;
  }
  return guarded;
}

export function resultsToCsv(results: ExamResult[]): string {
  const headers = [
    "Candidate ID",
    "Candidate Name",
    "Score",
    "Total Questions",
    "Percentage",
    "Status",
    "Start Time",
    "End Time",
    "Termination Reason",
    "Completion Reason",
    "Time Taken",
  ];
  const lines = [headers.join(",")];
  for (const result of results) {
    const cells = [
      result.candidateId,
      result.candidateName,
      String(result.score),
      String(result.totalQuestions),
      String(result.percentage),
      result.status,
      result.startedAt,
      result.endedAt,
      result.terminationReason ?? "",
      result.completionReason ?? "",
      formatDuration(result.timeTakenMs),
    ];
    lines.push(cells.map(escapeCsv).join(","));
  }
  return `${lines.join("\n")}\n`;
}

export function downloadTextFile(filename: string, contents: string, type: string): void {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
