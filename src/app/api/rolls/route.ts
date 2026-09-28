import { NextResponse } from "next/server";
import { rollBlocked, StoreNotConfiguredError } from "@/lib/exam/resultStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const testId = url.searchParams.get("testId") ?? "";
  const candidateId = url.searchParams.get("candidateId") ?? "";
  if (!testId || !candidateId) {
    return NextResponse.json({ blocked: true }, { status: 400 });
  }
  try {
    return NextResponse.json({ blocked: await rollBlocked(testId, candidateId) });
  } catch (error) {
    if (error instanceof StoreNotConfiguredError) {
      return NextResponse.json({ blocked: true, error: error.message }, { status: 503 });
    }
    return NextResponse.json({ blocked: true }, { status: 500 });
  }
}
