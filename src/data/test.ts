import { QUESTIONS } from "@/data/questions";
import type { PublicQuestion, Question } from "@/types/exam";

const QUESTION_MAP = new Map(QUESTIONS.map((question) => [question.id, question]));

export function listQuestions(): Question[] {
  return QUESTIONS;
}

export function getQuestion(id: string): Question | undefined {
  return QUESTION_MAP.get(id);
}

/**
 * Copies only the fields the examination screen is allowed to render.
 * Scoring imports `getQuestion` separately and is still shipped in this
 * frontend bundle. See the README for that limitation.
 */
export function getPublicQuestion(id: string): PublicQuestion | null {
  const question = QUESTION_MAP.get(id);
  if (!question) return null;
  return {
    id: question.id,
    question: question.question,
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text,
    })),
  };
}

export function questionCount(): number {
  return QUESTIONS.length;
}
