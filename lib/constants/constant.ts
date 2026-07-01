import { MasteryLevel, QuestionType, ReviewPerformance } from "@prisma/client";

export const PAGE_SIZES = [10, 20, 50, 100];

export const CORRECT_ENCOURAGEMENTS = [
  "Correct!",
  "Nice work!",
  "Well done!",
  "Great job!",
  "You got it!",
  "Exactly right!",
  "Spot on!",
  "That’s correct!",
];

export const INCORRECT_ENCOURAGEMENTS = [
  "Not quite.",
  "Almost there.",
  "Close one!",
  "Oops, not this time.",
  "That’s okay—keep going.",
];

export const AI_GREETINGS = [
  "I'm all ears. What’s on your mind today?",
  "Hello! Is there anything you’d like to dive into or chat about?",
  "I'm ready when you are. What should we talk about first?",
  "Hi there! I'm here to help with whatever you're working on or just to chat. What’s up?",
  "Hey! What's the latest? I'm down to talk about anything.",
  "Glad you're here. What are we thinking about today?",
  "Hi! I’ve got no agenda—just here to see what’s on your radar.",
  "Yo! Ready for a deep dive or a quick question? You call the shots.",
  "Hello! If you could talk about any topic right now, what would it be? I’m ready for it.",
  "Hey there. Whether it's a big project or a random thought, I'm here for the conversation.",
];

export const AI_NUDGES = [
  "No rush! I'm here whenever you're ready to practice.",
  "Don't worry about making mistakes, just give it a try!",
  "Stuck? You can try starting with 'I think...' or just say a single word.",
  "I'm still listening! What's on your mind regarding what I just said?",
];

export const MAXIMUM_WORDS_IN_AI_REPLY = 50;
export const MAXIMUM_TOKENS_IN_AI_RESPONSE = 500;
export const MAXIMUM_RECORDING_TIME = 30;
export const MAXIMUM_MESSAGES_IN_CHAT = 14;
export const SHOW_NUDGE_IN = 40000;
export const MAXIMUM_EXAMPLES = 10;
export const DEFAULT_WORDS_PER_REVIEW = 10;
export const DEFAULT_WORDS_PER_FETCH = 100;
export const DEFAULT_WORDS_PER_PAGE_TABLE = 10;
export const DEFAULT_WORDS_PER_PAGE_GRID = 20;

export enum QuizEvaluationLevel {
  NeedsPractice = "Needs Practice",
  Fair = "Fair",
  Good = "Good",
  Awesome = "Awesome",
  Outstanding = "Outstanding",
}

export enum QuizEvaluationEncouragement {
  NeedsPractice = "Don't worry, keep practicing and you'll get there!",
  Fair = "Not bad! A little more effort and you'll improve.",
  Good = "Good job! You're on the right track.",
  Awesome = "Awesome work! Keep it up!",
  Outstanding = "Outstanding performance! You're doing amazing!",
}

export const REQUIRED_QUESTION_TYPES: QuestionType[] = [
  QuestionType.DefinitionToWord_Typing,
];
export const REQUIRED_REVIEW_MASTERY_LEVELS: MasteryLevel[] = [
  MasteryLevel.New,
  MasteryLevel.Learning,
];

export const REQUIRED_QUIZ_MASTERY_LEVELS: MasteryLevel[] = [
  MasteryLevel.Familiar,
];

export const MAXIMUM_EXAMPLES_IN_HINTS = 3;

export const DISTRACTOR_POOL_SIZE = 50;

export const MAXIMUM_PROFICIENCY_SCORE = 100;
export const MINIMUN_PROFICIENCY_SCORE = 0;

export const REVIEW_PERFORMANCE_SCORE: Record<ReviewPerformance, number> = {
  [ReviewPerformance.Forgot]: -20,
  [ReviewPerformance.Hard]: -10,
  [ReviewPerformance.Medium]: 10,
  [ReviewPerformance.Good]: 20,
  [ReviewPerformance.Easy]: 30,
};

export const QUIZ_CORRECT_SCORE: number = 20;
export const QUIZ_INCORRECT_SCORE: number = -10;

export const DEFAULT_PROFICIENCY_SCORE_BY_MASTERY_LEVEL: Record<
  MasteryLevel,
  number
> = {
  [MasteryLevel.New]: MINIMUN_PROFICIENCY_SCORE,
  [MasteryLevel.Learning]: 25,
  [MasteryLevel.Familiar]: 50,
  [MasteryLevel.Mastered]: MAXIMUM_PROFICIENCY_SCORE,
};

export const AVERAGE_TIME_PER_QUESTION = 20;

export const QUIZ_PRIORITY_WEIGHTS = {
  PROFICIENCY: 3,
  REVIEW_RECENCY: 1,
};

export const DEFAULT_REVIEW_INTERVALS: Record<ReviewPerformance, number> = {
  [ReviewPerformance.Forgot]: 1,
  [ReviewPerformance.Hard]: 2,
  [ReviewPerformance.Medium]: 3,
  [ReviewPerformance.Good]: 4,
  [ReviewPerformance.Easy]: 5,
};

export const REVIEW_MASTERY_WEIGHTS: Record<MasteryLevel, number> = {
  [MasteryLevel.New]: 4,
  [MasteryLevel.Learning]: 3,
  [MasteryLevel.Familiar]: 2,
  [MasteryLevel.Mastered]: 1,
};

export const MINIMUM_WORDS_IN_QUIZ = 3;
export const MINIMUM_WORDS_IN_REVIEW = 3;
export const MAXIMUM_WORDS_IN_QUIZ = 20;
export const MAXIMUM_WORDS_IN_REVIEW = 20;
