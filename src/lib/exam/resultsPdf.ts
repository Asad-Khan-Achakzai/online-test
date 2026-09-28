import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { EXAM_CONFIG } from "@/config/examConfig";
import { formatDuration } from "@/lib/exam/time";
import type { ExamResult } from "@/types/exam";

const NAVY: [number, number, number] = [22, 50, 79];
const INK: [number, number, number] = [28, 36, 48];
const MUTED: [number, number, number] = [92, 103, 120];
const LINE: [number, number, number] = [213, 219, 227];
const PAPER: [number, number, number] = [247, 249, 251];
const OK: [number, number, number] = [29, 92, 69];
const DANGER: [number, number, number] = [141, 29, 29];
const MARGIN = 14;

export interface ResultsSummary {
  candidates: number;
  completed: number;
  terminated: number;
  average: number | null;
}

export function summarizeResults(results: readonly ExamResult[]): ResultsSummary {
  const completed = results.filter((result) => result.status === "COMPLETED").length;
  const terminated = results.filter((result) => result.status === "TERMINATED").length;
  const average =
    results.length === 0
      ? null
      : Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length);
  return { candidates: results.length, completed, terminated, average };
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function outcomeText(result: ExamResult): string {
  if (result.completionReason === "MANUAL_SUBMISSION") return "Submitted";
  if (result.completionReason === "TIME_EXPIRED") return "Time expired";
  switch (result.terminationReason) {
    case "PAGE_HIDDEN":
      return "Left the page";
    case "WINDOW_BLUR":
      return "Left the window";
    case "FULLSCREEN_EXIT":
      return "Left fullscreen";
    case "NAVIGATION_ATTEMPT":
      return "Used navigation";
    case "BROWSER_EXIT":
      return "Closed or refreshed";
    case "MULTI_TAB":
      return "Opened another tab";
    default:
      return result.status === "COMPLETED" ? "Completed" : "Terminated";
  }
}

function drawHeader(doc: jsPDF, generatedAt: Date): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setFillColor(232, 196, 122);
  doc.rect(0, 32, pageWidth, 1.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(EXAM_CONFIG.organization.toUpperCase(), MARGIN, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(EXAM_CONFIG.title, MARGIN, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Results report", pageWidth - MARGIN, 13, { align: "right" });
  doc.setFontSize(9);
  doc.text(formatWhen(generatedAt.toISOString()), pageWidth - MARGIN, 20, { align: "right" });
  doc.text(EXAM_CONFIG.testId, pageWidth - MARGIN, 26, { align: "right" });
}

function drawSummary(doc: jsPDF, summary: ResultsSummary, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const gap = 4;
  const width = (pageWidth - MARGIN * 2 - gap * 3) / 4;
  const height = 22;
  const items: Array<[string, string]> = [
    ["Candidates", String(summary.candidates)],
    ["Completed", String(summary.completed)],
    ["Terminated", String(summary.terminated)],
    ["Average score", summary.average === null ? "—" : `${summary.average}%`],
  ];

  items.forEach(([label, value], index) => {
    const x = MARGIN + index * (width + gap);
    doc.setFillColor(...PAPER);
    doc.setDrawColor(...LINE);
    doc.roundedRect(x, y, width, height, 1.6, 1.6, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x + 4, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text(value, x + 4, y + 16.5);
  });

  return y + height + 8;
}

function drawFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      "One attempt per roll number. A later allowed attempt replaces the earlier score.",
      MARGIN,
      pageHeight - 8,
    );
    doc.text(`${page} / ${pageCount}`, pageWidth - MARGIN, pageHeight - 8, { align: "right" });
  }
}

export function buildResultsPdf(results: readonly ExamResult[], generatedAt = new Date()): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  drawHeader(doc, generatedAt);
  const tableStart = drawSummary(doc, summarizeResults(results), 42);

  if (results.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text("No results have been received yet.", MARGIN, tableStart + 4);
    drawFooter(doc);
    return doc;
  }

  autoTable(doc, {
    startY: tableStart,
    margin: { top: 18, left: MARGIN, right: MARGIN, bottom: 16 },
    head: [["Roll number", "Name", "Score", "Percent", "Status", "Time", "Started", "Outcome"]],
    body: results.map((result) => [
      result.candidateId,
      result.candidateName,
      `${result.score}/${result.totalQuestions}`,
      `${result.percentage}%`,
      result.status === "COMPLETED" ? "Completed" : "Terminated",
      formatDuration(result.timeTakenMs),
      formatWhen(result.startedAt),
      outcomeText(result),
    ]),
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: INK,
      cellPadding: { top: 2.8, right: 2, bottom: 2.8, left: 2 },
      lineColor: LINE,
      lineWidth: 0.15,
      valign: "middle",
    },
    headStyles: {
      fillColor: NAVY,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: PAPER },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 48 },
      2: { cellWidth: 22, halign: "right" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 28 },
      5: { cellWidth: 20, halign: "right" },
      6: { cellWidth: 40 },
    },
    didParseCell: (data) => {
      if (data.section !== "body" || data.column.index !== 4) return;
      const status = String(data.cell.raw);
      data.cell.styles.fontStyle = "bold";
      data.cell.styles.textColor = status === "Completed" ? OK : DANGER;
    },
    didDrawPage: (data) => {
      if (data.pageNumber === 1) return;
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, pageWidth, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`${EXAM_CONFIG.title}  ·  Results`, MARGIN, 7.5);
    },
  });

  drawFooter(doc);
  return doc;
}

export function downloadResultsPdf(results: readonly ExamResult[]): void {
  buildResultsPdf(results).save(`${EXAM_CONFIG.testId}-results.pdf`);
}
