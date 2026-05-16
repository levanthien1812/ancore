-- CreateEnum
CREATE TYPE "PracticeContentType" AS ENUM ('Dialogue', 'SelfTalk');

-- CreateTable
CREATE TABLE "PracticeContent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PracticeContentType" NOT NULL,
    "topic" TEXT,
    "subTopic" TEXT,
    "level" "UserLevel" NOT NULL,
    "content" JSONB NOT NULL,
    "words" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PracticeContent_userId_idx" ON "PracticeContent"("userId");

-- AddForeignKey
ALTER TABLE "PracticeContent" ADD CONSTRAINT "PracticeContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
