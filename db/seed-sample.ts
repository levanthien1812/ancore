import "dotenv/config";
import { WordWithMeanings } from "@/components/add-word/add-word-form";
import * as fs from "fs";
import * as path from "path";
import { prisma } from "@/db/prisma";

async function main() {
  console.log(`Start seeding ...`);
  const user = await prisma.user.findFirst({
    where: { email: "levanthienabc@gmail.com" },
  });

  if (!user) return;

  try {
    await prisma.quizQuestion.deleteMany({ where: { userId: user.id } });
    await prisma.quizzesLog.deleteMany({ where: { userId: user.id } });
    await prisma.reviewLog.deleteMany({ where: { userId: user.id } });
    await prisma.wordMeaning.deleteMany({ where: { wordId: { not: "" } } });
    await prisma.reviewSession.deleteMany({ where: { userId: user.id } });
    await prisma.word.deleteMany({ where: { userId: user.id } });

    // 1. Read and parse the sample data file
    const filePath = path.join(
      process.cwd(),
      "db",
      "sample-data",
      "sample-words.json"
    );
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const sampleWords: WordWithMeanings[] = JSON.parse(fileContent);

    let createdCount = 0;

    // 2. Iterate and create words if they don't exist for the user
    for (const sampleWord of sampleWords) {
      const existingWord = await prisma.word.findFirst({
        where: { word: sampleWord.word, userId: user.id },
      });

      if (existingWord) {
        continue; // Skip if word already exists for this user
      }

      const newWord = await prisma.word.create({
        data: {
          ...sampleWord,
          userId: user.id,
          meanings: {
            create: sampleWord.meanings,
          },
        },
      });

      // 3. Create a corresponding review session for the new word
      const now = new Date();
      const initialInterval = 1; // Review again in 1 day
      await prisma.reviewSession.create({
        data: {
          userId: newWord.userId,
          wordId: newWord.id,
          completedAt: now,
          intervalDays: initialInterval,
          scheduledAt: new Date(now.setDate(now.getDate() + initialInterval)),
        },
      });

      createdCount++;
    }

    return {
      success: true,
      message: `Successfully added ${createdCount} new sample words.`,
    };
  } catch (error) {
    console.error("Failed to create sample words:", error);
    return { success: false, message: "Failed to add sample words." };
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // await prisma.$disconnect();
  });
