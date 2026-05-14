"use server";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import {
  MasteryLevel,
  ReviewPerformance,
  WordReviewInfo,
} from "../constants/enums";
import { dateFilter } from "../utils/date-filter"; // Keep this for getReviewLogs
import { getPeriodDateRange, ReviewPeriod } from "../utils/date-helpers"; // New import
import { startOfDay, subDays, addDays, format } from "date-fns"; // New imports
import { revalidatePath } from "next/cache";

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
      completedAt: new Date(),
      ...summary,
      wordsReviewedCount,
    },
  });

  revalidatePath("/review");
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
      const date = new Date(log.completedAt!);
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
    overdueIn: null,
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
      const diffHours = diff / (1000 * 60 * 60);

      if (diffHours < 0) {
        info.nextReviewIn = null;
        info.overdueIn = Math.floor(Math.abs(diffHours));
      } else {
        info.nextReviewIn = Math.ceil(diffHours);
        info.overdueIn = null;
      }
    }
  }

  console.log(info);

  return info;
};

async function calculateReviewStreak(
  userId: string,
): Promise<{ currentStreak: number; bestStreak: number }> {
  const reviewDays: { day: Date }[] = await prisma.$queryRaw`
    SELECT DISTINCT DATE_TRUNC('day', "completedAt") as day
    FROM "ReviewLog"
    WHERE "userId" = ${userId} AND "completedAt" IS NOT NULL
    ORDER BY day DESC
  `;

  if (reviewDays.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let tempCurrentStreak = 0;
  let tempBestStreak = 0;

  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(new Date(), 1));

  // Calculate current streak
  if (startOfDay(new Date(reviewDays[0].day)).getTime() === today.getTime()) {
    tempCurrentStreak = 1;
    let expectedDay = yesterday;
    for (let i = 1; i < reviewDays.length; i++) {
      const currentReviewDay = startOfDay(new Date(reviewDays[i].day));
      if (currentReviewDay.getTime() === expectedDay.getTime()) {
        tempCurrentStreak++;
        expectedDay = startOfDay(subDays(expectedDay, 1));
      } else if (currentReviewDay.getTime() < expectedDay.getTime()) {
        // Gap found, current streak ends
        break;
      }
    }
    currentStreak = tempCurrentStreak;
  } else if (
    startOfDay(new Date(reviewDays[0].day)).getTime() === yesterday.getTime()
  ) {
    tempCurrentStreak = 1;
    let expectedDay = startOfDay(subDays(yesterday, 1));
    for (let i = 1; i < reviewDays.length; i++) {
      const currentReviewDay = startOfDay(new Date(reviewDays[i].day));
      if (currentReviewDay.getTime() === expectedDay.getTime()) {
        tempCurrentStreak++;
        expectedDay = startOfDay(subDays(expectedDay, 1));
      } else if (currentReviewDay.getTime() < expectedDay.getTime()) {
        // Gap found, current streak ends
        break;
      }
    }
    currentStreak = tempCurrentStreak;
  }
  // If reviewDays[0] is neither today nor yesterday, currentStreak remains 0

  // Calculate best streak
  let currentRunningStreak = 0;
  let prevDay: Date | null = null;

  // Iterate through reviewDays (already sorted DESC)
  for (const record of reviewDays) {
    const currentDay = startOfDay(new Date(record.day));
    if (prevDay === null) {
      currentRunningStreak = 1;
    } else {
      const diff = prevDay.getTime() - currentDay.getTime(); // prevDay is more recent
      const daysDiff = Math.round(diff / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        currentRunningStreak++;
      } else if (daysDiff > 1) {
        // Gap found
        currentRunningStreak = 1;
      }
      // If daysDiff is 0, it's the same day, currentRunningStreak remains unchanged
    }
    tempBestStreak = Math.max(tempBestStreak, currentRunningStreak);
    prevDay = currentDay;
  }
  bestStreak = tempBestStreak;

  return { currentStreak, bestStreak };
}

// Helper to process review logs and extract metrics
interface ReviewMetrics {
  totalWordsReviewed: number;
  totalStudyTimeSeconds: number;
  performanceCounts: Record<ReviewPerformance, number>;
}

function calculatePerformanceMetrics(
  logs: {
    performanceSummary: any;
    durationSeconds: number;
  }[],
): ReviewMetrics {
  let totalWordsReviewed = 0;
  let totalStudyTimeSeconds = 0;
  const performanceCounts: Record<ReviewPerformance, number> = {
    [ReviewPerformance.FORGOT]: 0,
    [ReviewPerformance.HARD]: 0,
    [ReviewPerformance.MEDIUM]: 0,
    [ReviewPerformance.GOOD]: 0,
    [ReviewPerformance.EASY]: 0,
  };

  for (const log of logs) {
    totalStudyTimeSeconds += log.durationSeconds;
    const summary = log.performanceSummary as Record<string, string[]>;
    for (const performanceKey in summary) {
      const performance = performanceKey as ReviewPerformance;
      const words = summary[performanceKey];
      if (words) {
        totalWordsReviewed += words.length;
        performanceCounts[performance] += words.length;
      }
    }
  }

  return { totalWordsReviewed, totalStudyTimeSeconds, performanceCounts };
}

export interface ReviewStatistics {
  totalWordsReviewed: number;
  totalStudyTimeSeconds: number;
  accuracyPercentage: number;
  wordsPerDay: number;
  currentReviewStreak: number;
  bestReviewStreak: number;
  periodComparison: {
    previousTotalWordsReviewed: number;
    previousTotalStudyTimeSeconds: number;
    wordsReviewedChangePercentage: number;
    studyTimeChangePercentage: number;
  } | null;
  dailyPerformanceTrend: Array<{
    date: string;
    totalWords: number;
    goodEasyPercentage: number;
  }>;
  performanceCounts: Record<ReviewPerformance, number>;
}

export async function getReviewStatistics(period: ReviewPeriod) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required.");
  }
  const userId = session.user.id;

  const {
    currentPeriodStart,
    currentPeriodEnd,
    previousPeriodStart,
    previousPeriodEnd,
  } = getPeriodDateRange(period);

  // Fetch current period logs
  const currentLogs = await prisma.reviewLog.findMany({
    where: {
      userId,
      completedAt: {
        gte: currentPeriodStart,
        lte: currentPeriodEnd,
      },
    },
    select: {
      durationSeconds: true,
      performanceSummary: true,
      completedAt: true,
    },
    orderBy: {
      completedAt: "asc", // For daily trend
    },
  });

  const currentMetrics = calculatePerformanceMetrics(currentLogs);

  // Calculate accuracy percentage
  const totalWordsInCurrentPeriod = currentMetrics.totalWordsReviewed;
  let accuracyPercentage = 0;
  if (totalWordsInCurrentPeriod > 0) {
    const goodEasyWords =
      currentMetrics.performanceCounts[ReviewPerformance.GOOD] +
      currentMetrics.performanceCounts[ReviewPerformance.EASY];
    accuracyPercentage = (goodEasyWords / totalWordsInCurrentPeriod) * 100;
  }

  // Calculate words per day
  let wordsPerDay = 0;
  if (period !== "all_time" && totalWordsInCurrentPeriod > 0) {
    const diffTime = Math.abs(
      currentPeriodEnd.getTime() - currentPeriodStart.getTime(),
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    wordsPerDay = totalWordsInCurrentPeriod / diffDays;
  } else if (period === "all_time" && totalWordsInCurrentPeriod > 0) {
    const firstReview = await prisma.reviewLog.findFirst({
      where: { userId, completedAt: { not: null } },
      orderBy: { completedAt: "asc" },
      select: { completedAt: true },
    });
    if (firstReview && firstReview.completedAt) {
      const diffTime = Math.abs(
        currentPeriodEnd.getTime() - firstReview.completedAt.getTime(),
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) wordsPerDay = totalWordsInCurrentPeriod / diffDays;
    }
  }

  // Fetch previous period logs for comparison
  let previousMetrics: ReviewMetrics | null = null;
  if (previousPeriodStart && previousPeriodEnd) {
    const previousLogs = await prisma.reviewLog.findMany({
      where: {
        userId,
        completedAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd,
        },
      },
      select: {
        durationSeconds: true,
        performanceSummary: true,
      },
    });
    previousMetrics = calculatePerformanceMetrics(previousLogs);
  }

  const wordsReviewedChangePercentage = previousMetrics?.totalWordsReviewed
    ? ((currentMetrics.totalWordsReviewed -
        previousMetrics.totalWordsReviewed) /
        previousMetrics.totalWordsReviewed) *
      100
    : currentMetrics.totalWordsReviewed > 0
      ? 100
      : 0; // If previous was 0 and current > 0, 100% increase

  const studyTimeChangePercentage = previousMetrics?.totalStudyTimeSeconds
    ? ((currentMetrics.totalStudyTimeSeconds -
        previousMetrics.totalStudyTimeSeconds) /
        previousMetrics.totalStudyTimeSeconds) *
      100
    : currentMetrics.totalStudyTimeSeconds > 0
      ? 100
      : 0; // If previous was 0 and current > 0, 100% increase

  // Calculate review streak
  const { currentStreak, bestStreak } = await calculateReviewStreak(userId);

  // Calculate daily performance trend
  const dailyPerformanceTrend: Array<{
    date: string;
    totalWords: number;
    goodEasyPercentage: number;
  }> = [];
  const dailyDataMap = new Map<
    string,
    { totalWords: number; goodEasyWords: number }
  >();

  for (const log of currentLogs) {
    const dateKey = format(startOfDay(log.completedAt || new Date()), "dd/MM");
    if (!dailyDataMap.has(dateKey)) {
      dailyDataMap.set(dateKey, { totalWords: 0, goodEasyWords: 0 });
    }
    const dailyStats = dailyDataMap.get(dateKey)!;
    const summary = log.performanceSummary as Record<string, string[]>;
    for (const performanceKey in summary) {
      const performance = performanceKey as ReviewPerformance;
      const words = summary[performanceKey];
      if (words) {
        dailyStats.totalWords += words.length;
        if (
          performance === ReviewPerformance.GOOD ||
          performance === ReviewPerformance.EASY
        ) {
          dailyStats.goodEasyWords += words.length;
        }
      }
    }
  }

  // Populate dailyPerformanceTrend, ensuring all days in the period are represented
  const today = startOfDay(new Date());
  let tempDate = startOfDay(subDays(today, 6)); // Start 6 days before today to get a 7-day window

  while (tempDate.getTime() <= today.getTime()) {
    const dateKey = format(tempDate, "dd/MM");
    const stats = dailyDataMap.get(dateKey);
    let goodEasyPercentage = 0;
    if (stats && stats.totalWords > 0) {
      goodEasyPercentage = (stats.goodEasyWords / stats.totalWords) * 100;
    }
    dailyPerformanceTrend.push({
      date: dateKey,
      totalWords: stats?.totalWords || 0,
      goodEasyPercentage: parseFloat(goodEasyPercentage.toFixed(2)),
    });
    tempDate = addDays(tempDate, 1);
  }

  return {
    totalWordsReviewed: currentMetrics.totalWordsReviewed,
    totalStudyTimeSeconds: currentMetrics.totalStudyTimeSeconds,
    accuracyPercentage: parseFloat(accuracyPercentage.toFixed(2)),
    wordsPerDay: parseFloat(wordsPerDay.toFixed(2)),
    currentReviewStreak: currentStreak,
    bestReviewStreak: bestStreak,
    periodComparison:
      period === "all_time"
        ? null
        : {
            previousTotalWordsReviewed:
              previousMetrics?.totalWordsReviewed || 0,
            previousTotalStudyTimeSeconds:
              previousMetrics?.totalStudyTimeSeconds || 0,
            wordsReviewedChangePercentage: parseFloat(
              wordsReviewedChangePercentage.toFixed(2),
            ),
            studyTimeChangePercentage: parseFloat(
              studyTimeChangePercentage.toFixed(2),
            ),
          },
    dailyPerformanceTrend,
    performanceCounts: currentMetrics.performanceCounts,
  };
}
