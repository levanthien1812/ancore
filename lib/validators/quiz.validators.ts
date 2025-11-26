import z from "zod";
import { QuizQuestionType } from "../constants/enums";

export const quizQuestionSchema = z.object({
  // To handle the many-to-many relationship
  wordIds: z.array(z.string()),
  direction: z.string(),
  question: z.string(), // The core content (e.g., a definition, a word, a sentence with a blank)
  type: z.nativeEnum(QuizQuestionType),
  // `options` are required for multiple choice, but not others.
  // Defaulting to an empty array is a good practice.
  options: z.array(z.string()).default([]),
  leftItems: z.array(z.string()).optional(),
  rightItems: z.array(z.string()).optional(),
  // The answer is always a string, sometimes stringified JSON.
  answer: z.string(),
  // These will be added just before saving to the DB
  userId: z.string().optional(),
  quizzesLogId: z.string().optional(),
});
