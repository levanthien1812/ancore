/*
  Warnings:

  - You are about to drop the column `quizId` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `correct` to the `QuizQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizzesLogId` to the `QuizQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `QuizQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wordId` to the `QuizQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_userId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_wordId_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_quizId_fkey";

-- AlterTable
ALTER TABLE "QuizQuestion" DROP COLUMN "quizId",
ADD COLUMN     "correct" BOOLEAN NOT NULL,
ADD COLUMN     "quizzesLogId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "wordId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Quiz";

-- CreateTable
CREATE TABLE "QuizzesLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "quizzesCompleted" INTEGER NOT NULL,

    CONSTRAINT "QuizzesLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizzesLogId_fkey" FOREIGN KEY ("quizzesLogId") REFERENCES "QuizzesLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizzesLog" ADD CONSTRAINT "QuizzesLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
