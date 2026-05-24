"use server";
import { prisma } from "@/db/prisma";
import { saveWordSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { WordWithMeanings } from "@/components/add-word/add-word-form";
import { MasteryLevel } from "../constants/enums";
import { WordFitler, WordsCountByPeriod, Period } from "../type";
import { defaultWordsCountByMasteryLevel } from "../constants/initial-values";
import { User, Word, WordMeaning } from "@prisma/client";
import { toBoolean } from "../utils/to-boolean";
import { buildWordAutofillPrompt } from "../ai-prompts/word-autofill";
import { fillWordWithAi } from "@/app/services/fill-word-with-ai";
import { authenticationAction } from "./_helpers";
import { buildWordOfTheDayPrompt } from "../ai-prompts/word-of-the-day";
import { generateWordOfTheDayWithAI } from "@/app/services/generate-word-of-the-day-with-ai";

export const getWordListByFilter = async (wordFilter: WordFitler) =>
  authenticationAction(
    async (userId) => {
      const where = {
        userId,
        ...(wordFilter.masteryLevel && {
          masteryLevel: wordFilter.masteryLevel,
        }),
        ...(wordFilter.tags && {
          hasEvery: wordFilter.tags,
        }),
      };

      const [words, totalCount] = await Promise.all([
        prisma.word.findMany({
          where,
          skip: (wordFilter.page - 1) * wordFilter.limit,
          take: wordFilter.limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            meanings: true,
          },
        }),
        prisma.word.count({ where }),
      ]);

      return { words, totalCount };
    },
    { words: [], totalCount: 0 },
  );

export const getRecentWords = async () =>
  authenticationAction(async (userId) => {
    return await prisma.word.findMany({
      where: { userId },
      take: 15,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        meanings: true,
      },
    });
  }, []);

export const getWord = async (id: string) =>
  authenticationAction(async (userId) => {
    return await prisma.word.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        meanings: true,
      },
    });
  });

export const updateWord = async (id: string, data: Partial<Word>) =>
  authenticationAction(async (userId) => {
    // Ensure ownership before updating
    const existingWord = await prisma.word.findFirst({
      where: { id, userId },
    });

    if (!existingWord) {
      return null;
    }

    const updatedData = await prisma.word.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/words");
    return updatedData;
  });

export const saveWord = async (prevState: unknown, formData: FormData) =>
  authenticationAction(async (userId) => {
    const wordId = formData.get("id") as string | null;

    const validatedFields = saveWordSchema.safeParse({
      word: formData.get("word")?.toString()?.toLowerCase(),
      type: formData.get("type"),
      masteryLevel: formData.get("masteryLevel"),
      audioUrl: formData.get("audioUrl"),
      tags: formData.get("tags"),
      meanings: formData.get("meanings"),
      highlighted: toBoolean(formData.get("highlighted") as string),
      isOriginal: toBoolean(formData.get("isOriginal") as string),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const {
      meanings: meaningData,
      isOriginal,
      ...wordData
    } = validatedFields.data;

    try {
      if (wordId) {
        const existingWord = await prisma.word.findFirst({
          where: { id: wordId, userId },
        });

        if (!existingWord) {
          return {
            success: false,
            message: "Word not found or permission denied.",
          };
        }

        await prisma.$transaction([
          prisma.word.update({
            where: { id: wordId },
            data: { ...wordData, isOriginal },
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
        const word = await prisma.word.create({
          data: {
            ...wordData,
            isOriginal,
            userId,
          },
        });

        await prisma.wordMeaning.createMany({
          data: meaningData.map((meaning) => ({ ...meaning, wordId: word.id })),
        });

        if (word) {
          const now = new Date();
          const initialInterval = 1;

          await prisma.reviewSession.create({
            data: {
              userId: word.userId,
              wordId: word.id,
              completedAt: null,
              intervalDays: initialInterval,
              scheduledAt: new Date(
                now.setDate(now.getDate() + initialInterval),
              ),
            },
          });
        }
      }

      revalidatePath("/words");

      return { success: true, message: "Word saved successfully." };
    } catch (error) {
      return {
        success: false,
        message: "Database error: Failed to save word.",
      };
    }
  });

export const saveMeaning = async (meaning: WordMeaning) =>
  authenticationAction(async () => {
    return await prisma.wordMeaning.create({
      data: meaning,
    });
  });

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

export const getWordsCountPerMasteryLevel = async () =>
  authenticationAction(async (userId) => {
    const wordsCount = await prisma.word.groupBy({
      by: ["masteryLevel"],
      where: {
        userId,
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
      { ...defaultWordsCountByMasteryLevel },
    );
  });

export const getLearnStreak = async () =>
  authenticationAction(async (userId) => {
    const uniqueDays: { day: Date }[] = await prisma.$queryRaw`
      SELECT DISTINCT DATE_TRUNC('day', "updatedAt") as day
      FROM "Word"
      WHERE "userId" = ${userId}
      ORDER BY day DESC
    `;
    return calculateStreak(uniqueDays);
  }, 0);

const getStartOfPeriod = (
  period: Period,
  givenDate?: Date,
  periodCount?: number,
) => {
  const count = periodCount || 1;
  const date = givenDate || new Date();
  if (count > 1) {
    switch (period) {
      case "day":
        date.setUTCDate(date.getUTCDate() - (count - 1));
        break;
      case "week":
        date.setUTCDate(date.getUTCDate() - (count - 1) * 7);
        break;
      case "month":
        date.setUTCMonth(date.getUTCMonth() - (count - 1));
        break;
    }
  }

  switch (period) {
    case "day":
      break;
    case "week":
      const dayOfWeek = date.getUTCDay();
      if (dayOfWeek === 0) {
        date.setUTCDate(date.getUTCDate() - 6);
      } else {
        date.setUTCDate(date.getUTCDate() - (dayOfWeek - 1));
      }
      break;
    case "month":
      date.setUTCDate(1);
      break;
  }
  return date;
};

export const getWordsCountByPeriod: (
  period: Period,
  periodCount: number,
) => Promise<WordsCountByPeriod[] | null> = async (period, periodCount) =>
  authenticationAction(async (userId) => {
    const startDate = getStartOfPeriod(period, undefined, periodCount);

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

    // 2. Generate the full date range and merge with DB results
    const finalData: WordsCountByPeriod[] = [];

    for (let i = 0; i < periodCount; i++) {
      const today = new Date();
      const startOfPeriod = getStartOfPeriod(period, today, i + 1);
      const dateKey = startOfPeriod.toISOString().split("T")[0];
      const countsForDate = dbResultsMap.get(dateKey) || {};

      finalData.push({
        periodStart: startOfPeriod,
        ...defaultWordsCountByMasteryLevel,
        ...countsForDate,
      });
    }

    return finalData.reverse(); // Return in chronological order
  });

export const getWordCountLearned = async () =>
  authenticationAction(async (userId) => {
    const wordsCount = await prisma.word.count({
      where: {
        userId,
        masteryLevel: {
          in: [MasteryLevel.Familiar, MasteryLevel.Mastered],
        },
      },
    });

    return wordsCount;
  });

export const getWordsThisWeek = async () =>
  authenticationAction(async (userId) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // To get Monday
    startOfWeek.setUTCDate(now.getUTCDate() - daysToSubtract);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const wordsCount = await prisma.word.count({
      where: {
        userId,
        createdAt: {
          gte: startOfWeek,
        },
      },
    });

    return wordsCount;
  });

export const getWordsLastWeek = async () =>
  authenticationAction(async (userId) => {
    const now = new Date();
    const startOfLastWeek = new Date(now);
    const dayOfWeek = now.getUTCDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // To get Monday of current week
    startOfLastWeek.setUTCDate(now.getUTCDate() - daysToSubtract - 7); // Monday of last week
    startOfLastWeek.setUTCHours(0, 0, 0, 0);

    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setUTCDate(startOfLastWeek.getUTCDate() + 6);
    endOfLastWeek.setUTCHours(23, 59, 59, 999);

    const wordsCount = await prisma.word.count({
      where: {
        userId,
        createdAt: {
          gte: startOfLastWeek,
          lte: endOfLastWeek,
        },
      },
    });

    return wordsCount;
  });

export const getWeekComparison = async () =>
  authenticationAction(async () => {
    const [thisWeek, lastWeek] = await Promise.all([
      getWordsThisWeek(),
      getWordsLastWeek(),
    ]);
    if (thisWeek === null || lastWeek === null) {
      return {
        thisWeek: 0,
        lastWeek: 0,
        difference: 0,
        percentageChange: 0,
      };
    }

    const difference = thisWeek - lastWeek;
    const percentageChange =
      lastWeek > 0 ? (difference / lastWeek) * 100 : thisWeek > 0 ? 100 : 0;

    return {
      thisWeek,
      lastWeek,
      difference,
      percentageChange: Math.round(percentageChange * 100) / 100,
    };
  });

export const getBestDay = async () =>
  authenticationAction(async (userId) => {
    // Get data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    const dailyCounts = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(*) as count
    FROM "Word"
    WHERE "userId" = ${userId} AND "createdAt" >= ${thirtyDaysAgo}
    GROUP BY date
    ORDER BY count DESC
    LIMIT 1
  `;

    if (dailyCounts.length === 0) {
      return null;
    }

    const bestDay = dailyCounts[0];
    return {
      date: bestDay.date,
      count: Number(bestDay.count),
    };
  });

export const getWordsToReview = async (limit: number = 10) =>
  authenticationAction(async (userId) => {
    // 1. Find unique wordIds that have a review session due,
    //    ordered by the earliest scheduledAt of their due sessions.
    const earliestDueReviews = await prisma.reviewSession.groupBy({
      by: ["wordId"],
      where: {
        userId,
        scheduledAt: {
          lte: new Date(), // Get all words due today or in the past
        },
        completedAt: null, // Exclude completed sessions
      },
      _min: {
        scheduledAt: true,
      },
      orderBy: {
        _min: {
          scheduledAt: "asc", // Prioritize words with earlier scheduled reviews
        },
      },
      take: limit, // Limit the number of words per session
    });

    const uniqueWordIds = earliestDueReviews.map((item) => item.wordId);

    if (uniqueWordIds.length === 0) {
      return [];
    }

    // 2. Fetch the actual word details for these unique wordIds
    const words = await prisma.word.findMany({
      where: {
        id: {
          in: uniqueWordIds,
        },
      },
      include: { meanings: true },
    });

    // Reorder the fetched words based on the `uniqueWordIds` order
    const orderedWords = uniqueWordIds
      .map((wordId) => words.find((word) => word.id === wordId))
      .filter(Boolean) as WordWithMeanings[]; // Filter out any potential undefineds

    return orderedWords;
  });

export const getWordsToReviewCount = async () =>
  authenticationAction(async (userId) => {
    const reviews = await prisma.reviewSession.groupBy({
      by: ["wordId"],
      where: {
        userId,
        scheduledAt: {
          lte: new Date(), // Count all words due today or in the past
        },
      },
    });

    return reviews.length;
  });

export const deleteWords = async (prevState: unknown, formData: FormData) =>
  authenticationAction(async (userId) => {
    const wordIds = formData.getAll("ids") as string[];

    try {
      await prisma.$transaction([
        prisma.wordMeaning.deleteMany({
          where: { wordId: { in: wordIds } },
        }),
        prisma.reviewSession.deleteMany({
          where: { wordId: { in: wordIds } },
        }),
        prisma.word.deleteMany({
          where: {
            id: { in: wordIds },
            userId,
          },
        }),
      ]);

      revalidatePath("/words");

      return { success: true, message: "Words deleted successfully." };
    } catch (error) {
      return { success: false, message: "Failed to delete words." };
    }
  });

export const bulkUpdateMasteryLevel = async (
  prevState: unknown,
  formData: FormData,
) =>
  authenticationAction(async (userId) => {
    const wordIds = formData.getAll("ids") as string[];
    const masteryLevel = formData.get("masteryLevel") as MasteryLevel;

    try {
      await prisma.word.updateMany({
        where: {
          id: { in: wordIds },
          userId,
        },
        data: {
          masteryLevel,
        },
      });

      revalidatePath("/words");

      return { success: true, message: "Words updated successfully." };
    } catch (error) {
      return { success: false, message: "Failed to update words." };
    }
  });

export const checkWordExists = async (word: string) =>
  authenticationAction(async (userId) => {
    const existingWord = await prisma.word.findFirst({
      where: {
        userId,
        word: word.toLowerCase(),
      },
    });

    return existingWord !== null;
  });

export const fillWithAI = async (
  word: string,
  additionalInfo?: {
    pos?: string;
    avoidMeanings?: string[];
    relatedTo?: string; // Add new parameter
  },
) =>
  authenticationAction(async (userId) => {
    // Reduce token usage by checking for an existing original (AI-generated) word record
    if (!additionalInfo) {
      console.log("Entered!");
      const existingWord = await prisma.word.findFirst({
        where: {
          word: word.toLowerCase(),
          isOriginal: true,
        },
        include: { meanings: true },
      });

      if (existingWord) {
        return {
          word: existingWord.word,
          meanings: existingWord.meanings.map((m) => ({
            definition: m.definition,
            pronunciation: m.pronunciation || undefined,
            cefrLevel: m.cefrLevel || undefined,
            partOfSpeech: m.partOfSpeech || undefined,
            examples: m.examples,
            synonyms: m.synonyms || undefined,
            antonyms: m.antonyms || undefined,
          })),
          usageNotes: existingWord.meanings[0]?.usageNotes || undefined,
        };
      }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const prompt = buildWordAutofillPrompt(
      word,
      user as User,
      additionalInfo?.pos,
      additionalInfo?.avoidMeanings,
      additionalInfo?.relatedTo,
    );

    const data = await fillWordWithAi(prompt);

    if (data) {
      try {
        if (!data.meanings || data.meanings.length === 0) {
          return null;
        }
      } catch (error) {
        return null;
      }
    }
    return data;
  });

export const getWordOfTheDay = async () =>
  authenticationAction(async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.wordOfTheDayStopped) return null;

    const prompt = buildWordOfTheDayPrompt(user);
    const data = await generateWordOfTheDayWithAI(prompt);

    return data;
  });
