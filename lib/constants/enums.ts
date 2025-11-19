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
