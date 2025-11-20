-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyGoal" INTEGER DEFAULT 15,
ADD COLUMN     "onboarded" BOOLEAN NOT NULL DEFAULT false;
