"use server";
import { prisma } from "@/db/prisma";
import { MasteryLevel, Word, WordMeaning } from "../generated/prisma/client";
import { saveWordValidator } from "../validators";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { WordWithMeanings } from "@/components/add-word/add-word-form";

interface WordFitler {
  masteryLevel?: MasteryLevel;
  tags?: string[];
  page: number;
  limit: number;
}

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
  console.log({ wordId, userId });
  const validatedFields = saveWordValidator.safeParse({
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
