"use server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import {
  MasteryLevel,
  ReviewPerformance,
  WordReviewInfo,
} from "../constants/enums";
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

  const word = await prisma.word.findUnique({ where: { id: wordId } });
  if (!word) {
    throw new Error("Word not found for this review session.");
  }

  // Find the most recent completed review session to determine the current interval for the algorithm.
  // This is distinct from the session being marked as completed *now*.
  const lastCompletedReview = await prisma.reviewSession.findFirst({
    where: { wordId, userId: session.user.id, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
  });

  const now = new Date();
  // Find the specific review session that is currently being completed (i.e., the pending one that was due)
  const currentPendingReviewSession = await prisma.reviewSession.findFirst({
    where: {
      wordId,
      userId: session.user.id,
      completedAt: null,
      scheduledAt: { lte: now },
    },
    orderBy: { scheduledAt: "asc" }, // Get the earliest one that was due
    select: { id: true, intervalDays: true }, // Only need id and intervalDays from this one
  });

  // If there's no previous completed review, use the initial interval (1 day, as set in word.actions.ts)
  // Otherwise, use the intervalDays from the last completed review.
  const currentInterval = lastCompletedReview
    ? lastCompletedReview.intervalDays
    : 1;

  // --- Spaced Repetition Algorithm (Simplified) ---
  let newInterval: number;

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
  const transactionOperations = [];

  if (currentPendingReviewSession) {
    // 1. Mark the current pending review session as completed
    transactionOperations.push(
      prisma.reviewSession.update({
        where: { id: currentPendingReviewSession.id },
        data: { completedAt: now },
      }),
    );
  }

  // 2. Create a new review session record for the *next* scheduled review
  transactionOperations.push(
    prisma.reviewSession.create({
      data: {
        wordId,
        userId: session.user.id,
        intervalDays: newInterval,
        // This new session is initially uncompleted, representing a future scheduled review
        completedAt: null,
        scheduledAt: newScheduledAt,
      },
    }),
    prisma.word.update({
      where: { id: wordId },
      data: { masteryLevel: newMasteryLevel, updatedAt: now },
    }),
  );
  await prisma.$transaction(transactionOperations);
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

export const getReviewInfo = async (wordId: string) => {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const word = await prisma.word.findUnique({
    where: { id: wordId },
  });

  if (!word) {
    return null;
  }

  const info: WordReviewInfo = {
    nextReviewAt: null,
    nextReviewIn: null,
    lastReviewAt: null,
    reviewedTimes: 0,
  };

  // 1. Get reviewed times and last review date from completed sessions
  const completedReviews = await prisma.reviewSession.findFirst({
    where: { wordId, userId: session.user.id, completedAt: { not: null } },
    orderBy: { completedAt: "desc" }, // Most recent completed review first
  });

  info.reviewedTimes = await prisma.reviewSession.count({
    where: { wordId, userId: session.user.id, completedAt: { not: null } },
  });

  info.lastReviewAt = completedReviews?.completedAt || null;

  // 2. Get next review date from the earliest uncompleted session
  const nextScheduledReview = await prisma.reviewSession.findFirst({
    where: { wordId, userId: session.user.id, completedAt: null }, // Look for uncompleted
    orderBy: { scheduledAt: "asc" }, // Get the earliest scheduled one
  });

  if (nextScheduledReview) {
    info.nextReviewAt = nextScheduledReview.scheduledAt;
    if (nextScheduledReview.scheduledAt) {
      const now = new Date();
      const diff = nextScheduledReview.scheduledAt.getTime() - now.getTime();
      // Use Math.ceil to round up days, so 0.5 days remaining shows as 1 day
      info.nextReviewIn = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
  }

  return info;
};
