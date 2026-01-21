
-- 1. Add new columns to WordMeaning
ALTER TABLE "WordMeaning" ADD COLUMN "cefrLevel" "DifficultyLevel",
ADD COLUMN "pronunciation" TEXT;

-- 2. Copy data from Word to WordMeaning
-- This updates all meanings associated with a word to have the same pronunciation/level
UPDATE "WordMeaning"
SET
  "pronunciation" = "Word"."pronunciation",
  "cefrLevel" = "Word"."cefrLevel"
FROM "Word"
WHERE "WordMeaning"."wordId" = "Word"."id";

-- 3. Drop old columns from Word
ALTER TABLE "Word" DROP COLUMN "cefrLevel",
DROP COLUMN "pronunciation";
