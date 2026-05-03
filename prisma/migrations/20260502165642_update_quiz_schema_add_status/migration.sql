-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('InProgress', 'Completed');

-- AlterTable
ALTER TABLE "QuizzesLog" ADD COLUMN     "status" "QuizStatus" NOT NULL DEFAULT 'InProgress';
