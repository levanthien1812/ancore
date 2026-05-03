/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `quizzesLogId` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `userAnswer` on the `QuizQuestion` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuizStatus" ADD VALUE 'Good';
ALTER TYPE "QuizStatus" ADD VALUE 'NeedsImprovement';

-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_quizzesLogId_fkey";

-- AlterTable
ALTER TABLE "QuizQuestion" DROP COLUMN "isCorrect",
DROP COLUMN "quizzesLogId",
DROP COLUMN "userAnswer";

-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL,
    "quizQuestionId" TEXT NOT NULL,
    "quizzesLogId" TEXT NOT NULL,
    "userAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizAnswer_quizQuestionId_quizzesLogId_key" ON "QuizAnswer"("quizQuestionId", "quizzesLogId");

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_quizQuestionId_fkey" FOREIGN KEY ("quizQuestionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_quizzesLogId_fkey" FOREIGN KEY ("quizzesLogId") REFERENCES "QuizzesLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
