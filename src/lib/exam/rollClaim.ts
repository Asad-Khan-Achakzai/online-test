import { normalizeCandidateId, normalizeCandidateName } from "@/lib/exam/candidate";

export const ROLL_ALREADY_USED =
  "This roll number has already been used for an attempt.";

export interface RollUse {
  testId: string;
  candidateId: string;
  attemptId: string;
}

export interface RollRetake {
  testId: string;
  candidateId: string;
}

function sameRoll(testId: string, candidateId: string, otherTestId: string, otherCandidateId: string): boolean {
  return testId === otherTestId && normalizeCandidateId(candidateId) === normalizeCandidateId(otherCandidateId);
}

/** Same test and the same roll number, ignoring spaces and letter case. */
export function findRollUse(
  uses: readonly RollUse[],
  testId: string,
  candidateId: string,
): RollUse | undefined {
  const id = normalizeCandidateId(candidateId);
  return uses.find(
    (use) => use.testId === testId && normalizeCandidateId(use.candidateId) === id,
  );
}

/**
 * A roll number is free when an administrator has allowed one more attempt,
 * or when every saved attempt for it has been set aside for replacement.
 */
export function isRollBlocked(
  uses: readonly RollUse[],
  retakes: readonly RollRetake[],
  supersededAttemptIds: readonly string[],
  testId: string,
  candidateId: string,
): boolean {
  if (retakes.some((retake) => sameRoll(testId, candidateId, retake.testId, retake.candidateId))) {
    return false;
  }
  return uses.some(
    (use) =>
      sameRoll(testId, candidateId, use.testId, use.candidateId) &&
      !supersededAttemptIds.includes(use.attemptId),
  );
}

function collectorOrigin(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.protocol}//${window.location.hostname}:3457`;
}

/** `null` means the collector could not be reached, so the phone must not erase its record. */
export async function fetchRollBlocked(
  testId: string,
  candidateId: string,
): Promise<boolean | null> {
  const origin = collectorOrigin();
  if (!origin) return null;
  const query = new URLSearchParams({
    testId,
    candidateId: normalizeCandidateId(candidateId),
  });
  try {
    const response = await fetch(`${origin}/rolls?${query.toString()}`, { cache: "no-store" });
    if (!response.ok) return null;
    const body = (await response.json()) as { blocked?: boolean };
    return body.blocked === true;
  } catch {
    return null;
  }
}

export async function allowAnotherAttempt(
  testId: string,
  candidateId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const origin = collectorOrigin();
  if (!origin) return { ok: false, error: "The results collector is not reachable." };
  try {
    const response = await fetch(`${origin}/retakes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testId,
        candidateId: normalizeCandidateId(candidateId),
      }),
    });
    if (!response.ok) return { ok: false, error: "Another attempt could not be allowed." };
    return { ok: true };
  } catch {
    return { ok: false, error: "The results collector is not reachable." };
  }
}

export async function claimRollNumber(input: {
  testId: string;
  candidateName: string;
  candidateId: string;
  attemptId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (typeof window === "undefined") {
    return { ok: false, error: "This roll number could not be checked." };
  }

  const endpoint = `${window.location.protocol}//${window.location.hostname}:3457/claims`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testId: input.testId,
        candidateName: normalizeCandidateName(input.candidateName),
        candidateId: normalizeCandidateId(input.candidateId),
        attemptId: input.attemptId,
      }),
    });
    if (response.status === 409) {
      return { ok: false, error: ROLL_ALREADY_USED };
    }
    if (!response.ok) {
      return { ok: false, error: "This roll number could not be checked. Try again." };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "This roll number could not be checked. Stay connected to the examination network and try again.",
    };
  }
}
