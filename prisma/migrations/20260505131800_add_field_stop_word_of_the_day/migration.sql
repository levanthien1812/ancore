/*
  Warnings:

  - You are about to drop the column `stopWordOfTheDay` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "stopWordOfTheDay",
ADD COLUMN     "wordOfTheDayStopped" BOOLEAN NOT NULL DEFAULT false;
