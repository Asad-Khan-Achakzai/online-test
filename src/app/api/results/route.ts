import { NextResponse } from "next/server";
import { listReceived, saveExamResult, StoreNotConfiguredError } from "@/lib/exam/resultStore";
import type { ExamResult } from "@/types/exam";

export const dynamic = "force-dynamic";

function unavailable(error: unknown): NextResponse | null {
  if (error instanceof StoreNotConfiguredError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
  }
  return null;
}

function isIncomingResult(value: unknown): value is ExamResult {
  if (!value || typeof value !== "object") return false;
  const row = value as ExamResult;
  return (
    typeof row.attemptId === "string" &&
    typeof row.testId === "string" &&
    typeof row.candidateName === "string" &&
    typeof row.candidateId === "string" &&
    typeof row.score === "number" &&
    typeof row.totalQuestions === "number" &&
    typeof row.percentage === "number" &&
    (row.status === "COMPLETED" || row.status === "TERMINATED")
  );
}

export async function GET() {
  try {
    return NextResponse.json(await listReceived());
  } catch (error) {
    return unavailable(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!isIncomingResult(parsed)) {
    return NextResponse.json({ ok: false, error: "Invalid result" }, { status: 400 });
  }
  try {
    const outcome = await saveExamResult(parsed);
    if (!outcome.ok) return NextResponse.json(outcome, { status: outcome.status });
    return new NextResponse("ok", { status: 200 });
  } catch (error) {
    return unavailable(error) ?? NextResponse.json({ ok: false }, { status: 500 });
  }
}
