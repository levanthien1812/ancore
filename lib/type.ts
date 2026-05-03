import {
  MasteryLevel,
  QuizAnswer,
  QuizQuestion,
  QuizzesLog,
  Word,
} from "@prisma/client";

export type WordsCountByMasteryLevel = {
  [key in MasteryLevel]: number;
};

export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface WordFitler {
  masteryLevel?: MasteryLevel;
  tags?: string[];
  page: number;
  limit: number;
}

export type Period = "day" | "week" | "month";
export type WordsCountByPeriod = {
  periodStart: Date;
} & {
  [key in MasteryLevel]: number;
};

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export type QuizQuestionWithWords = QuizQuestion & {
  words: Word[];
};

export type QuizAnswerWithQuestion = QuizAnswer & {
  quizQuestion: QuizQuestionWithWords;
};

export type QuizLogWithAnswers = QuizzesLog & {
  quizAnswers: QuizAnswerWithQuestion[];
};
