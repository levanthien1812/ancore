/*
  Warnings:

  - You are about to drop the column `goals` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `wordOfTheDayStopped` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "goals",
DROP COLUMN "wordOfTheDayStopped";

-- CreateTable
CREATE TABLE "AIQuota" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyUsed" INTEGER NOT NULL DEFAULT 0,
    "monthlyUsed" INTEGER NOT NULL DEFAULT 0,
    "dailyLimit" INTEGER NOT NULL DEFAULT 30,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 300,
    "dailyResetAt" TIMESTAMP(3) NOT NULL,
    "monthlyResetAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIQuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIQuota_userId_key" ON "AIQuota"("userId");

-- AddForeignKey
ALTER TABLE "AIQuota" ADD CONSTRAINT "AIQuota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
