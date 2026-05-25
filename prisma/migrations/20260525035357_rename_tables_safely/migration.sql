-- Rename ReviewLog to StudySession
ALTER TABLE "ReviewLog" RENAME TO "StudySession";

-- Rename ReviewSession to WordReview
ALTER TABLE "ReviewSession" RENAME TO "WordReview";

-- Rename the foreign key column if it changed
ALTER TABLE "WordReview" RENAME COLUMN "reviewLogId" TO "studySessionId";

-- Rename indexes (optional but recommended for consistency)
ALTER INDEX "ReviewLog_userId_idx" RENAME TO "StudySession_userId_idx";
