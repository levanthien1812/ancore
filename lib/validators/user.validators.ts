import {
  DayOfWeek,
  MasteryLevel,
  QuestionType,
  QuizResultMode,
  ReviewFrequency,
  SpacedRepetitionAlgorithm,
} from "@prisma/client";
import z from "zod";
import {
  MAXIMUM_WORDS_IN_QUIZ,
  MAXIMUM_WORDS_IN_REVIEW,
  MINIMUM_WORDS_IN_QUIZ,
  MINIMUM_WORDS_IN_REVIEW,
} from "../constants/constant";

export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100),
});

export const signUpFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters long")
      .max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyEmailFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string().min(1, "Verification token is required"),
});

export const forgotPasswordFormSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters long")
      .max(100),
    token: z.string().min(1, "Reset token is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const onboardingFormSchema = z.object({
  level: z.string().min(1, "Please select your level."),
  topics: z
    .string()
    .refine((topics) => topics.split(",").filter(Boolean).length <= 3, {
      message: "You can only enter up to 3 topics.",
    }),
  dailyGoal: z.number().min(5, "Goal must be at least 5 minutes."),
});

export const userSettingsSchema = z.object({
  wordsPerReview: z
    .number()
    .int()
    .min(MINIMUM_WORDS_IN_REVIEW)
    .max(MAXIMUM_WORDS_IN_REVIEW),
  reviewFrequency: z.nativeEnum(ReviewFrequency),
  // time-format: 22:00
  reviewReminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  reviewDays: z.array(z.nativeEnum(DayOfWeek)),
  includeWordLevels: z.array(z.nativeEnum(MasteryLevel)),
  prioritizeWeakWords: z.boolean(),
  autoRepeatForgottenWords: z.boolean(),
  questionsPerQuiz: z
    .number()
    .int()
    .min(MINIMUM_WORDS_IN_QUIZ)
    .max(MAXIMUM_WORDS_IN_QUIZ),
  quizTypes: z.array(z.nativeEnum(QuestionType)),
  quizWordLevels: z.array(z.nativeEnum(MasteryLevel)),
  timeLimitPerQuestion: z.number().int().min(0).max(300), // 0 for no limit, max 5 minutes
  showResultsMode: z.nativeEnum(QuizResultMode),
  allowRetry: z.boolean(),
  includeAudioQuestions: z.boolean(),
  includeFirstLetterInHint: z.boolean(),
  showIpaPronunciation: z.boolean(),
  autoPlayPronunciation: z.boolean(),
  dailyNewWordsGoal: z.number().int().min(1).max(100),
  reviewAlgorithm: z.nativeEnum(SpacedRepetitionAlgorithm),
  forgottenInterval: z.number().int().min(1).max(365),
  hardInterval: z.number().int().min(1).max(365),
  mediumInterval: z.number().int().min(1).max(365),
  goodInterval: z.number().int().min(1).max(365),
  easyInterval: z.number().int().min(1).max(365),
  dailyReminderEnabled: z.boolean(),
  notificationTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  missedReviewReminderEnabled: z.boolean(),
  streakReminderEnabled: z.boolean(),
  wordOfTheDayEnabled: z.boolean(),
  timezone: z.string().default("UTC"),
});
