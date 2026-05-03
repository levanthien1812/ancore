/*
  Warnings:

  - The values [Good,NeedsImprovement] on the enum `QuizStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuizStatus_new" AS ENUM ('Perfect', 'InProgress', 'NeedsReview', 'Excellent');
ALTER TABLE "public"."QuizzesLog" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "QuizzesLog" ALTER COLUMN "status" TYPE "QuizStatus_new" USING ("status"::text::"QuizStatus_new");
ALTER TYPE "QuizStatus" RENAME TO "QuizStatus_old";
ALTER TYPE "QuizStatus_new" RENAME TO "QuizStatus";
DROP TYPE "public"."QuizStatus_old";
ALTER TABLE "QuizzesLog" ALTER COLUMN "status" SET DEFAULT 'InProgress';
COMMIT;
