/*
  Warnings:

  - You are about to drop the column `quizzesLogId` on the `QuizAnswer` table. All the data in the column will be lost.
  - You are about to drop the `QuizzesLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[quizQuestionId,quizId]` on the table `QuizAnswer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `quizId` to the `QuizAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuizAnswer" DROP CONSTRAINT "QuizAnswer_quizzesLogId_fkey";

-- DropForeignKey
ALTER TABLE "QuizzesLog" DROP CONSTRAINT "QuizzesLog_userId_fkey";

-- DropIndex
DROP INDEX "QuizAnswer_quizQuestionId_quizzesLogId_key";

-- AlterTable
ALTER TABLE "QuizAnswer" DROP COLUMN "quizzesLogId",
ADD COLUMN     "quizId" TEXT NOT NULL;

-- DropTable
DROP TABLE "QuizzesLog";

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "totalWords" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "completedQuestions" INTEGER NOT NULL DEFAULT 0,
    "unreachedQuestions" INTEGER NOT NULL DEFAULT 0,
    "skippedQuestions" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "QuizStatus" NOT NULL DEFAULT 'InProgress',
    "performanceSummary" JSONB,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizAnswer_quizQuestionId_quizId_key" ON "QuizAnswer"("quizQuestionId", "quizId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
