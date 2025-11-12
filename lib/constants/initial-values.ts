import { Word, WordMeaning } from "../generated/prisma/client";

export const INITIAL_MEANING: WordMeaning = {
  id: "",
  wordId: "",
  definition: "",
  partOfSpeech: "",
  exampleSentences: [],
  synonyms: [],
  antonyms: [],
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
