"use server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { ReviewPerformance } from "../constants/enums";

export async function updateReviewSession(
  wordId: string,
  performance: ReviewPerformance
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be logged in.");
  }

  const reviewSession = await prisma.reviewSession.findFirst({
    where: {
      wordId: wordId,
      userId: session.user.id,
    },
  });

  if (!reviewSession) {
    throw new Error("Review session not found.");
  }

  // --- Spaced Repetition Algorithm (Simplified) ---
  let newInterval: number;
  const currentInterval = reviewSession.intervalDays;

  switch (performance) {
    case ReviewPerformance.FORGOT:
      newInterval = 1; // Reset interval
      break;
    case ReviewPerformance.HARD:
      newInterval = Math.max(1, Math.floor(currentInterval * 1.2));
      break;
    case ReviewPerformance.MEDIUM:
      newInterval = Math.floor(currentInterval * 1.5);
      break;
    case ReviewPerformance.GOOD:
      newInterval = Math.floor(currentInterval * 2.5);
      break;
    case ReviewPerformance.EASY:
      newInterval = Math.floor(currentInterval * 4);
      break;
    default:
      newInterval = currentInterval;
  }
  // --- End of Algorithm ---

  const now = new Date();
  const newScheduledAt = new Date(now.getTime());
  newScheduledAt.setDate(newScheduledAt.getDate() + newInterval);

  await prisma.reviewSession.update({
    where: {
      id: reviewSession.id,
    },
    data: {
      completedAt: now,
      intervalDays: newInterval,
      scheduledAt: newScheduledAt,
    },
  });

  // You might also want to update the word's masteryLevel here
  // e.g., if performance is EASY and interval is > 30, set to 'Mastered'
}
