/*
  Warnings:

  - You are about to drop the column `prioritizeWeakWords` on the `UserSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "prioritizeWeakWords",
ADD COLUMN     "showDetailsForFamiliarWords" BOOLEAN NOT NULL DEFAULT true;
