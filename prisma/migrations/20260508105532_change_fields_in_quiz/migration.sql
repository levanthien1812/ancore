-- AlterTable
ALTER TABLE "QuizAnswer" ADD COLUMN     "isUnreached" BOOLEAN DEFAULT true,
ADD COLUMN     "isWrong" BOOLEAN DEFAULT false,
ALTER COLUMN "isCorrect" SET DEFAULT false;

-- AlterTable
ALTER TABLE "QuizzesLog" ADD COLUMN     "unreachedQuestions" INTEGER NOT NULL DEFAULT 0;
