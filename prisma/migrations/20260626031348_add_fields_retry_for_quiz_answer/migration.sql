-- AlterTable
ALTER TABLE "QuizAnswer" ADD COLUMN     "isCorrectAfterRetry" BOOLEAN DEFAULT false,
ADD COLUMN     "retried" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userAnswerRetry" TEXT;
