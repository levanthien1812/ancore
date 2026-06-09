-- CreateEnum
CREATE TYPE "ReviewFrequency" AS ENUM ('Daily', 'Every2Days', 'Custom');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- CreateEnum
CREATE TYPE "QuizResultMode" AS ENUM ('AfterEachQuestion', 'AtTheEnd');

-- CreateEnum
CREATE TYPE "SpacedRepetitionAlgorithm" AS ENUM ('Default', 'Custom');

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordsPerReview" INTEGER NOT NULL DEFAULT 10,
    "reviewFrequency" "ReviewFrequency" NOT NULL DEFAULT 'Daily',
    "reviewReminderTime" TEXT DEFAULT '08:00 PM',
    "reviewDays" "DayOfWeek"[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']::"DayOfWeek"[],
    "includeWordLevels" "MasteryLevel"[] DEFAULT ARRAY['New', 'Learning', 'Familiar', 'Mastered']::"MasteryLevel"[],
    "prioritizeWeakWords" BOOLEAN NOT NULL DEFAULT true,
    "autoRepeatForgottenWords" BOOLEAN NOT NULL DEFAULT true,
    "questionsPerQuiz" INTEGER NOT NULL DEFAULT 10,
    "quizTypes" "QuestionType"[] DEFAULT ARRAY['DefinitionToWord_Typing', 'WordToSynonym', 'Matching', 'FillInTheBlank']::"QuestionType"[],
    "timeLimitPerQuestion" INTEGER NOT NULL DEFAULT 0,
    "showResultsMode" "QuizResultMode" NOT NULL DEFAULT 'AtTheEnd',
    "allowRetry" BOOLEAN NOT NULL DEFAULT true,
    "includeAudioQuestions" BOOLEAN NOT NULL DEFAULT true,
    "showIpaPronunciation" BOOLEAN NOT NULL DEFAULT true,
    "autoPlayPronunciation" BOOLEAN NOT NULL DEFAULT false,
    "dailyNewWordsGoal" INTEGER NOT NULL DEFAULT 5,
    "reviewAlgorithm" "SpacedRepetitionAlgorithm" NOT NULL DEFAULT 'Default',
    "familiarInterval" INTEGER NOT NULL DEFAULT 2,
    "easyInterval" INTEGER NOT NULL DEFAULT 4,
    "forgottenInterval" INTEGER NOT NULL DEFAULT 1,
    "masteredInterval" INTEGER NOT NULL DEFAULT 8,
    "dailyReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notificationTime" TEXT NOT NULL DEFAULT '07:30 PM',
    "missedReviewReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "streakReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "wordOfTheDayEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
