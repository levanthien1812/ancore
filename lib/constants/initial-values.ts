import type { Word, WordMeaning } from "../generated/prisma/client";
import { WordsCountByMasteryLevel } from "../type";

export const INITIAL_MEANING: WordMeaning = {
  id: "",
  wordId: "",
  definition: "",
  partOfSpeech: "",
  exampleSentences: "",
  synonyms: "",
  antonyms: "",
  usageNotes: "",
};

export const INITIAL_WORD: Word = {
  id: "",
  word: "",
  pronunciation: "",
  cefrLevel: "A1",
  createdAt: new Date(),
  updatedAt: new Date(),
  masteryLevel: "New",
  tags: [],
  userId: "",
  audioUrl: "",
};

export const defaultWordsCountByMasteryLevel: WordsCountByMasteryLevel = {
  New: 0,
  Learning: 0,
  Familiar: 0,
  Mastered: 0,
};
