import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import { normalizeCandidateId, normalizeCandidateName } from "@/lib/exam/candidate";
import {
  findRollUse,
  isRollBlocked,
  ROLL_ALREADY_USED,
  type RollRetake,
  type RollUse,
} from "@/lib/exam/rollClaim";
import type { ExamResult } from "@/types/exam";

const REDIS_KEY = "exam:v1:store";
const FILE = path.join(process.cwd(), "data", "received-results.json");

/**
 * One Redis script so two serverless invocations cannot both claim a roll.
 * The claim value is the attempt id. SET has no expiry.
 * A retake key, also without expiry, is the only way to replace an existing claim.
 */
const CLAIM_SCRIPT = `
local existing = redis.call("GET", KEYS[1])
if existing == ARGV[1] then
  redis.call("DEL", KEYS[2])
  return "SAME"
end
if not existing then
  redis.call("SET", KEYS[1], ARGV[1])
  redis.call("DEL", KEYS[2])
  return "OK"
end
if redis.call("EXISTS", KEYS[2]) == 1 then
  redis.call("DEL", KEYS[2])
  redis.call("SET", KEYS[1], ARGV[1])
  return "REPLACED"
end
return "TAKEN"
`;

export class StoreNotConfiguredError extends Error {
  constructor() {
    super(
      "Results storage is not configured. Connect Upstash Redis in Vercel so KV_REST_API_URL and KV_REST_API_TOKEN are set.",
    );
    this.name = "StoreNotConfiguredError";
  }
}

interface Claim {
  testId: string;
  candidateName: string;
  candidateId: string;
  attemptId: string;
  claimedAt: string;
}

interface Store {
  results: ExamResult[];
  claims: Claim[];
  retakes: RollRetake[];
  supersededAttemptIds: string[];
}

export interface ClaimInput {
  testId: string;
  candidateName: string;
  candidateId: string;
  attemptId: string;
}

type ClaimOutcome =
  | { ok: true }
  | { ok: false; status: 400 | 409; error: string };

let fileChain = Promise.resolve();

function emptyStore(): Store {
  return { results: [], claims: [], retakes: [], supersededAttemptIds: [] };
}

function redisConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return Boolean(url && token);
}

/** Uses Vercel KV variables when the Upstash-named ones are absent. */
function getRedis(): Redis {
  if (!redisConfigured()) throw new StoreNotConfiguredError();
  return Redis.fromEnv();
}

function claimKey(testId: string, candidateId: string): string {
  return `exam:v1:roll:${testId}:${normalizeCandidateId(candidateId)}`;
}

function retakeKey(testId: string, candidateId: string): string {
  return `exam:v1:retake:${testId}:${normalizeCandidateId(candidateId)}`;
}

function isResult(value: unknown): value is ExamResult {
  if (!value || typeof value !== "object") return false;
  const row = value as ExamResult;
  return (
    typeof row.attemptId === "string" &&
    row.attemptId.length > 0 &&
    typeof row.testId === "string" &&
    typeof row.candidateName === "string" &&
    row.candidateName.trim().length > 0 &&
    typeof row.candidateId === "string" &&
    row.candidateId.trim().length > 0 &&
    typeof row.score === "number" &&
    typeof row.totalQuestions === "number" &&
    typeof row.percentage === "number" &&
    (row.status === "COMPLETED" || row.status === "TERMINATED")
  );
}

function isClaim(value: unknown): value is Claim {
  if (!value || typeof value !== "object") return false;
  const row = value as Claim;
  return (
    typeof row.attemptId === "string" &&
    row.attemptId.length > 0 &&
    typeof row.testId === "string" &&
    typeof row.candidateName === "string" &&
    row.candidateName.trim().length > 0 &&
    typeof row.candidateId === "string" &&
    row.candidateId.trim().length > 0 &&
    typeof row.claimedAt === "string"
  );
}

function parseStore(value: unknown): Store {
  if (!value || typeof value !== "object") return emptyStore();
  const parsed = value as {
    results?: unknown;
    claims?: unknown;
    retakes?: unknown;
    supersededAttemptIds?: unknown;
  };
  const retakes = Array.isArray(parsed.retakes) ? parsed.retakes : [];
  const superseded = Array.isArray(parsed.supersededAttemptIds) ? parsed.supersededAttemptIds : [];
  return {
    results: Array.isArray(parsed.results) ? parsed.results.filter(isResult) : [],
    claims: Array.isArray(parsed.claims) ? parsed.claims.filter(isClaim) : [],
    retakes: retakes.filter(
      (row): row is RollRetake =>
        !!row &&
        typeof row === "object" &&
        typeof (row as RollRetake).testId === "string" &&
        typeof (row as RollRetake).candidateId === "string",
    ),
    supersededAttemptIds: superseded.filter((id): id is string => typeof id === "string"),
  };
}

async function readRedisStore(): Promise<Store> {
  const raw = await getRedis().get<unknown>(REDIS_KEY);
  if (!raw) return emptyStore();
  if (typeof raw === "string") {
    try {
      return parseStore(JSON.parse(raw));
    } catch {
      return emptyStore();
    }
  }
  return parseStore(raw);
}

async function writeRedisStore(store: Store): Promise<void> {
  await getRedis().set(REDIS_KEY, store);
}

async function readFileStore(): Promise<Store> {
  try {
    return parseStore(JSON.parse(await readFile(FILE, "utf8")));
  } catch {
    return emptyStore();
  }
}

async function writeFileStore(store: Store): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, `${JSON.stringify(store, null, 2)}\n`);
}

async function readStore(): Promise<Store> {
  if (redisConfigured()) return readRedisStore();
  if (process.env.VERCEL) throw new StoreNotConfiguredError();
  return readFileStore();
}

async function withStore<T>(task: (store: Store) => Promise<T> | T): Promise<T> {
  if (redisConfigured()) {
    const store = await readRedisStore();
    const result = await task(store);
    await writeRedisStore(store);
    return result;
  }
  if (process.env.VERCEL) throw new StoreNotConfiguredError();

  const run = fileChain.then(async () => {
    const store = await readFileStore();
    const result = await task(store);
    await writeFileStore(store);
    return result;
  });
  fileChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function sameRoll(
  testId: string,
  candidateId: string,
  otherTestId: string,
  otherCandidateId: string,
): boolean {
  return (
    testId === otherTestId &&
    normalizeCandidateId(candidateId) === normalizeCandidateId(otherCandidateId)
  );
}

function rollUses(store: Store): RollUse[] {
  return [
    ...store.claims.map((claim) => ({
      testId: claim.testId,
      candidateId: claim.candidateId,
      attemptId: claim.attemptId,
    })),
    ...store.results.map((result) => ({
      testId: result.testId,
      candidateId: result.candidateId,
      attemptId: result.attemptId,
    })),
  ];
}

function activeUses(store: Store): RollUse[] {
  return rollUses(store).filter((use) => !store.supersededAttemptIds.includes(use.attemptId));
}

export async function listReceived(): Promise<{ results: ExamResult[]; retakes: RollRetake[] }> {
  const store = await readStore();
  return { results: store.results, retakes: store.retakes };
}

export async function rollBlocked(testId: string, candidateId: string): Promise<boolean> {
  const id = normalizeCandidateId(candidateId);
  if (redisConfigured()) {
    const redis = getRedis();
    const retake = await redis.get(retakeKey(testId, id));
    if (retake) return false;
    const claim = await redis.get(claimKey(testId, id));
    if (claim) return true;
  }
  const store = await readStore();
  return isRollBlocked(rollUses(store), store.retakes, store.supersededAttemptIds, testId, id);
}

export async function allowRetake(testId: string, candidateId: string): Promise<void> {
  const id = normalizeCandidateId(candidateId);
  if (redisConfigured()) {
    await getRedis().set(retakeKey(testId, id), "1");
  } else if (process.env.VERCEL) {
    throw new StoreNotConfiguredError();
  }
  await withStore((store) => {
    store.claims = store.claims.filter((claim) => !sameRoll(testId, id, claim.testId, claim.candidateId));
    if (!store.retakes.some((retake) => sameRoll(testId, id, retake.testId, retake.candidateId))) {
      store.retakes.push({ testId, candidateId: id });
    }
  });
}

export async function claimRoll(input: ClaimInput): Promise<ClaimOutcome> {
  const candidateId = normalizeCandidateId(input.candidateId);
  const candidateName = normalizeCandidateName(input.candidateName);
  const testId = input.testId;
  const attemptId = input.attemptId;
  if (!candidateId || !candidateName || !testId || !attemptId) {
    return { ok: false, status: 400, error: "Invalid claim" };
  }

  let replaced = false;
  if (redisConfigured()) {
    const verdict = await getRedis().eval<[string], string>(
      CLAIM_SCRIPT,
      [claimKey(testId, candidateId), retakeKey(testId, candidateId)],
      [attemptId],
    );
    if (verdict === "TAKEN") {
      return {
        ok: false,
        status: 409,
        error: ROLL_ALREADY_USED,
      };
    }
    if (verdict !== "OK" && verdict !== "SAME" && verdict !== "REPLACED") {
      throw new Error("The CNIC number could not be claimed.");
    }
    replaced = verdict === "REPLACED";
  } else if (process.env.VERCEL) {
    throw new StoreNotConfiguredError();
  }

  return withStore((store) => {
    const draft = structuredClone(store);
    const retake =
      replaced || draft.retakes.some((row) => sameRoll(testId, candidateId, row.testId, row.candidateId));
    if (retake) {
      for (const result of draft.results) {
        if (
          sameRoll(testId, candidateId, result.testId, result.candidateId) &&
          !draft.supersededAttemptIds.includes(result.attemptId)
        ) {
          draft.supersededAttemptIds.push(result.attemptId);
        }
      }
      draft.retakes = draft.retakes.filter(
        (row) => !sameRoll(testId, candidateId, row.testId, row.candidateId),
      );
      draft.claims = draft.claims.filter(
        (claim) => !sameRoll(testId, candidateId, claim.testId, claim.candidateId),
      );
    }

    const owner = findRollUse(activeUses(draft), testId, candidateId);
    if (!redisConfigured() && owner && owner.attemptId !== attemptId) {
      return {
        ok: false as const,
        status: 409 as const,
        error: ROLL_ALREADY_USED,
      };
    }
    if (redisConfigured() && owner && owner.attemptId !== attemptId) {
      draft.claims = draft.claims.filter(
        (claim) => !sameRoll(testId, candidateId, claim.testId, claim.candidateId),
      );
    }
    if (!owner) {
      draft.claims.push({
        testId,
        candidateName,
        candidateId,
        attemptId,
        claimedAt: new Date().toISOString(),
      });
    }
    store.results = draft.results;
    store.claims = draft.claims;
    store.retakes = draft.retakes;
    store.supersededAttemptIds = draft.supersededAttemptIds;
    return { ok: true as const };
  });
}

export async function saveExamResult(
  result: ExamResult,
): Promise<{ ok: true } | { ok: false; status: 409; error: string }> {
  const candidateId = normalizeCandidateId(result.candidateId);
  const candidateName = normalizeCandidateName(result.candidateName);
  const next: ExamResult = { ...result, candidateId, candidateName };

  return withStore((store) => {
    const owner = findRollUse(activeUses(store), next.testId, next.candidateId);
    if (owner && owner.attemptId !== next.attemptId) {
      return {
        ok: false as const,
        status: 409 as const,
        error: ROLL_ALREADY_USED,
      };
    }

    const replacedIds = store.results
      .filter(
        (row) =>
          row.attemptId !== next.attemptId &&
          store.supersededAttemptIds.includes(row.attemptId) &&
          sameRoll(next.testId, next.candidateId, row.testId, row.candidateId),
      )
      .map((row) => row.attemptId);
    store.results = store.results.filter((row) => !replacedIds.includes(row.attemptId));
    store.supersededAttemptIds = store.supersededAttemptIds.filter((id) => !replacedIds.includes(id));
    const index = store.results.findIndex((row) => row.attemptId === next.attemptId);
    if (index >= 0) store.results[index] = next;
    else store.results.push(next);
    if (!owner) {
      store.claims.push({
        testId: next.testId,
        candidateName: next.candidateName,
        candidateId: next.candidateId,
        attemptId: next.attemptId,
        claimedAt: next.endedAt,
      });
    }
    return { ok: true as const };
  });
}
