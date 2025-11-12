"use server";
import { prisma } from "@/db/prisma";
import { MasteryLevel, Word, WordMeaning } from "../generated/prisma/client";
import { saveWordValidator } from "../validators";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

interface WordFitler {
  masteryLevel: MasteryLevel;
  tags: string[];
  page: number;
  limit: number;
}

export async function getWordListByFilter(wordFilter: WordFitler) {
  const data = await prisma.word.findMany({
    where: {
      masteryLevel: wordFilter.masteryLevel,
      tags: {
        hasEvery: wordFilter.tags,
      },
    },
    skip: (wordFilter.page - 1) * wordFilter.limit,
    take: wordFilter.limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}

export async function saveWord(prevState: unknown, formData: FormData) {
  const session = await auth();
  console.log({ session });
  if (!session?.user?.id) {
    return {
      success: false,
      message: "Authentication required.",
    };
  }
  const userId = session.user.id;

  const meanings = JSON.parse(formData.get("meanings") as string);

  const validatedFields = saveWordValidator.safeParse({
    word: formData.get("word"),
    pronunciation: formData.get("pronunciation"),
    cefrLevel: formData.get("cefrLevel"),
    masteryLevel: MasteryLevel.New,
    audioUrl: formData.get("audioUrl") || "",
    tags: formData.get("tags"),
    meanings: meanings,
  });

  console.log({ validatedFields });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { meanings: meaningData, ...wordData } = validatedFields.data;

  try {
    const word = await prisma.word.create({
      data: {
        ...wordData,
        userId,
      },
    });

    await prisma.wordMeaning.createMany({
      data: meaningData.map((meaning) => ({
        ...meaning,
        wordId: word.id,
      })),
    });

    revalidatePath("/"); // Or any other path you want to revalidate
    return { success: true, message: "Word saved successfully." };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to save word." };
  }
}

export async function saveMeaning(meaning: WordMeaning) {
  const data = await prisma.wordMeaning.create({
    data: meaning,
  });

  return data;
}
