import { DifficultyLevel, MasteryLevel } from "../generated/prisma/enums";
import z from "zod";

export const saveWordMeaningValidator = z.object({
  definition: z.string().min(1, "Definition is required."),
  partOfSpeech: z.string().optional(),
  exampleSentences: z.array(z.string()).optional(),
  synonyms: z.array(z.string()).optional(),
  antonyms: z.array(z.string()).optional(),
  usageNotes: z.string().optional(),
});

export const saveWordValidator = z.object({
  word: z.string().min(1, "Word is required."),
  pronunciation: z.string().optional(),
  cefrLevel: z.nativeEnum(DifficultyLevel).default(DifficultyLevel.A1),
  topic: z.string().optional(),
  masteryLevel: z.nativeEnum(MasteryLevel).default(MasteryLevel.New),
  audioUrl: z.string().optional(),
  tags: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").map((tag) => tag.trim()) : [])),
  meanings: z
    .array(saveWordMeaningValidator)
    .min(1, "At least one meaning is required."),
});
