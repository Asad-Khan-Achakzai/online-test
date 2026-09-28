import { NextResponse } from "next/server";
import { claimRoll, StoreNotConfiguredError } from "@/lib/exam/resultStore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let parsed: Partial<{
    testId: string;
    candidateName: string;
    candidateId: string;
    attemptId: string;
  }>;
  try {
    parsed = (await request.json()) as typeof parsed;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const outcome = await claimRoll({
      testId: String(parsed.testId ?? ""),
      candidateName: String(parsed.candidateName ?? ""),
      candidateId: String(parsed.candidateId ?? ""),
      attemptId: String(parsed.attemptId ?? ""),
    });
    if (!outcome.ok) return NextResponse.json(outcome, { status: outcome.status });
    return NextResponse.json(outcome);
  } catch (error) {
    if (error instanceof StoreNotConfiguredError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
    }
    return NextResponse.json(
      { ok: false, error: "The roll number could not be checked. The attempt was not started." },
      { status: 500 },
    );
  }
}
