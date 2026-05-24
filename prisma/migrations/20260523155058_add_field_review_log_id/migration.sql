-- AlterTable
ALTER TABLE "ReviewSession" ADD COLUMN     "reviewLogId" TEXT;

-- AddForeignKey
ALTER TABLE "ReviewSession" ADD CONSTRAINT "ReviewSession_reviewLogId_fkey" FOREIGN KEY ("reviewLogId") REFERENCES "ReviewLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
