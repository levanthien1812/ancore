/*
  Warnings:

  - You are about to drop the column `quizzesCompleted` on the `QuizzesLog` table. All the data in the column will be lost.
  - Added the required column `correctAnswers` to the `QuizzesLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skippedQuestions` to the `QuizzesLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuestions` to the `QuizzesLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wrongAnswers` to the `QuizzesLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuizzesLog" 
ADD COLUMN     "correctAnswers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "skippedQuestions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalQuestions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wrongAnswers" INTEGER NOT NULL DEFAULT 0;

UPDATE "QuizzesLog" SET "correctAnswers" = "quizzesCompleted";

ALTER TABLE "QuizzesLog" DROP COLUMN "quizzesCompleted";
