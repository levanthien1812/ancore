/*
  Warnings:

  - You are about to drop the column `isOriginal` on the `Word` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Word" DROP COLUMN "isOriginal";

-- CreateTable
CREATE TABLE "AIWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "type" "WordType" NOT NULL DEFAULT 'Word',
    "audioUrl" TEXT,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIWordMeaning" (
    "id" TEXT NOT NULL,
    "aiWordId" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "guideWord" TEXT,
    "pronunciation" TEXT,
    "cefrLevel" "DifficultyLevel",
    "partOfSpeech" TEXT,
    "examples" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "synonyms" TEXT,
    "antonyms" TEXT,
    "usageNotes" TEXT,

    CONSTRAINT "AIWordMeaning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIWord_word_key" ON "AIWord"("word");

-- AddForeignKey
ALTER TABLE "AIWordMeaning" ADD CONSTRAINT "AIWordMeaning_aiWordId_fkey" FOREIGN KEY ("aiWordId") REFERENCES "AIWord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
