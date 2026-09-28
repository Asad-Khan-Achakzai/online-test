import { EXAM_CONFIG } from "@/config/examConfig";
import { listQuestions } from "@/data/test";
import { shuffleWithSeed } from "@/lib/exam/examRandomization";

export interface AttemptOrder {
  questionOrder: string[];
  optionOrders: Record<string, string[]>;
}

export function buildAttemptOrder(attemptId: string): AttemptOrder {
  const questions = listQuestions();
  const questionOrder = EXAM_CONFIG.allowQuestionRandomization
    ? shuffleWithSeed(questions, `${attemptId}:questions`).map((question) => question.id)
    : questions.map((question) => question.id);

  const optionOrders: Record<string, string[]> = {};
  for (const question of questions) {
    const options = EXAM_CONFIG.allowOptionRandomization
      ? shuffleWithSeed(question.options, `${attemptId}:options:${question.id}`)
      : question.options;
    optionOrders[question.id] = options.map((option) => option.id);
  }

  return { questionOrder, optionOrders };
}
