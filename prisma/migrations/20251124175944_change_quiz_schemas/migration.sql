/*
  Warnings:

  - You are about to drop the column `correct` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `wordId` on the `QuizQuestion` table. All the data in the column will be lost.
  - Made the column `answer` on table `QuizQuestion` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_wordId_fkey";

-- AlterTable
ALTER TABLE "QuizQuestion" DROP COLUMN "correct",
DROP COLUMN "wordId",
ALTER COLUMN "answer" SET NOT NULL,
ALTER COLUMN "answer" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "_WordToQuizQuestion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WordToQuizQuestion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_WordToQuizQuestion_B_index" ON "_WordToQuizQuestion"("B");

-- AddForeignKey
ALTER TABLE "_WordToQuizQuestion" ADD CONSTRAINT "_WordToQuizQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WordToQuizQuestion" ADD CONSTRAINT "_WordToQuizQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
