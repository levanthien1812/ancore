"use server";
import { prisma } from "@/db/prisma";
import {
  MasteryLevel,
  WordReviewInfo,
  ReviewFrequency,
  DayOfWeek,
} from "../constants/enums";
import { dateFilter } from "../utils/date-filter"; // Keep this for getStudySessions
import { getPeriodDateRange, ReviewPeriod } from "../utils/date-helpers";
import {
  startOfDay,
  subDays,
  addDays,
  format,
  differenceInCalendarDays,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { revalidatePath } from "next/cache";
import { authenticationAction } from "./_helpers";
import { ReviewPerformance } from "@prisma/client";
import { remindReviewSessionsTemplate } from "../email-templates/remind-review-sessions";
import { parseTimeToMinutes } from "../utils/time-convert";
import { resend } from "../resend";

export const updateWordReview = async (
  wordId: string,
  performance: ReviewPerformance,
  studySessionId?: string,
) =>
  authenticationAction(async (userId) => {
    const word = await prisma.word.findUnique({ where: { id: wordId } });
    if (!word) {
      throw new Error("Word not found for this review session.");
    }

    // Find the most recent completed review session to determine the current interval for the algorithm.
    // This is distinct from the session being marked as completed *now*.
    const lastCompletedReview = await prisma.wordReview.findFirst({
      where: { wordId, userId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
    });

    const now = new Date();
    // Find the specific review session that is currently being completed (i.e., the pending one that was due)
    const currentPendingWordReview = await prisma.wordReview.findFirst({
      where: {
        wordId,
        userId,
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
      case ReviewPerformance.Forgot:
        newInterval = 1; // Reset interval to 1 day
        break;
      case ReviewPerformance.Hard:
        newInterval = Math.max(1, Math.floor(currentInterval * 1.2));
        break;
      case ReviewPerformance.Medium:
        newInterval = Math.max(1, Math.floor(currentInterval * 2));
        break;
      case ReviewPerformance.Good:
        newInterval = Math.floor(currentInterval * 3);
        break;
      case ReviewPerformance.Easy:
        newInterval = Math.floor(currentInterval * 4);
        break;
      default:
        newInterval = currentInterval;
    }
    // --- End of Algorithm ---
    const newScheduledAt = new Date(now.getTime());
    newScheduledAt.setDate(newScheduledAt.getDate() + newInterval);

    const isPositiveResult =
      performance === ReviewPerformance.Good ||
      performance === ReviewPerformance.Easy;
    const isNegativeResult =
      performance === ReviewPerformance.Forgot ||
      performance === ReviewPerformance.Hard;

    // --- Mastery Level Update Algorithm ---
    let newMasteryLevel = word.masteryLevel;
    switch (word.masteryLevel) {
      case MasteryLevel.New:
        newMasteryLevel = MasteryLevel.Learning;
        break;
      case MasteryLevel.Learning:
        if (isPositiveResult) {
          newMasteryLevel = MasteryLevel.Familiar;
        }
        break;
      case MasteryLevel.Familiar:
        if (performance === ReviewPerformance.Forgot) {
          newMasteryLevel = MasteryLevel.Learning; // Demote
        } else if (isPositiveResult) {
          newMasteryLevel = MasteryLevel.Mastered;
        }
        break;
      case MasteryLevel.Mastered:
        if (isNegativeResult) {
          newMasteryLevel = MasteryLevel.Familiar; // Demote if user struggles
        }
        break;
    }

    // --- Database Update ---
    const transactionOperations = [];

    if (currentPendingWordReview) {
      // 1. Mark the current pending review session as completed
      transactionOperations.push(
        prisma.wordReview.update({
          where: { id: currentPendingWordReview.id },
          data: {
            completedAt: now,
            // Save the performance rating for this specific review session
            performance: performance,
            studySessionId: studySessionId,
          },
        }),
      );
    }

    // 2. Create a new review session record for the *next* scheduled review
    transactionOperations.push(
      prisma.wordReview.create({
        data: {
          wordId,
          userId,
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
  });

export const startStudySession = async () =>
  authenticationAction(async (userId) => {
    const log = await prisma.studySession.create({
      data: {
        userId,
        completedAt: null,
        durationSeconds: 0,
      },
    });
    return log.id;
  });

export const logWordReview = async (
  logId: string,
  summary: {
    durationSeconds: number;
  },
) =>
  authenticationAction(async (userId) => {
    const log = await prisma.studySession.update({
      where: { id: logId, userId },
      data: {
        ...summary,
        completedAt: new Date(),
      },
      include: {
        reviews: {
          include: {
            word: {
              include: {
                meanings: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/review");
    return log;
  });

export const getStudySessions = async (date: Date) =>
  authenticationAction(async (userId) => {
    const logs = await prisma.studySession.findMany({
      where: {
        userId,
        completedAt: dateFilter(date),
      },
      include: {
        reviews: {
          include: {
            word: {
              include: {
                meanings: true,
              },
            },
          },
        },
      },
    });

    return logs;
  }, []);

export const getStudySessionsByMonth = async (year: number, month: number) =>
  authenticationAction(async (userId) => {
    // Create date range for the entire month (start of first day to end of last day)
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const logs = await prisma.studySession.findMany({
      where: {
        userId,
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
    const datesWithSessions = new Set(
      logs.map((log) => format(log.completedAt!, "yyyy-MM-dd")),
    );

    return Array.from(datesWithSessions);
  }, []);

export const getReviewInfo = async (wordId: string) => {
  return authenticationAction(async (userId) => {
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
    const completedReviews = await prisma.wordReview.findFirst({
      where: { wordId, userId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" }, // Most recent completed review first
    });

    info.reviewedTimes = await prisma.wordReview.count({
      where: { wordId, userId, completedAt: { not: null } },
    });

    info.lastReviewAt = completedReviews?.completedAt || null;

    // 2. Get next review date from the earliest uncompleted session
    const nextScheduledReview = await prisma.wordReview.findFirst({
      where: { wordId, userId, completedAt: null }, // Look for uncompleted
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

    return info;
  });
};

async function calculateReviewStreak(
  userId: string,
): Promise<{ currentStreak: number; bestStreak: number }> {
  const reviewDays: { day: Date }[] = await prisma.$queryRaw`
    SELECT DISTINCT DATE_TRUNC('day', "completedAt") as day
    FROM "StudySession"
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
    durationSeconds: number;
    reviews: { performance: ReviewPerformance | null }[];
  }[],
): ReviewMetrics {
  let totalWordsReviewed = 0;
  let totalStudyTimeSeconds = 0;
  const performanceCounts: Record<ReviewPerformance, number> = {
    Forgot: 0,
    Hard: 0,
    Medium: 0,
    Good: 0,
    Easy: 0,
  } as Record<ReviewPerformance, number>;

  for (const log of logs) {
    totalStudyTimeSeconds += log.durationSeconds;
    for (const session of log.reviews) {
      if (session.performance) {
        totalWordsReviewed++;
        performanceCounts[session.performance]++;
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
    previousAccuracyPercentage: number;
    wordsReviewedChangePercentage: number;
    studyTimeChangeAmount: number;
    accuracyChangePercentage: number;
  } | null;
  dailyPerformanceTrend: Array<{
    date: string;
    totalWords: number;
    goodEasyPercentage: number;
  }>;
  performanceCounts: Record<ReviewPerformance, number>;
}

export const getReviewStatistics = async (period: ReviewPeriod) =>
  authenticationAction(async (userId) => {
    const {
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd,
    } = getPeriodDateRange(period);

    // Fetch current period logs
    const currentSessions = await prisma.studySession.findMany({
      where: {
        userId,
        completedAt: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd,
        },
      },
      select: {
        durationSeconds: true,
        completedAt: true,
        reviews: {
          select: { performance: true },
        },
      },
      orderBy: {
        completedAt: "asc", // For daily trend
      },
    });

    const currentMetrics = calculatePerformanceMetrics(currentSessions);

    // Calculate accuracy percentage
    const totalWordsInCurrentPeriod = currentMetrics.totalWordsReviewed;
    let accuracyPercentage = 0;
    if (totalWordsInCurrentPeriod > 0) {
      const goodEasyWords =
        currentMetrics.performanceCounts[ReviewPerformance.Good] +
        currentMetrics.performanceCounts[ReviewPerformance.Easy];
      accuracyPercentage = (goodEasyWords / totalWordsInCurrentPeriod) * 100;
    }

    // Calculate words per day
    let wordsPerDay = 0;
    if (period !== "all_time" && totalWordsInCurrentPeriod > 0) {
      // Use date-fns to get actual calendar days difference
      const diffDays = Math.max(
        1,
        differenceInCalendarDays(currentPeriodEnd, currentPeriodStart),
      );
      wordsPerDay = totalWordsInCurrentPeriod / diffDays;
    } else if (period === "all_time" && totalWordsInCurrentPeriod > 0) {
      const firstReview = await prisma.studySession.findFirst({
        where: { userId, completedAt: { not: null } },
        orderBy: { completedAt: "asc" },
        select: { completedAt: true },
      });
      if (firstReview && firstReview.completedAt) {
        const diffDays = differenceInCalendarDays(
          currentPeriodEnd,
          firstReview.completedAt,
        );
        if (diffDays > 0) wordsPerDay = totalWordsInCurrentPeriod / diffDays;
      }
    }

    // Fetch previous period logs for comparison
    let previousMetrics: ReviewMetrics | null = null;
    if (previousPeriodStart && previousPeriodEnd) {
      const previousSessions = await prisma.studySession.findMany({
        where: {
          userId,
          completedAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd,
          },
        },
        select: {
          durationSeconds: true,
          reviews: {
            select: { performance: true },
          },
        },
      });
      previousMetrics = calculatePerformanceMetrics(previousSessions);
    }

    const wordsReviewedChangePercentage = previousMetrics?.totalWordsReviewed
      ? ((currentMetrics.totalWordsReviewed -
          previousMetrics.totalWordsReviewed) /
          previousMetrics.totalWordsReviewed) *
        100
      : currentMetrics.totalWordsReviewed > 0
        ? 100
        : 0; // If previous was 0 and current > 0, 100% increase

    const studyTimeChangeAmount =
      currentMetrics.totalStudyTimeSeconds -
      (previousMetrics?.totalStudyTimeSeconds || 0);

    let previousAccuracyPercentage = 0;
    if (previousMetrics && previousMetrics.totalWordsReviewed > 0) {
      const prevGoodEasyWords =
        previousMetrics.performanceCounts[ReviewPerformance.Good] +
        previousMetrics.performanceCounts[ReviewPerformance.Easy];
      previousAccuracyPercentage =
        (prevGoodEasyWords / previousMetrics.totalWordsReviewed) * 100;
    }

    const accuracyChangePercentage =
      previousAccuracyPercentage > 0
        ? ((accuracyPercentage - previousAccuracyPercentage) /
            previousAccuracyPercentage) *
          100
        : accuracyPercentage > 0
          ? 100
          : 0;

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

    for (const log of currentSessions) {
      const dateKey = format(
        startOfDay(log.completedAt || new Date()),
        "dd/MM",
      );
      if (!dailyDataMap.has(dateKey)) {
        dailyDataMap.set(dateKey, { totalWords: 0, goodEasyWords: 0 });
      }
      const dailyStats = dailyDataMap.get(dateKey)!;
      for (const session of log.reviews) {
        if (session.performance) {
          dailyStats.totalWords++;
          if (
            session.performance === ReviewPerformance.Good ||
            session.performance === ReviewPerformance.Easy
          ) {
            dailyStats.goodEasyWords++;
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
              previousAccuracyPercentage: Math.round(
                previousAccuracyPercentage,
              ),
              wordsReviewedChangePercentage: Math.round(
                wordsReviewedChangePercentage,
              ),
              studyTimeChangeAmount: Math.round(studyTimeChangeAmount),
              accuracyChangePercentage: Math.round(accuracyChangePercentage),
            },
      dailyPerformanceTrend,
      performanceCounts: currentMetrics.performanceCounts,
    };
  });

/**
 * System-level action to send daily review reminders based on user settings.
 * This checks frequency, active review days, and pending word counts.
 */
export const sendEmailRemindReviewSessions = async () => {
  const usersToRemind = await prisma.user.findMany({
    where: {
      settings: {
        dailyReminderEnabled: true,
      },
    },
    include: {
      settings: true,
    },
  });

  const now = new Date();

  const emailResults = [];

  for (const user of usersToRemind) {
    const settings = user.settings;
    if (!settings || !settings.reviewReminderTime) continue;

    // Convert current time to user's timezone
    const userTimezone = settings.timezone || "UTC";
    const nowInUserTz = formatInTimeZone(now, userTimezone, "HH:mm");
    const [hours, minutes] = nowInUserTz.split(":").map(Number);
    const nowMinutes = hours * 60 + minutes;

    const userMinutes = parseTimeToMinutes(settings.reviewReminderTime);
    const diff = nowMinutes - userMinutes;

    // Helpful for production debugging - show timezone context
    console.log(
      `Checking reminder for ${user.email} (${userTimezone}): LocalMinutes=${nowMinutes}, ReminderTime=${userMinutes}, Diff=${diff}`,
    );

    if (diff < 0 || diff >= 10) continue;

    // Now check the day in the user's timezone
    const todayNameInUserTz = formatInTimeZone(
      now,
      userTimezone,
      "EEEE",
    ) as DayOfWeek;
    const daysSinceEpochInUserTz = Math.floor(
      new Date(formatInTimeZone(now, userTimezone, "yyyy-MM-dd")).getTime() /
        (1000 * 60 * 60 * 24),
    );

    let isScheduledDay = false;

    // 1. Identify if today matches the user's frequency preference
    if (settings.reviewFrequency === ReviewFrequency.Daily) {
      isScheduledDay = true;
    } else if (settings.reviewFrequency === ReviewFrequency.Custom) {
      isScheduledDay = settings.reviewDays.includes(todayNameInUserTz);
    } else if (settings.reviewFrequency === ReviewFrequency.Every2Days) {
      isScheduledDay = daysSinceEpochInUserTz % 2 === 0;
    }

    if (isScheduledDay) {
      // 2. Only remind if they actually have words due for review
      const dueCount = await prisma.wordReview.count({
        where: {
          userId: user.id,
          scheduledAt: { lte: now },
          completedAt: null,
          word: {
            masteryLevel: { in: settings.includeWordLevels },
          },
        },
      });

      if (!process.env.RESEND_FROM_EMAIL) {
        console.error(
          "CRITICAL: RESEND_FROM_EMAIL is not defined in production environment variables.",
        );
        continue;
      }

      if (dueCount > 0) {
        try {
          const { data, error } = await resend.emails.send({
            from: `Ancore <${process.env.RESEND_FROM_EMAIL}>`, // Replace with your verified domain in production
            to: user.email,
            subject: `Time to review: ${dueCount} words are due!`,
            html: remindReviewSessionsTemplate({
              dueCount,
              userName: user.name || "Learner",
            }),
          });

          if (error) {
            // This will show you exactly why Resend is rejecting the request in your logs
            console.error(`Resend API error for ${user.email}:`, error);
          } else if (data) {
            emailResults.push({
              userId: user.id,
              status: "sent",
              messageId: data.id,
            });
          }
        } catch (err) {
          console.error(
            `Network error sending reminder to ${user.email}:`,
            err,
          );
        }
      }
    }
  }

  return { success: true, remindersSent: emailResults.length };
};
