"use server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { MasteryLevel, ReviewPerformance } from "../constants/enums";
import { dateFilter } from "../utils/date-filter";

/**
 * Updates the schedule for a single word based on user performance.
 */
export async function updateReviewSession(
  wordId: string,
  performance: ReviewPerformance,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required.");
  }

  const [reviewSession, word] = await Promise.all([
    prisma.reviewSession.findFirst({
      where: { wordId, userId: session.user.id },
    }),
    prisma.word.findUnique({
      where: { id: wordId },
    }),
  ]);

  if (!reviewSession) {
    throw new Error("Review session not found for this word.");
  }
  if (!word) {
    throw new Error("Word not found for this review session.");
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

  // --- Mastery Level Update Algorithm ---
  let newMasteryLevel = word.masteryLevel;
  switch (word.masteryLevel) {
    case MasteryLevel.New:
      newMasteryLevel = MasteryLevel.Learning;
      break;
    case MasteryLevel.Learning:
      if (performance >= ReviewPerformance.GOOD) {
        newMasteryLevel = MasteryLevel.Familiar;
      }
      break;
    case MasteryLevel.Familiar:
      if (performance === ReviewPerformance.FORGOT) {
        newMasteryLevel = MasteryLevel.Learning; // Demote
      } else if (performance >= ReviewPerformance.GOOD) {
        newMasteryLevel = MasteryLevel.Mastered;
      }
      break;
    case MasteryLevel.Mastered:
      if (performance <= ReviewPerformance.HARD) {
        newMasteryLevel = MasteryLevel.Familiar; // Demote if user struggles
      }
      break;
  }

  // --- Database Update ---
  await prisma.$transaction([
    prisma.reviewSession.update({
      where: { id: reviewSession.id },
      data: {
        completedAt: now,
        intervalDays: newInterval,
        scheduledAt: newScheduledAt,
      },
    }),
    prisma.word.update({
      where: { id: wordId },
      data: { masteryLevel: newMasteryLevel, updatedAt: now },
    }),
  ]);
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
    0,
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

  const logs = await prisma.reviewLog.findMany({
    where: {
      userId: session.user.id,
      completedAt: dateFilter(date),
    },
  });

  return logs;
}

export async function getReviewLogsByMonth(year: number, month: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required.");
  }

  // Create date range for the entire month (start of first day to end of last day)
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const logs = await prisma.reviewLog.findMany({
    where: {
      userId: session.user.id,
      completedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      completedAt: true,
    },
  });

  // Extract unique dates that have logs
  const datesWithLogs = new Set(
    logs.map((log) => {
      const date = new Date(log.completedAt);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }),
  );

  return Array.from(datesWithLogs);
}
