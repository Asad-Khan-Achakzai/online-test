export type AttemptStatus = "IN_PROGRESS" | "COMPLETED" | "TERMINATED";

/**
 * A detected departure from the examination environment.
 * These reasons always produce TERMINATED, never a resumable attempt.
 */
export type ViolationReason =
  | "PAGE_HIDDEN"
  | "WINDOW_BLUR"
  | "FULLSCREEN_EXIT"
  | "NAVIGATION_ATTEMPT"
  | "BROWSER_EXIT"
  | "MULTI_TAB";

/** A normal ending. Status becomes COMPLETED. */
export type CompletionReason = "TIME_EXPIRED" | "MANUAL_SUBMISSION";

export type TerminationReason = ViolationReason | CompletionReason;

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
  /** Option id, not a display position. Shuffling options must not change this. */
  correctAnswer: string;
}

/** Question payload safe to render. The correct answer is omitted on purpose. */
export interface PublicQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
}

export interface ExamResult {
  attemptId: string;
  testId: string;
  candidateName: string;
  candidateId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  percentage: number;
  timeTakenMs: number;
  startedAt: string;
  endedAt: string;
  status: AttemptStatus;
  terminationReason?: ViolationReason;
  completionReason?: CompletionReason;
}

export interface ExamAttempt {
  attemptId: string;
  testId: string;
  candidateName: string;
  candidateId: string;
  startedAt: string;
  endedAt?: string;
  status: AttemptStatus;
  currentQuestion: number;
  /** questionId -> selected optionId */
  answers: Record<string, string>;
  questionOrder: string[];
  optionOrders: Record<string, string[]>;
  violationCount: number;
  terminationReason?: ViolationReason;
  completionReason?: CompletionReason;
  result?: ExamResult;
}

export type ExamPhase =
  | "loading"
  | "details"
  | "instructions"
  | "exam"
  | "completed"
  | "terminated"
  | "blocked";

export interface InterpretedAttempt {
  phase: Exclude<ExamPhase, "instructions" | "loading">;
  attempt: ExamAttempt | null;
  /** When set, this record must be written before the candidate can continue. */
  persist: ExamAttempt | null;
}
