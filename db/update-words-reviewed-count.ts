import "dotenv/config";
import { prisma } from "./prisma";

/**
 * Task: Calculate and update `wordsReviewedCount` for StudySession records.
 *
 * For each study session, this script calculates the number of unique words reviewed
 * (from the associated WordReview records linked via `studySessionId`)
 * and updates `wordsReviewedCount` in the database.
 */
export async function updateWordsReviewedCount() {
  console.log("=== Starting calculation of wordsReviewedCount for StudySessions ===");

  try {
    // 1. Fetch all study sessions with their associated word reviews
    const sessions = await prisma.studySession.findMany({
      include: {
        reviews: {
          select: {
            id: true,
            wordId: true,
          },
        },
      },
      orderBy: {
        completedAt: "asc",
      },
    });

    console.log(`Found ${sessions.length} total study session(s).`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const session of sessions) {
      // Calculate unique words reviewed in this session
      const uniqueWordIds = new Set(session.reviews.map((r) => r.wordId));
      const calculatedCount = uniqueWordIds.size;

      // Update if wordsReviewedCount is null or differs from the calculated count
      if (session.wordsReviewedCount !== calculatedCount) {
        await prisma.studySession.update({
          where: { id: session.id },
          data: {
            wordsReviewedCount: calculatedCount,
          },
        });

        console.log(
          `✓ Updated session ${session.id}: wordsReviewedCount ${session.wordsReviewedCount ?? "null"} -> ${calculatedCount} (reviews count: ${session.reviews.length})`,
        );
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Total sessions processed: ${sessions.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Unchanged/Skipped: ${skippedCount}`);
    console.log("================\n");

    return { total: sessions.length, updated: updatedCount, skipped: skippedCount };
  } catch (error) {
    console.error("Error updating wordsReviewedCount for study sessions:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute directly if run as a script
if (require.main === module) {
  updateWordsReviewedCount()
    .then(() => {
      console.log("Task completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Task failed:", err);
      process.exit(1);
    });
}
