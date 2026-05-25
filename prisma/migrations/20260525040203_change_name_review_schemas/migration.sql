/*
  Warnings:

  - You are about to drop the `ReviewLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReviewSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReviewLog" DROP CONSTRAINT "ReviewLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewSession" DROP CONSTRAINT "ReviewSession_reviewLogId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewSession" DROP CONSTRAINT "ReviewSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewSession" DROP CONSTRAINT "ReviewSession_wordId_fkey";

-- DropTable
DROP TABLE "ReviewLog";

-- DropTable
DROP TABLE "ReviewSession";

-- CreateTable
CREATE TABLE "WordReview" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studySessionId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "intervalDays" INTEGER NOT NULL,
    "performance" "ReviewPerformance",

    CONSTRAINT "WordReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL,
    "wordsReviewedCount" INTEGER,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudySession_userId_idx" ON "StudySession"("userId");

-- AddForeignKey
ALTER TABLE "WordReview" ADD CONSTRAINT "WordReview_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordReview" ADD CONSTRAINT "WordReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordReview" ADD CONSTRAINT "WordReview_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "StudySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
