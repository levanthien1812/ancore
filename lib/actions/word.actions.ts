import { prisma } from "@/db/prisma";
import { MasteryLevel } from "../generated/prisma/enums";

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
