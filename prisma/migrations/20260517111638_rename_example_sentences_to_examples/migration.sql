-- 1. Add the new array column
ALTER TABLE "WordMeaning" ADD COLUMN "examples" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- 2. Migrate existing data by splitting the pipe-separated string '|'
UPDATE "WordMeaning"
SET "examples" = string_to_array("exampleSentences", '|')
WHERE "exampleSentences" IS NOT NULL AND "exampleSentences" <> '';

-- 3. Remove the old column
ALTER TABLE "WordMeaning" DROP COLUMN "exampleSentences";
