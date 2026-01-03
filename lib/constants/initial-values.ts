import { ActionState, WordsCountByMasteryLevel } from "../type";
import { CEFRLevel, MasteryLevel } from "./enums";
import { Word, WordMeaning } from "@prisma/client";

export const INITIAL_MEANING: WordMeaning = {
  id: "",
  wordId: "",
  definition: "",
  partOfSpeech: "",
  exampleSentences: "",
  synonyms: "",
  antonyms: "",
  whenToUse: "",
  usageNotes: "",
};

export const INITIAL_WORD: Word = {
  id: "",
  word: "",
  pronunciation: "",
  cefrLevel: CEFRLevel.A1,
  createdAt: new Date(),
  updatedAt: new Date(),
  masteryLevel: MasteryLevel.New,
  tags: "",
  userId: "",
  audioUrl: "",
  highlighted: false,
};

export const defaultWordsCountByMasteryLevel: WordsCountByMasteryLevel = {
  New: 0,
  Learning: 0,
  Familiar: 0,
  Mastered: 0,
};

export const initialActionState: ActionState = {
  success: false,
  message: "",
  errors: {},
};
