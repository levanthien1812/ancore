-- CreateEnum
CREATE TYPE "ReviewPerformance" AS ENUM ('Forgot', 'Hard', 'Medium', 'Good', 'Easy');

-- AlterTable
ALTER TABLE "ReviewSession" ADD COLUMN     "performance" "ReviewPerformance";
