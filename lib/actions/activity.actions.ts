"use server";
import { prisma } from "@/db/prisma";
import { authenticationAction } from "./_helpers";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  wordsAdded: number;
  reviewSessions: number;
  quizzesTaken: number;
  totalTasks: number;
}

export const getMonthlyActivity = async (year: number, month: number) =>
  authenticationAction(async (userId) => {
    const startDate = startOfMonth(new Date(year, month - 1)); // month is 0-indexed in Date constructor
    const endDate = endOfMonth(new Date(year, month - 1));

    const allDaysInMonth = eachDayOfInterval({
      start: startDate,
      end: endDate,
    }).map((day) => format(day, "yyyy-MM-dd"));

    const activityMap: Record<string, Omit<DailyActivity, "date">> = {};
    allDaysInMonth.forEach((day) => {
      activityMap[day] = {
        wordsAdded: 0,
        reviewSessions: 0,
        quizzesTaken: 0,
        totalTasks: 0,
      };
    });

    // Fetch words added and update counts
    const wordsAdded = await prisma.word.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    wordsAdded.forEach((word) => {
      const dayKey = format(word.createdAt, "yyyy-MM-dd");
      if (activityMap[dayKey]) {
        activityMap[dayKey].wordsAdded++;
      }
    });

    // Fetch review sessions completed and update counts
    const reviewSessions = await prisma.studySession.findMany({
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

    reviewSessions.forEach((session) => {
      if (session.completedAt) {
        const dayKey = format(session.completedAt, "yyyy-MM-dd");
        if (activityMap[dayKey]) {
          activityMap[dayKey].reviewSessions++;
        }
      }
    });

    // Fetch quizzes taken and update counts
    const quizzesTaken = await prisma.quiz.findMany({
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

    quizzesTaken.forEach((quiz) => {
      if (quiz.completedAt) {
        const dayKey = format(quiz.completedAt, "yyyy-MM-dd");
        if (activityMap[dayKey]) {
          activityMap[dayKey].quizzesTaken++;
        }
      }
    });

    // Calculate totalTasks based on whether each activity type occurred at least once
    return Object.entries(activityMap).map(([date, data]) => {
      let totalTasks = 0;
      if (data.wordsAdded > 0) totalTasks++;
      if (data.reviewSessions > 0) totalTasks++;
      if (data.quizzesTaken > 0) totalTasks++;

      return { date, ...data, totalTasks };
    });
  }, []);
