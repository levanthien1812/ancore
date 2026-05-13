-- AlterTable
ALTER TABLE "TalkMessage" ADD COLUMN     "evaluation" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "speakingSuggestions" TEXT[] DEFAULT ARRAY[]::TEXT[];
