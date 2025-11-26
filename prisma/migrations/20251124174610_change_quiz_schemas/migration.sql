/*
  Warnings:

  - Added the required column `completedAt` to the `QuizzesLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuizzesLog" ADD COLUMN     "completedAt" TIMESTAMP(3) NOT NULL;
