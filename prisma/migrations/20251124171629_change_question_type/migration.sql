/*
  Warnings:

  - The values [MultipleChoice,FillInBlank] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('MultipleChoice_DefinitionToWord', 'MultipleChoice_WordToSynonym', 'Matching', 'FillInTheBlank');
ALTER TABLE "QuizQuestion" ALTER COLUMN "type" TYPE "QuestionType_new" USING ("type"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "public"."QuestionType_old";
COMMIT;
