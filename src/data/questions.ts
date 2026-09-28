import type { Question } from "@/types/exam";

/**
 * Question bank for the one-time examination.
 * Replace or edit these items before the sitting. There is no question editor.
 * `correctAnswer` is an option id. It stays attached to that option when the
 * displayed order is shuffled.
 */
export const QUESTIONS: Question[] = [
  {
    id: "q01",
    question: "Which chamber of the heart pumps blood into the aorta?",
    options: [
      { id: "q01a", text: "Right atrium" },
      { id: "q01b", text: "Left atrium" },
      { id: "q01c", text: "Right ventricle" },
      { id: "q01d", text: "Left ventricle" },
    ],
    correctAnswer: "q01d",
  },
  {
    id: "q02",
    question: "Which range is the usual resting heart rate for a healthy adult?",
    options: [
      { id: "q02a", text: "20 to 40 beats per minute" },
      { id: "q02b", text: "60 to 100 beats per minute" },
      { id: "q02c", text: "120 to 160 beats per minute" },
      { id: "q02d", text: "180 to 220 beats per minute" },
    ],
    correctAnswer: "q02b",
  },
  {
    id: "q03",
    question: "Which blood cells carry oxygen bound to haemoglobin?",
    options: [
      { id: "q03a", text: "Platelets" },
      { id: "q03b", text: "Lymphocytes" },
      { id: "q03c", text: "Erythrocytes" },
      { id: "q03d", text: "Neutrophils" },
    ],
    correctAnswer: "q03c",
  },
  {
    id: "q04",
    question: "Which organ produces insulin?",
    options: [
      { id: "q04a", text: "Liver" },
      { id: "q04b", text: "Pancreas" },
      { id: "q04c", text: "Spleen" },
      { id: "q04d", text: "Adrenal gland" },
    ],
    correctAnswer: "q04b",
  },
  {
    id: "q05",
    question:
      "In an emergency, which red-cell group is used as the universal donor group?",
    options: [
      { id: "q05a", text: "AB positive" },
      { id: "q05b", text: "A positive" },
      { id: "q05c", text: "B negative" },
      { id: "q05d", text: "O negative" },
    ],
    correctAnswer: "q05d",
  },
  {
    id: "q06",
    question: "Which structure connects a skeletal muscle to a bone?",
    options: [
      { id: "q06a", text: "Ligament" },
      { id: "q06b", text: "Tendon" },
      { id: "q06c", text: "Cartilage" },
      { id: "q06d", text: "Fascia only" },
    ],
    correctAnswer: "q06b",
  },
  {
    id: "q07",
    question: "Where does most gas exchange occur in the lungs?",
    options: [
      { id: "q07a", text: "Trachea" },
      { id: "q07b", text: "Main bronchi" },
      { id: "q07c", text: "Alveoli" },
      { id: "q07d", text: "Pleural cavity" },
    ],
    correctAnswer: "q07c",
  },
  {
    id: "q08",
    question: "Which vitamin is produced in the skin when it is exposed to sunlight?",
    options: [
      { id: "q08a", text: "Vitamin A" },
      { id: "q08b", text: "Vitamin C" },
      { id: "q08c", text: "Vitamin D" },
      { id: "q08d", text: "Vitamin K" },
    ],
    correctAnswer: "q08c",
  },
  {
    id: "q09",
    question: "Which temperature is the usual average human body temperature?",
    options: [
      { id: "q09a", text: "35.0 °C" },
      { id: "q09b", text: "37.0 °C" },
      { id: "q09c", text: "39.0 °C" },
      { id: "q09d", text: "40.5 °C" },
    ],
    correctAnswer: "q09b",
  },
  {
    id: "q10",
    question: "Which organism causes tuberculosis?",
    options: [
      { id: "q10a", text: "Mycobacterium tuberculosis" },
      { id: "q10b", text: "Streptococcus pyogenes" },
      { id: "q10c", text: "Plasmodium falciparum" },
      { id: "q10d", text: "Candida albicans" },
    ],
    correctAnswer: "q10a",
  },
  {
    id: "q11",
    question:
      "Which practice most effectively interrupts routine contact transmission in a clinic?",
    options: [
      { id: "q11a", text: "Wearing a wristwatch" },
      { id: "q11b", text: "Hand hygiene before and after patient contact" },
      { id: "q11c", text: "Opening a window once a day" },
      { id: "q11d", text: "Using the same gloves for several patients" },
    ],
    correctAnswer: "q11b",
  },
  {
    id: "q12",
    question: "Which anatomical plane divides the body into left and right portions?",
    options: [
      { id: "q12a", text: "Coronal plane" },
      { id: "q12b", text: "Transverse plane" },
      { id: "q12c", text: "Sagittal plane" },
      { id: "q12d", text: "Oblique plane only" },
    ],
    correctAnswer: "q12c",
  },
];

function assertQuestionBank(questions: Question[]): void {
  const ids = new Set<string>();
  for (const question of questions) {
    if (ids.has(question.id)) {
      throw new Error(`Duplicate question id: ${question.id}`);
    }
    ids.add(question.id);
    const optionIds = new Set<string>();
    for (const option of question.options) {
      if (optionIds.has(option.id)) {
        throw new Error(`Duplicate option id ${option.id} on ${question.id}`);
      }
      optionIds.add(option.id);
      if (!option.text.trim()) {
        throw new Error(`Empty option text on ${question.id}`);
      }
    }
    if (!optionIds.has(question.correctAnswer)) {
      throw new Error(
        `correctAnswer ${question.correctAnswer} is not an option of ${question.id}`,
      );
    }
    if (!question.question.trim()) {
      throw new Error(`Empty question text on ${question.id}`);
    }
  }
}

assertQuestionBank(QUESTIONS);
