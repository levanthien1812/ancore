import "dotenv/config";
import { prisma } from "@/db/prisma";
import { MasteryLevel } from "@prisma/client";

/**
 * This script identifies all words in the database that do not have an associated
 * WordReview record and generates an initial one for each.
 */
async function main() {
  console.log("Starting generation of initial WordReview records...");

  try {
    // 1. Find all words that currently have no associated WordReview records
    const wordsWithoutReviews = await prisma.word.findMany({
      where: {
        reviews: {
          none: {},
        },
      },
      select: {
        id: true,
        userId: true,
        masteryLevel: true,
      },
    });

    console.log(
      `Found ${wordsWithoutReviews.length} words requiring initial reviews.`,
    );

    if (wordsWithoutReviews.length === 0) {
      console.log("No missing reviews found. Process complete.");
      return;
    }

    // 2. Prepare bulk insertion data
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const reviewData = wordsWithoutReviews.map((word) => {
      const isPositiveOrNew =
        word.masteryLevel === MasteryLevel.New ||
        word.masteryLevel === MasteryLevel.Familiar ||
        word.masteryLevel === MasteryLevel.Mastered;

      return {
        wordId: word.id,
        userId: word.userId,
        intervalDays: isPositiveOrNew ? 1 : 0,
        scheduledAt: isPositiveOrNew ? tomorrow : yesterday,
        completedAt: null,
      };
    });

    // 3. Batch insert using createMany for efficiency
    const result = await prisma.wordReview.createMany({
      data: reviewData,
    });

    console.log(`Successfully generated ${result.count} WordReview records.`);
  } catch (error) {
    console.error("An error occurred while generating reviews:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
