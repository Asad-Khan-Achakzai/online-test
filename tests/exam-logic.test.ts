import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { EXAM_CONFIG } from "../src/config/examConfig";
import { listQuestions } from "../src/data/test";
import { validateCandidate } from "../src/lib/exam/candidate";
import { shuffleWithSeed } from "../src/lib/exam/examRandomization";
import { scoreAttempt } from "../src/lib/exam/examScoring";
import {
  createAttempt,
  interpretStoredAttempt,
  isValidAttempt,
} from "../src/lib/exam/examState";
import {
  attemptStorageKey,
  claimAttempt,
  loadAttempt,
} from "../src/lib/exam/examStorage";
import {
  completeStoredAttempt,
  terminateStoredAttempt,
} from "../src/lib/exam/examTermination";
import { clearLiveSession, isLiveSession, markLiveSession } from "../src/lib/exam/liveSession";
import { randomId } from "../src/lib/exam/randomId";
import { findRollUse, isRollBlocked } from "../src/lib/exam/rollClaim";
import { buildResultsPdf, summarizeResults } from "../src/lib/exam/resultsPdf";
import { remainingMs } from "../src/lib/exam/time";
import type { ExamAttempt } from "../src/types/exam";

function installStorage(): void {
  const map = new Map<string, string>();
  const storage = {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? (map.get(key) ?? null) : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
  });
}

function sampleAttempt(now = new Date("2026-09-28T10:00:00.000Z")): ExamAttempt {
  return createAttempt({
    testId: EXAM_CONFIG.testId,
    candidateName: "Ahmed Khan",
    candidateId: "med-1024",
    now,
    attemptId: "attempt-fixed-0001",
  });
}

beforeEach(() => {
  installStorage();
  clearLiveSession();
});

describe("candidate details", () => {
  it("requires a name and a roll number", () => {
    const errors = validateCandidate("  ", " ");
    assert.equal(typeof errors.name, "string");
    assert.equal(typeof errors.candidateId, "string");
  });

  it("accepts a normal name and roll number", () => {
    const errors = validateCandidate("Ahmed Khan", "MED-1024");
    assert.deepEqual(errors, {});
  });
});

describe("randomization", () => {
  it("keeps the same order for the same attempt seed", () => {
    const questions = listQuestions();
    const first = shuffleWithSeed(questions, "attempt-fixed-0001:questions").map(
      (question) => question.id,
    );
    const second = shuffleWithSeed(questions, "attempt-fixed-0001:questions").map(
      (question) => question.id,
    );
    assert.deepEqual(first, second);
    assert.equal(new Set(first).size, questions.length);
  });

  it("does not change which option id is correct", () => {
    const attempt = sampleAttempt();
    for (const question of listQuestions()) {
      const order = attempt.optionOrders[question.id];
      assert.ok(order.includes(question.correctAnswer));
      assert.equal(new Set(order).size, question.options.length);
    }
  });
});

describe("scoring and final states", () => {
  it("scores selected option ids after they have been reordered", () => {
    const attempt = sampleAttempt();
    for (const questionId of attempt.questionOrder) {
      const question = listQuestions().find((item) => item.id === questionId);
      assert.ok(question);
      attempt.answers[questionId] = question.correctAnswer;
    }
    const endedAt = "2026-09-28T10:22:14.000Z";
    const result = scoreAttempt(attempt, endedAt, {
      status: "COMPLETED",
      completionReason: "MANUAL_SUBMISSION",
    });
    assert.equal(result.score, attempt.questionOrder.length);
    assert.equal(result.percentage, 100);
    assert.equal(result.incorrectAnswers, 0);
    assert.equal(result.unanswered, 0);
    assert.equal(result.timeTakenMs, 22 * 60 * 1000 + 14 * 1000);
  });

  it("counts a blank answer separately from a wrong answer", () => {
    const attempt = sampleAttempt();
    const [first, second] = attempt.questionOrder;
    const firstQuestion = listQuestions().find((item) => item.id === first);
    assert.ok(firstQuestion);
    const wrong = firstQuestion.options.find((option) => option.id !== firstQuestion.correctAnswer);
    assert.ok(wrong);
    attempt.answers[first] = wrong.id;
    const result = scoreAttempt(attempt, "2026-09-28T10:10:00.000Z", {
      status: "COMPLETED",
      completionReason: "TIME_EXPIRED",
    });
    assert.equal(result.correctAnswers, 0);
    assert.equal(result.incorrectAnswers, 1);
    assert.equal(result.unanswered, attempt.questionOrder.length - 1);
    assert.equal(second.length > 0, true);
  });

  it("never returns a finished attempt to in progress", () => {
    const attempt = sampleAttempt();
    const completed = completeStoredAttempt(
      attempt,
      "MANUAL_SUBMISSION",
      new Date("2026-09-28T10:20:00.000Z"),
    );
    assert.equal(completed.status, "COMPLETED");
    assert.equal(terminateStoredAttempt(completed, "PAGE_HIDDEN").status, "COMPLETED");

    const terminated = terminateStoredAttempt(attempt, "PAGE_HIDDEN");
    assert.equal(terminated.status, "TERMINATED");
    assert.equal(terminated.terminationReason, "PAGE_HIDDEN");
    assert.equal(terminated.violationCount, 1);
    assert.equal(completeStoredAttempt(terminated, "TIME_EXPIRED").status, "TERMINATED");
  });
});

describe("stored attempt policy", () => {
  it("terminates a reloaded in-progress attempt instead of resuming it", () => {
    const attempt = sampleAttempt();
    const interpreted = interpretStoredAttempt(JSON.stringify(attempt), EXAM_CONFIG.testId);
    assert.equal(interpreted.phase, "terminated");
    assert.equal(interpreted.attempt?.status, "TERMINATED");
    assert.equal(interpreted.attempt?.terminationReason, "BROWSER_EXIT");
    assert.ok(interpreted.persist);
    const again = interpretStoredAttempt(
      JSON.stringify(interpreted.persist),
      EXAM_CONFIG.testId,
    );
    assert.equal(again.phase, "terminated");
    assert.equal(again.persist, null);
  });

  it("keeps the live in-memory session on the examination", () => {
    const attempt = sampleAttempt();
    markLiveSession(attempt.attemptId);
    const interpreted = interpretStoredAttempt(JSON.stringify(attempt), EXAM_CONFIG.testId);
    assert.equal(interpreted.phase, "exam");
    assert.equal(isLiveSession(attempt.attemptId), true);
  });

  it("shows completed and terminated records without offering a new start", () => {
    const completed = completeStoredAttempt(sampleAttempt(), "TIME_EXPIRED");
    assert.equal(
      interpretStoredAttempt(JSON.stringify(completed), EXAM_CONFIG.testId).phase,
      "completed",
    );
    const terminated = terminateStoredAttempt(sampleAttempt(), "FULLSCREEN_EXIT");
    assert.equal(
      interpretStoredAttempt(JSON.stringify(terminated), EXAM_CONFIG.testId).phase,
      "terminated",
    );
    assert.equal(interpretStoredAttempt(null, EXAM_CONFIG.testId).phase, "details");
    assert.equal(interpretStoredAttempt("{", EXAM_CONFIG.testId).phase, "blocked");
  });

  it("rejects a second claim in the same browser", () => {
    const first = sampleAttempt();
    assert.equal(claimAttempt(first), true);
    const second = createAttempt({
      testId: EXAM_CONFIG.testId,
      candidateName: "Other Candidate",
      candidateId: "9999",
      attemptId: "attempt-fixed-0002",
    });
    assert.equal(claimAttempt(second), false);
    assert.equal(loadAttempt(EXAM_CONFIG.testId)?.attemptId, first.attemptId);
    assert.equal(isValidAttempt(loadAttempt(EXAM_CONFIG.testId), EXAM_CONFIG.testId), true);
    assert.ok(localStorage.getItem(attemptStorageKey(EXAM_CONFIG.testId)));
  });
});

describe("roll number", () => {
  it("treats spacing and letter case as the same roll number", () => {
    const uses = [
      { testId: "medical-entry-2026", candidateId: "MED-1042", attemptId: "attempt-1" },
    ];
    const owner = findRollUse(uses, "medical-entry-2026", " med-1042 ");
    assert.equal(owner?.attemptId, "attempt-1");
    assert.equal(findRollUse(uses, "medical-entry-2026", "MED-9999"), undefined);
    assert.equal(findRollUse(uses, "other-test", "MED-1042"), undefined);
  });

  it("lets an administrator release a roll number for one replacement attempt", () => {
    const uses = [
      { testId: "medical-entry-2026", candidateId: "88877", attemptId: "attempt-old" },
    ];
    assert.equal(isRollBlocked(uses, [], [], "medical-entry-2026", "88877"), true);
    assert.equal(
      isRollBlocked(uses, [{ testId: "medical-entry-2026", candidateId: "88877" }], [], "medical-entry-2026", "88877"),
      false,
    );
    assert.equal(
      isRollBlocked(uses, [], ["attempt-old"], "medical-entry-2026", "88877"),
      false,
    );
  });
});

describe("results report", () => {
  it("summarizes scores and writes a PDF document", () => {
    const results = [
      {
        attemptId: "report-1",
        testId: "medical-entry-2026",
        candidateName: "Saleem",
        candidateId: "899966",
        score: 8,
        totalQuestions: 12,
        correctAnswers: 8,
        incorrectAnswers: 4,
        unanswered: 0,
        percentage: 67,
        timeTakenMs: 12 * 60 * 1000,
        startedAt: "2026-09-28T09:00:00.000Z",
        endedAt: "2026-09-28T09:12:00.000Z",
        status: "COMPLETED" as const,
        completionReason: "MANUAL_SUBMISSION" as const,
      },
      {
        attemptId: "report-2",
        testId: "medical-entry-2026",
        candidateName: "Janan",
        candidateId: "88877",
        score: 0,
        totalQuestions: 12,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unanswered: 12,
        percentage: 0,
        timeTakenMs: 4000,
        startedAt: "2026-09-28T09:20:00.000Z",
        endedAt: "2026-09-28T09:20:04.000Z",
        status: "TERMINATED" as const,
        terminationReason: "PAGE_HIDDEN" as const,
      },
    ];
    assert.deepEqual(summarizeResults(results), {
      candidates: 2,
      completed: 1,
      terminated: 1,
      average: 34,
    });
    const pdf = buildResultsPdf(results, new Date("2026-09-28T12:00:00.000Z")).output();
    assert.equal(pdf.startsWith("%PDF-"), true);
  });
});

describe("random ids", () => {
  it("builds an id when randomUUID is missing", () => {
    const original = globalThis.crypto.randomUUID;
    Object.defineProperty(globalThis.crypto, "randomUUID", {
      value: undefined,
      configurable: true,
    });
    try {
      const id = randomId();
      assert.match(
        id,
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    } finally {
      Object.defineProperty(globalThis.crypto, "randomUUID", {
        value: original,
        configurable: true,
      });
    }
  });
});

describe("timer", () => {
  it("computes remaining time from the original start timestamp", () => {
    const startedAt = "2026-09-28T10:00:00.000Z";
    const duration = 30 * 60 * 1000;
    const later = Date.parse(startedAt) + 125000;
    assert.equal(remainingMs(startedAt, duration, later), duration - 125000);
    assert.equal(remainingMs(startedAt, duration, Date.parse(startedAt) + duration + 5000), 0);
  });
});
