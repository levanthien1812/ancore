"use server";

import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { ReviewPerformance } from "../constants/enums";
import { dateFilter } from "../utils/date-filter";

/**
 * Updates the schedule for a single word based on user performance.
 */
export async function updateReviewSession(
  wordId: string,
  performance: ReviewPerformance
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required.");
  }

  const reviewSession = await prisma.reviewSession.findFirst({
    where: { wordId, userId: session.user.id },
  });

  if (!reviewSession) {
    throw new Error("Review session not found for this word.");
  }

  // --- Spaced Repetition Algorithm (Simplified) ---
  let newInterval: number;
  const currentInterval = reviewSession.intervalDays;

  switch (performance) {
    case ReviewPerformance.FORGOT:
      newInterval = 1; // Reset interval to 1 day
      break;
    case ReviewPerformance.HARD:
      newInterval = Math.max(1, Math.floor(currentInterval * 1.2));
      break;
    case ReviewPerformance.MEDIUM:
      newInterval = Math.max(1, Math.floor(currentInterval * 2));
      break;
    case ReviewPerformance.GOOD:
      newInterval = Math.floor(currentInterval * 3);
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
    where: { id: reviewSession.id },
    data: {
      completedAt: now,
      intervalDays: newInterval,
      scheduledAt: newScheduledAt,
    },
  });
}

/**
 * Logs the summary of a completed review session.
 */
export async function logReviewSession(summary: {
  durationSeconds: number;
  performanceSummary: Record<string, string[]>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required.");
  }

  const wordsReviewedCount = Object.values(summary.performanceSummary).reduce(
    (sum, count) => sum + count.length,
    0
  );

  await prisma.reviewLog.create({
    data: {
      userId: session.user.id,
      ...summary,
      wordsReviewedCount,
    },
  });
}

export async function getReviewLogs(date: Date) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required.");
  }

  return await prisma.reviewLog.findMany({
    where: {
      userId: session.user.id,
      completedAt: dateFilter(date),
    },
  });
}
