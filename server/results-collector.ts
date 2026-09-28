import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeCandidateId, normalizeCandidateName } from "../src/lib/exam/candidate";
import { findRollUse, isRollBlocked, type RollRetake, type RollUse } from "../src/lib/exam/rollClaim";
import type { ExamResult } from "../src/types/exam";

const port = 3457;
const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
  "received-results.json",
);

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
  /** Roll numbers an administrator has allowed to start one more attempt. */
  retakes: RollRetake[];
  /** Previous attempt ids kept on screen until the replacement result arrives. */
  supersededAttemptIds: string[];
}

let chain = Promise.resolve();

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

async function readStore(): Promise<Store> {
  try {
    const text = await readFile(file, "utf8");
    const parsed = JSON.parse(text) as {
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
  } catch {
    return { results: [], claims: [], retakes: [], supersededAttemptIds: [] };
  }
}

async function writeStore(store: Store): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(store, null, 2)}\n`);
}

function sameRoll(testId: string, candidateId: string, otherTestId: string, otherCandidateId: string): boolean {
  return testId === otherTestId && normalizeCandidateId(candidateId) === normalizeCandidateId(otherCandidateId);
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

function enqueue(task: () => Promise<void>): void {
  chain = chain.then(task).catch((error: unknown) => {
    console.error(error);
  });
}

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

const server = createServer((request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url ?? "/", "http://127.0.0.1");

  if (request.method === "GET" && url.pathname === "/results") {
    enqueue(async () => {
      const store = await readStore();
      sendJson(response, 200, { results: store.results, retakes: store.retakes });
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/rolls") {
    enqueue(async () => {
      const testId = url.searchParams.get("testId") ?? "";
      const candidateId = normalizeCandidateId(url.searchParams.get("candidateId") ?? "");
      if (!testId || !candidateId) {
        sendJson(response, 400, { blocked: true });
        return;
      }
      const store = await readStore();
      sendJson(response, 200, {
        blocked: isRollBlocked(
          rollUses(store),
          store.retakes,
          store.supersededAttemptIds,
          testId,
          candidateId,
        ),
      });
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/retakes") {
    enqueue(async () => {
      let parsed: Partial<RollRetake>;
      try {
        parsed = JSON.parse(await readBody(request)) as Partial<RollRetake>;
      } catch {
        sendJson(response, 400, { ok: false });
        return;
      }
      const testId = String(parsed.testId ?? "");
      const candidateId = normalizeCandidateId(String(parsed.candidateId ?? ""));
      if (!testId || !candidateId) {
        sendJson(response, 400, { ok: false });
        return;
      }
      const store = await readStore();
      store.claims = store.claims.filter(
        (claim) => !sameRoll(testId, candidateId, claim.testId, claim.candidateId),
      );
      if (!store.retakes.some((retake) => sameRoll(testId, candidateId, retake.testId, retake.candidateId))) {
        store.retakes.push({ testId, candidateId });
      }
      await writeStore(store);
      sendJson(response, 200, { ok: true });
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/claims") {
    enqueue(async () => {
      let parsed: Partial<Claim>;
      try {
        parsed = JSON.parse(await readBody(request)) as Partial<Claim>;
      } catch {
        sendJson(response, 400, { ok: false, error: "Invalid JSON" });
        return;
      }
      const candidateId = normalizeCandidateId(String(parsed.candidateId ?? ""));
      const candidateName = normalizeCandidateName(String(parsed.candidateName ?? ""));
      const testId = String(parsed.testId ?? "");
      const attemptId = String(parsed.attemptId ?? "");
      if (!candidateId || !candidateName || !testId || !attemptId) {
        sendJson(response, 400, { ok: false, error: "Invalid claim" });
        return;
      }

      const store = await readStore();
      const retake = store.retakes.find((row) => sameRoll(testId, candidateId, row.testId, row.candidateId));
      if (retake) {
        for (const result of store.results) {
          if (
            sameRoll(testId, candidateId, result.testId, result.candidateId) &&
            !store.supersededAttemptIds.includes(result.attemptId)
          ) {
            store.supersededAttemptIds.push(result.attemptId);
          }
        }
        store.retakes = store.retakes.filter(
          (row) => !sameRoll(testId, candidateId, row.testId, row.candidateId),
        );
        store.claims = store.claims.filter(
          (claim) => !sameRoll(testId, candidateId, claim.testId, claim.candidateId),
        );
      }
      const owner = findRollUse(
        rollUses(store).filter((use) => !store.supersededAttemptIds.includes(use.attemptId)),
        testId,
        candidateId,
      );
      if (owner && owner.attemptId !== attemptId) {
        sendJson(response, 409, {
          ok: false,
          error: "This roll number has already been used for an attempt.",
        });
        return;
      }
      if (!owner) {
        store.claims.push({
          testId,
          candidateName,
          candidateId,
          attemptId,
          claimedAt: new Date().toISOString(),
        });
        await writeStore(store);
      }
      sendJson(response, 200, { ok: true });
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/results") {
    enqueue(async () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(await readBody(request));
      } catch {
        response.writeHead(400);
        response.end("Invalid JSON");
        return;
      }
      if (!isResult(parsed)) {
        response.writeHead(400);
        response.end("Invalid result");
        return;
      }
      parsed.candidateId = normalizeCandidateId(parsed.candidateId);
      parsed.candidateName = normalizeCandidateName(parsed.candidateName);

      const store = await readStore();
      const owner = findRollUse(
        rollUses(store).filter((use) => !store.supersededAttemptIds.includes(use.attemptId)),
        parsed.testId,
        parsed.candidateId,
      );
      if (owner && owner.attemptId !== parsed.attemptId) {
        sendJson(response, 409, {
          ok: false,
          error: "This roll number has already been used for an attempt.",
        });
        return;
      }

      const replacedIds = store.results
        .filter(
          (row) =>
            row.attemptId !== parsed.attemptId &&
            store.supersededAttemptIds.includes(row.attemptId) &&
            sameRoll(parsed.testId, parsed.candidateId, row.testId, row.candidateId),
        )
        .map((row) => row.attemptId);
      store.results = store.results.filter((row) => !replacedIds.includes(row.attemptId));
      store.supersededAttemptIds = store.supersededAttemptIds.filter((id) => !replacedIds.includes(id));
      const index = store.results.findIndex((row) => row.attemptId === parsed.attemptId);
      if (index >= 0) store.results[index] = parsed;
      else store.results.push(parsed);
      if (!owner) {
        store.claims.push({
          testId: parsed.testId,
          candidateName: parsed.candidateName,
          candidateId: parsed.candidateId,
          attemptId: parsed.attemptId,
          claimedAt: parsed.endedAt,
        });
      }
      await writeStore(store);
      response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("ok");
    });
    return;
  }

  response.writeHead(404);
  response.end("Not found");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Results collector listening on http://0.0.0.0:${port}/results`);
});
