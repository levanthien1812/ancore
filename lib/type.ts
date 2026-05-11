import {
  MasteryLevel,
  QuizAnswer,
  QuizQuestion,
  Quiz,
  Word,
  TalkSession,
  TalkMessage,
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

export type QuizQuestionWithWords = Omit<QuizQuestion, "answer"> & {
  words: Word[];
  answer: string | null;
};

export type QuizAnswerWithQuestion = QuizAnswer & {
  quizQuestion: QuizQuestionWithWords;
};

export type QuizWithAnswers = Quiz & {
  quizAnswers: QuizAnswerWithQuestion[];
};

export type TalkSessionWithMessages = TalkSession & {
  messages: TalkMessage[];
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  refinement?: string | null;
  explanation?: string | null;
};
