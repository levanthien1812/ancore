-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "isCorrect" BOOLEAN,
ADD COLUMN     "userAnswer" TEXT;

-- AlterTable
ALTER TABLE "QuizzesLog" ADD COLUMN     "performanceSummary" JSONB;
