/*
  Warnings:

  - You are about to drop the column `performanceSummary` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `performanceSummary` on the `ReviewLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "performanceSummary";

-- AlterTable
ALTER TABLE "ReviewLog" DROP COLUMN "performanceSummary";
