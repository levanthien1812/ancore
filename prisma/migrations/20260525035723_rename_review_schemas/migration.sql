/*
  Warnings:

  - You are about to drop the `StudySession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WordReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StudySession" DROP CONSTRAINT "ReviewLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "WordReview" DROP CONSTRAINT "ReviewSession_reviewLogId_fkey";

-- DropForeignKey
ALTER TABLE "WordReview" DROP CONSTRAINT "ReviewSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "WordReview" DROP CONSTRAINT "ReviewSession_wordId_fkey";

-- DropTable
DROP TABLE "StudySession";

-- DropTable
DROP TABLE "WordReview";

-- CreateTable
CREATE TABLE "ReviewSession" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewLogId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "intervalDays" INTEGER NOT NULL,
    "performance" "ReviewPerformance",

    CONSTRAINT "ReviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL,
    "wordsReviewedCount" INTEGER,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewLog_userId_idx" ON "ReviewLog"("userId");

-- AddForeignKey
ALTER TABLE "ReviewSession" ADD CONSTRAINT "ReviewSession_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSession" ADD CONSTRAINT "ReviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSession" ADD CONSTRAINT "ReviewSession_reviewLogId_fkey" FOREIGN KEY ("reviewLogId") REFERENCES "ReviewLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
