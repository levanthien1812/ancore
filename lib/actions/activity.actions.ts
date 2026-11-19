"use server";
import { prisma } from "@/db/prisma";
import { authenticationAction } from "./_helpers";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  startOfDay,
  endOfDay,
} from "date-fns";
import React from "react";

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

export interface ActivityItem {
  id: string;
  type: "word_added" | "review_session" | "quiz" | "conversation";
  title: string;
  description: React.ReactNode;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export const getDailyActivities = async (date: string) =>
  authenticationAction(async (userId) => {
    const [year, month, day] = date.split("-").map(Number);
    const start = startOfDay(new Date(year, month - 1, day));
    const end = endOfDay(new Date(year, month - 1, day));

    // 1. Words added
    const words = await prisma.word.findMany({
      where: {
        userId,
        createdAt: { gte: start, lte: end },
      },
      include: {
        meanings: { take: 1, select: { definition: true, partOfSpeech: true } },
      },
    });

    const wordItems: ActivityItem[] = words.map((word) => ({
      id: word.id,
      type: "word_added",
      title: word.word,
      description: (word.meanings[0]?.definition ?? "").slice(0, 80),
      createdAt: word.createdAt.toISOString(),
      metadata: {
        word: word.word,
        masteryLevel: word.masteryLevel,
        type: word.type,
        partOfSpeech: word.meanings[0]?.partOfSpeech ?? null,
      },
    }));

    // 2. Review sessions
    const sessions = await prisma.studySession.findMany({
      where: {
        userId,
        completedAt: { gte: start, lte: end },
      },
      include: {
        reviews: {
          select: { word: true, wordLevelBefore: true, wordLevelAfter: true },
        },
      },
    });

    const sessionItems: ActivityItem[] = sessions.map((session) => ({
      id: session.id,
      type: "review_session",
      title: "Review Session",
      description: `Reviewed: ${session.reviews.map((review) => review.word.word).join(", ")}`,
      createdAt: (session.completedAt ?? new Date()).toISOString(),
      metadata: {
        durationSeconds: session.durationSeconds,
        wordsReviewedCount: session.wordsReviewedCount,
      },
    }));

    // 3. Quizzes
    const quizzes = await prisma.quiz.findMany({
      where: {
        userId,
        completedAt: { gte: start, lte: end },
      },
    });

    const quizItems: ActivityItem[] = await Promise.all(
      quizzes.map(async (quiz) => {
        const quizAnswers = await prisma.quizAnswer.findMany({
          where: { quizId: quiz.id },
          select: {
            quizQuestion: {
              select: {
                words: true,
              },
            },
          },
        });

        return {
          id: quiz.id,
          type: "quiz" as const,
          title: "Quiz",
          description: `Scored ${quiz.correctAnswers}/${quiz.totalQuestions} questions: ${quizAnswers.map((answer) => answer.quizQuestion.words.map((w) => w.word).join(", ")).join(", ")}`,
          createdAt: (quiz.completedAt ?? quiz.createdAt).toISOString(),
          metadata: {
            correctAnswers: quiz.correctAnswers,
            totalQuestions: quiz.totalQuestions,
            durationSeconds: quiz.durationSeconds,
            status: quiz.status,
          },
        };
      }),
    );

    // 4. Conversations
    const talks = await prisma.talkSession.findMany({
      where: {
        userId,
        OR: [
          { createdAt: { gte: start, lte: end } },
          { messages: { some: { createdAt: { gte: start, lte: end } } } },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const talkItems: ActivityItem[] = talks.map((session) => {
      const isNew = session.createdAt >= start && session.createdAt <= end;
      const latestMsgDate = session.messages[0]?.createdAt;
      const activityTime = isNew
        ? session.createdAt
        : (latestMsgDate ?? session.createdAt);

      return {
        id: session.id,
        type: "conversation",
        title: session.title || "Conversation",
        description: isNew
          ? "Started a new conversation"
          : "Continued conversation",
        createdAt: activityTime.toISOString(),
        metadata: {
          title: session.title,
          isNew,
        },
      };
    });

    // Combine and sort by createdAt ascending
    const all = [...wordItems, ...sessionItems, ...quizItems, ...talkItems];
    all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    return all;
  }, []);

export const getActivitiesDateRange = async () =>
  authenticationAction(
    async (userId) => {
      const [firstWord, firstSession, firstQuiz, firstTalk] = await Promise.all(
        [
          prisma.word.findFirst({
            where: { userId },
            orderBy: { createdAt: "asc" },
            select: { createdAt: true },
          }),
          prisma.studySession.findFirst({
            where: { userId, completedAt: { not: null } },
            orderBy: { completedAt: "asc" },
            select: { completedAt: true },
          }),
          prisma.quiz.findFirst({
            where: { userId },
            orderBy: { createdAt: "asc" },
            select: { createdAt: true },
          }),
          prisma.talkSession.findFirst({
            where: { userId },
            orderBy: { createdAt: "asc" },
            select: { createdAt: true },
          }),
        ],
      );

      const dates = [
        firstWord?.createdAt,
        firstSession?.completedAt,
        firstQuiz?.createdAt,
        firstTalk?.createdAt,
      ].filter((d): d is Date => d != null);

      if (dates.length === 0) return { firstDate: null };

      const earliest = dates.reduce((a, b) => (a < b ? a : b));
      return { firstDate: format(earliest, "yyyy-MM-dd") };
    },
    { firstDate: null },
  );
