/*
  Warnings:

  - You are about to drop the column `familiarInterval` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `masteredInterval` on the `UserSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "familiarInterval",
DROP COLUMN "masteredInterval",
ADD COLUMN     "goodInterval" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "hardInterval" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "mediumInterval" INTEGER NOT NULL DEFAULT 3,
ALTER COLUMN "easyInterval" SET DEFAULT 8;
