-- AlterTable
ALTER TABLE "WordReview" ADD COLUMN     "wordLevelAfter" "MasteryLevel" NOT NULL DEFAULT 'Learning',
ADD COLUMN     "wordLevelBefore" "MasteryLevel" NOT NULL DEFAULT 'Learning';
