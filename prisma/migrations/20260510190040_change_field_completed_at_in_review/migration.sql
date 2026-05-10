-- AlterTable
ALTER TABLE "ReviewLog" ALTER COLUMN "completedAt" DROP NOT NULL,
ALTER COLUMN "completedAt" DROP DEFAULT;
