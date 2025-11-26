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
}

export const PARTS_OF_SPEECH: PartOfSpeech[] = [
  PartOfSpeech.Noun,
  PartOfSpeech.Verb,
  PartOfSpeech.Adjective,
  PartOfSpeech.Adverb,
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

export enum ReviewPerformance {
  FORGOT = 0,
  HARD = 1,
  MEDIUM = 2,
  GOOD = 3,
  EASY = 4,
}

export enum QuizQuestionType {
  MultipleChoice_DefinitionToWord = "MultipleChoice_DefinitionToWord",
  MultipleChoice_WordToSynonym = "MultipleChoice_WordToSynonym",
  Matching = "Matching",
  FillInTheBlank = "FillInTheBlank",
}
