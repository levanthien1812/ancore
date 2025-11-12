/*
  Warnings:

  - You are about to drop the column `topic` on the `Word` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Word" DROP COLUMN "topic",
ALTER COLUMN "pronunciation" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WordMeaning" ALTER COLUMN "partOfSpeech" DROP NOT NULL,
ALTER COLUMN "exampleSentences" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "synonyms" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "antonyms" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "usageNotes" DROP NOT NULL,
ALTER COLUMN "usageNotes" SET DATA TYPE TEXT;
