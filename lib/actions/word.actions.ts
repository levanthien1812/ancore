"use server";
import { prisma } from "@/db/prisma";
import { MasteryLevel, Word, WordMeaning } from "../generated/prisma/client";
import { saveWordSchema } from "../validators";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { WordWithMeanings } from "@/components/add-word/add-word-form";
import { defaultWordsCountByMasteryLevel } from "../constants/initial-values";
import { WordFitler, WordsCountByPeriod, Period } from "../type";

export async function getWordListByFilter(
  wordFilter: WordFitler
): Promise<WordWithMeanings[]> {
  const data = await prisma.word.findMany({
    where: {
      ...(wordFilter.masteryLevel && { masteryLevel: wordFilter.masteryLevel }),
      ...(wordFilter.tags && {
        hasEvery: wordFilter.tags,
      }),
    },
    skip: (wordFilter.page - 1) * wordFilter.limit,
    take: wordFilter.limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      meanings: true,
    },
  });

  return data;
}

export async function getRecentWords() {
  const data = await prisma.word.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      meanings: true,
    },
  });

  return data;
}

export async function getWord(id: string) {
  const data = await prisma.word.findUnique({
    where: {
      id,
    },
    include: {
      meanings: true,
    },
  });

  return data;
}

export async function updateWord(id: string, data: Partial<Word>) {
  const updatedData = await prisma.word.update({
    where: {
      id,
    },
    data,
  });
  return updatedData;
}

export async function saveWord(prevState: unknown, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Authentication required.",
    };
  }
  const userId = session.user.id;

  const wordId = formData.get("id") as string | null;

  const validatedFields = saveWordSchema.safeParse({
    word: formData.get("word"),
    pronunciation: formData.get("pronunciation"),
    cefrLevel: formData.get("cefrLevel"),
    masteryLevel: formData.get("masteryLevel"),
    audioUrl: formData.get("audioUrl") || "",
    tags: formData.get("tags"),
    meanings: formData.get("meanings"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { meanings: meaningData, ...wordData } = validatedFields.data;

  try {
    if (wordId) {
      // --- UPDATE LOGIC ---
      // Ensure the user owns the word they are trying to update
      const existingWord = await prisma.word.findFirst({
        where: { id: wordId, userId },
      });

      if (!existingWord) {
        return {
          success: false,
          message: "Word not found or permission denied.",
        };
      }

      // Transaction to update word, delete old meanings, and create new ones
      await prisma.$transaction([
        prisma.word.update({
          where: { id: wordId },
          data: { ...wordData },
        }),
        prisma.wordMeaning.deleteMany({ where: { wordId } }),
        prisma.wordMeaning.createMany({
          data: meaningData.map((meaning) => ({
            ...meaning,
            wordId: wordId,
          })),
        }),
      ]);
    } else {
      // --- CREATE LOGIC ---
      const word = await prisma.word.create({
        data: {
          ...wordData,
          userId,
        },
      });

      await prisma.wordMeaning.createMany({
        data: meaningData.map((meaning) => ({ ...meaning, wordId: word.id })),
      });

      if (word) {
        const now = new Date();
        const initialInterval = 1; // Review again in 1 day

        await prisma.reviewSession.create({
          data: {
            userId: word.userId,
            wordId: word.id,
            completedAt: now,
            intervalDays: initialInterval,
            scheduledAt: new Date(now.setDate(now.getDate() + initialInterval)),
          },
        });
      }
    }

    revalidatePath("/"); // Or any other path you want to revalidate
    return { success: true, message: "Word saved successfully." };
  } catch (error) {
    return { success: false, message: "Database error: Failed to save word." };
  }
}

export async function saveMeaning(meaning: WordMeaning) {
  const data = await prisma.wordMeaning.create({
    data: meaning,
  });

  return data;
}

/**
 * Calculates the user's learning streak based on word creation dates.
 * The streak is the number of consecutive days a user has added words, ending today or yesterday.
 * @param uniqueDays - A sorted array of unique dates when words were created.
 * @returns The length of the current learning streak.
 */
function calculateStreak(uniqueDays: { day: Date }[]): number {
  if (uniqueDays.length === 0) {
    return 0;
  }

  let streak = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  // The most recent day the user learned a word
  const mostRecentDay = new Date(uniqueDays[0].day);

  // If the most recent word wasn't added today or yesterday, the streak is broken.
  if (
    mostRecentDay.getTime() !== today.getTime() &&
    mostRecentDay.getTime() !== yesterday.getTime()
  ) {
    return 0;
  }

  // Start checking for consecutive days from the most recent entry
  const currentDate = mostRecentDay;
  for (const record of uniqueDays) {
    const recordDay = new Date(record.day);
    if (recordDay.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setUTCDate(currentDate.getUTCDate() - 1); // Move to the previous day
    } else {
      break; // The streak is broken
    }
  }

  return streak;
}

export async function getWordsCountPerMasteryLevel() {
  const session = await auth();
  if (!session?.user?.id) {
    return defaultWordsCountByMasteryLevel;
  }

  const wordsCount = await prisma.word.groupBy({
    by: ["masteryLevel"],
    where: {
      userId: session?.user?.id,
    },
    _count: {
      masteryLevel: true,
    },
  });

  return wordsCount.reduce(
    (acc, cur) => {
      acc[cur.masteryLevel] = cur._count.masteryLevel;
      return acc;
    },
    { ...defaultWordsCountByMasteryLevel }
  );
}

export async function getLearnStreak() {
  const session = await auth();

  if (!session?.user?.id) {
    return 0;
  }

  const userId = session.user.id;

  const uniqueDays: { day: Date }[] = await prisma.$queryRaw`
    SELECT DISTINCT DATE_TRUNC('day', "createdAt") as day
    FROM "Word"
    WHERE "userId" = ${userId}
    ORDER BY day DESC
  `;
  return calculateStreak(uniqueDays);
}

export async function getWordsCountByPeriod(
  period: Period,
  periodCount: number
): Promise<WordsCountByPeriod[]> {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }
  const userId = session.user.id;

  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day
  if (period === "day") {
    startDate.setUTCDate(startDate.getUTCDate() - (periodCount - 1));
  } else if (period === "week") {
    startDate.setUTCDate(startDate.getUTCDate() - (periodCount - 1) * 7);
  } else if (period === "month") {
    startDate.setUTCMonth(startDate.getUTCMonth() - (periodCount - 1));
  }

  const wordsCount: {
    period_start: Date;
    masteryLevel: MasteryLevel;
    count: bigint;
  }[] = await prisma.$queryRaw`
    SELECT DATE_TRUNC(${period}, "createdAt") as period_start, "masteryLevel", COUNT(*) as count
    FROM "Word"
    WHERE "userId" = ${userId} AND "createdAt" >= ${startDate}
    GROUP BY period_start, "masteryLevel"
    ORDER BY period_start ASC
  `;

  // 1. Create a map of results from the database for easy lookup
  const dbResultsMap = new Map<string, Record<string, number>>();
  for (const item of wordsCount) {
    const dateKey = new Date(item.period_start).toISOString().split("T")[0];
    if (!dbResultsMap.has(dateKey)) {
      dbResultsMap.set(dateKey, {});
    }
    dbResultsMap.get(dateKey)![item.masteryLevel] = Number(item.count);
  }
  console.log(defaultWordsCountByMasteryLevel);

  // 2. Generate the full date range and merge with DB results
  const finalData: WordsCountByPeriod[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let i = 0; i < periodCount; i++) {
    const currentDate = new Date(today);
    if (period === "day") {
      currentDate.setUTCDate(today.getUTCDate() - i);
    } else if (period === "week") {
      currentDate.setUTCDate(today.getUTCDate() - i * 7);
    } else if (period === "month") {
      currentDate.setUTCMonth(today.getUTCMonth() - i);
    }
    const dateKey = currentDate.toISOString().split("T")[0];
    const countsForDate = dbResultsMap.get(dateKey) || {};

    finalData.push({
      periodStart: currentDate,
      ...defaultWordsCountByMasteryLevel,
      ...countsForDate,
    });
  }

  return finalData.reverse(); // Return in chronological order
}

export const getWordCountLearned = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return 0;
  }

  const userId = session.user.id;

  const wordsCount = await prisma.word.count({
    where: {
      userId,
      masteryLevel: {
        in: [MasteryLevel.Familiar, MasteryLevel.Mastered],
      },
    },
  });

  return wordsCount;
};

export const getWordsToReview = async (limit: number = 20) => {
  const session = await auth();
  if (!session?.user?.id) {
    return []; // Return empty array if not logged in
  }

  const dueReviews = await prisma.reviewSession.findMany({
    where: {
      userId: session.user.id,
      scheduledAt: {
        lte: new Date(), // lte = less than or equal to
      },
    },
    take: limit, // Limit the number of words per session
    include: {
      word: {
        // Include the full word details
        include: {
          meanings: true, // And its meanings
        },
      },
    },
    orderBy: {
      scheduledAt: "asc", // Show the most overdue words first
    },
  });

  // Extract the word data from the review session objects
  return dueReviews.map((review) => review.word);
};

export const getWordsToReviewCount = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return 0;
  }

  const count = await prisma.reviewSession.count({
    where: {
      userId: session.user.id,
      scheduledAt: {
        lte: new Date(),
      },
    },
  });

  return count;
};
