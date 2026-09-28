import { NextResponse } from "next/server";
import { allowRetake, StoreNotConfiguredError } from "@/lib/exam/resultStore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let parsed: Partial<{ testId: string; candidateId: string }>;
  try {
    parsed = (await request.json()) as typeof parsed;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const testId = String(parsed.testId ?? "");
  const candidateId = String(parsed.candidateId ?? "");
  if (!testId || !candidateId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    await allowRetake(testId, candidateId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof StoreNotConfiguredError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
    }
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
