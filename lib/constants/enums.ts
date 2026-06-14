import { ReviewPerformance } from "@prisma/client";
import { ReviewPeriod } from "../utils/date-helpers";

export enum CEFRLevel {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

export enum MasteryLevel {
  New = "New",
  Learning = "Learning",
  Familiar = "Familiar",
  Mastered = "Mastered",
}

export const CEFR_LEVELS: CEFRLevel[] = [
  CEFRLevel.A1,
  CEFRLevel.A2,
  CEFRLevel.B1,
  CEFRLevel.B2,
  CEFRLevel.C1,
  CEFRLevel.C2,
];

export const MASTERY_LEVELS: MasteryLevel[] = [
  MasteryLevel.New,
  MasteryLevel.Learning,
  MasteryLevel.Familiar,
  MasteryLevel.Mastered,
];

export enum PartOfSpeech {
  Noun = "noun",
  Verb = "verb",
  Adjective = "adjective",
  Adverb = "adverb",
  Preposition = "preposition",
  Conjunction = "conjunction",
  PhrasalVerb = "phrasal verb",
  Idiom = "idiom",
  Expression = "expression",
  ComplexPreposition = "complex preposition",
  Phrase = "phrase",
}

export const PARTS_OF_SPEECH: PartOfSpeech[] = [
  PartOfSpeech.Noun,
  PartOfSpeech.Verb,
  PartOfSpeech.Adjective,
  PartOfSpeech.Adverb,
  PartOfSpeech.Preposition,
];

export const PARTS_OF_SPEECH_PHRASES: PartOfSpeech[] = [
  PartOfSpeech.PhrasalVerb,
  PartOfSpeech.Idiom,
  PartOfSpeech.Expression,
  PartOfSpeech.ComplexPreposition,
  PartOfSpeech.Phrase,
];

export const SAMPLE_TOPICS = [
  "Daily Activities",
  "Food & Cooking",
  "Travel",
  "Work & Careers",
  "Education & Learning",
  "Health & Medicine",
  "Technology",
  "Shopping",
  "Weather & Seasons",
  "Relationships & Family",
  "Hobbies & Free Time",
  "Environment",
  "Culture",
  "Housing & Furniture",
  "Transportation",
  "Business & Finance",
  "News & Media",
  "Entertainment",
  "Science",
  "Emotions & Personality",
];

export enum QuizQuestionType {
  DefinitionToWord_Typing = "DefinitionToWord_Typing",
  WordToSynonym = "WordToSynonym",
  Matching = "Matching",
  FillInTheBlank = "FillInTheBlank",
}

export enum QuizQuestionTypeLabel {
  DefinitionToWord_Typing = "Definition",
  WordToSynonym = "Synonym/Antonym",
  Matching = "Matching",
  FillInTheBlank = "Fill in the blank",
}

export enum NoteTags {
  PRONUNICATION = "pronunciation",
  GRAMMAR = "grammar",
  VOCABULARY = "vocabulary",
  EXPRESSION = "expression",
}

export const NOTE_TAGS: NoteTags[] = [
  NoteTags.PRONUNICATION,
  NoteTags.GRAMMAR,
  NoteTags.VOCABULARY,
  NoteTags.EXPRESSION,
];

export enum QuizStatusUI {
  ALL = "All",
  PERFECT = "Perfect",
  EXCELLENT = "Excellent",
  NEEDS_REVIEW = "NeedsReview",
  IN_PROGRESS = "InProgress",
}

export enum QuizStatusLabel {
  ALL = "All",
  PERFECT = "Perfect",
  EXCELLENT = "Excellent",
  NEEDS_REVIEW = "Needs Review",
  IN_PROGRESS = "In Progress",
}

export const MasteryLevelColorCode: Record<
  MasteryLevel,
  { primary: string; light: string; dark: string }
> = {
  [MasteryLevel.New]: {
    primary: "#3B82F6",
    light: "#DBEAFE",
    dark: "#1D4ED8",
  },
  [MasteryLevel.Learning]: {
    primary: "#F59E0B",
    light: "#FEF3C7",
    dark: "#B45309",
  },
  [MasteryLevel.Familiar]: {
    primary: "#8B5CF6",
    light: "#EDE9FE",
    dark: "#6D28D9",
  },
  [MasteryLevel.Mastered]: {
    primary: "#22C55E",
    light: "#DCFCE7",
    dark: "#15803D",
  },
};

export type WordReviewInfo = {
  nextReviewAt: Date | null;
  nextReviewIn: number | null;
  overdueIn: number | null;
  lastReviewAt: Date | null;
  reviewedTimes: number;
};

export const REVIEW_PERIOD_LABEL: Record<ReviewPeriod, string> = {
  "7_days": "7 days",
  "1_month": "1 month",
  all_time: "All time",
};

export const REVIEW_PERFORMANCE_COLOR: Record<ReviewPerformance, string> = {
  [ReviewPerformance.Forgot]: "#BDE8F5",
  [ReviewPerformance.Hard]: "#4988C4",
  [ReviewPerformance.Medium]: "#1C4D8D",
  [ReviewPerformance.Good]: "#2C5EAD",
  [ReviewPerformance.Easy]: "#0F2854",
};

export enum ReviewFrequency {
  Daily = "Daily",
  Every2Days = "Every2Days",
  Custom = "Custom",
}

export enum DayOfWeek {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

export enum QuizResultMode {
  AfterEachQuestion = "AfterEachQuestion",
  AtTheEnd = "AtTheEnd",
}

export enum SpacedRepetitionAlgorithm {
  Default = "Default",
  Custom = "Custom",
}

export enum NotificationType {
  Daily = "Daily",
  MissedReview = "MissedReview",
  Streak = "Streak",
  DailyNewWordsGoal = "DailyNewWordsGoal",
}
