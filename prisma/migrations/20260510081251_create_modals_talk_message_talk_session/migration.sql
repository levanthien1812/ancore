-- CreateTable
CREATE TABLE "TalkSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalkSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalkMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "refinement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalkMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TalkSession" ADD CONSTRAINT "TalkSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalkMessage" ADD CONSTRAINT "TalkMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TalkSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
