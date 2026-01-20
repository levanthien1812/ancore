-- CreateEnum
CREATE TYPE "WordType" AS ENUM ('Word', 'Phrase');

-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "type" "WordType" NOT NULL DEFAULT 'Word',
ALTER COLUMN "cefrLevel" DROP NOT NULL,
ALTER COLUMN "cefrLevel" DROP DEFAULT;
