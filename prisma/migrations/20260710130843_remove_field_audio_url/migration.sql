/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `AIWord` table. All the data in the column will be lost.
  - You are about to drop the column `audioUrl` on the `Word` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AIWord" DROP COLUMN "audioUrl";

-- AlterTable
ALTER TABLE "Word" DROP COLUMN "audioUrl";
