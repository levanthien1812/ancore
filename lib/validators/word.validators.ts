import z from "zod";
import { CEFRLevel, MasteryLevel } from "../constants/enums";

export const saveWordMeaningSchema = z.object({
  definition: z.string().trim().min(1, "Definition is required."),
  partOfSpeech: z.string().trim().optional(),
  exampleSentences: z.string().trim().optional(),
  synonyms: z.string().trim().optional(),
  antonyms: z.string().trim().optional(),
  usageNotes: z.string().trim().optional(),
});

export type SaveWordMeaningFormData = z.infer<typeof saveWordMeaningSchema>;

export const saveWordSchema = z.object({
  word: z.string().trim().min(1, "Word is required."),
  pronunciation: z.string().trim().optional(),
  cefrLevel: z.nativeEnum(CEFRLevel).default(CEFRLevel.A1),
  topic: z.string().trim().optional(),
  masteryLevel: z.nativeEnum(MasteryLevel).default(MasteryLevel.New),
  audioUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal("")),
  tags: z.string().optional(),
  meanings: z
    .array(saveWordMeaningSchema)
    .min(1, "At least one meaning is required."),
});

export type SaveWordFormData = z.infer<typeof saveWordSchema>;
