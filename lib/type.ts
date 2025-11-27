import { type } from "os";
import { MasteryLevel } from "./generated/prisma/enums";
import { QuizQuestion, Word } from "./generated/prisma/client";

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

export type { QuizQuestion, QuestionType } from "./generated/prisma/client";

export type QuizQuestionWithWords = QuizQuestion & {
  words: Word[];
};
