import { ActionState, WordsCountByMasteryLevel } from "../type";
import { QuizQuestionType } from "./enums";
import {
  DayOfWeek,
  MasteryLevel,
  QuizResultMode,
  ReviewFrequency,
  SpacedRepetitionAlgorithm,
  UserSettings,
  Word,
  WordMeaning,
} from "@prisma/client";

export const INITIAL_MEANING: WordMeaning = {
  id: "",
  wordId: "",
  definition: "",
  guideWord: "",
  pronunciation: "",
  cefrLevel: null,
  partOfSpeech: "",
  examples: [""],
  synonyms: "",
  antonyms: "",
  usageNotes: "",
};

export const INITIAL_WORD: Word = {
  id: "",
  word: "",
  type: "Word",
  createdAt: new Date(),
  updatedAt: new Date(),
  masteryLevel: MasteryLevel.New,
  tags: "",
  userId: "",
  audioUrl: "",
  highlighted: false,
  isOriginal: false,
  proficiencyScore: 0,
  lastReviewedAt: null,
};

export const defaultWordsCountByMasteryLevel: WordsCountByMasteryLevel = {
  New: 0,
  Learning: 0,
  Familiar: 0,
  Mastered: 0,
};

export const INITIAL_ACTION_STATE: ActionState = {
  success: false,
  message: "",
  errors: {},
};

export const INITIAL_MESSAGE = {
  role: "user",
  content: "",
  refinement: null,
  explanation: null,
  evaluation: null,
  speakingSuggestions: [],
  createdAt: new Date(),
};

export const INITIAL_USER_SETTINGS: Omit<UserSettings, "id" | "userId"> = {
  // 1. Review settings
  wordsPerReview: 10,
  reviewFrequency: ReviewFrequency.Daily,
  reviewReminderTime: "22:00",
  reviewDays: Object.values(DayOfWeek),
  includeWordLevels: Object.values(MasteryLevel),
  prioritizeWeakWords: true,
  autoRepeatForgottenWords: true,

  // 2. Quiz settings
  questionsPerQuiz: 10,
  quizTypes: Object.values(QuizQuestionType),
  quizWordLevels: [
    MasteryLevel.Learning,
    MasteryLevel.Familiar,
    MasteryLevel.Mastered,
  ],
  timeLimitPerQuestion: 0, // 0 means no limit
  showResultsMode: QuizResultMode.AfterEachQuestion,
  allowRetry: true,
  includeAudioQuestions: true,
  includeFirstLetterInHint: true,

  // 3. Learning preference settings
  showIpaPronunciation: true,
  autoPlayPronunciation: true,
  dailyNewWordsGoal: 5,

  // 4. Spaced repetition settings
  reviewAlgorithm: SpacedRepetitionAlgorithm.Default,
  forgottenInterval: 1,
  hardInterval: 2,
  mediumInterval: 3,
  goodInterval: 5,
  easyInterval: 8,

  // 5. Notification settings
  dailyReminderEnabled: true,
  notificationTime: "19:30",
  missedReviewReminderEnabled: true,
  streakReminderEnabled: true,
  wordOfTheDayEnabled: true,

  timezone: "UTC",
};
