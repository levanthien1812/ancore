import "dotenv/config";
import { prisma } from "@/db/prisma";
import { DifficultyLevel, MasteryLevel } from "@/lib/generated/prisma/client";
import { faker } from "@faker-js/faker";

async function main() {
  console.log(`Start seeding ...`);

  const user = await prisma.user.findFirst({
    where: { email: "levanthienabc@gmail.com" },
  });

  if (!user) return;

  const cefrLevels = Object.values(DifficultyLevel);
  const masteryLevels = Object.values(MasteryLevel);
  const partsOfSpeech = ["noun", "verb", "adjective", "adverb"];

  await prisma.wordMeaning.deleteMany({ where: { wordId: { not: "" } } });
  await prisma.reviewSession.deleteMany({ where: { userId: user.id } });
  await prisma.word.deleteMany({ where: { userId: user.id } });

  console.log("Generating 50 words...");
  for (let i = 0; i < 50; i++) {
    const randomWord = faker.lorem.word();
    if (await prisma.word.findFirst({ where: { word: randomWord } })) {
      i--;
      continue;
    }

    try {
      const newWord = await prisma.word.create({
        data: {
          word: `${randomWord}`,
          userId: user.id,
          cefrLevel: faker.helpers.arrayElement(cefrLevels),
          pronunciation: `/${randomWord}/`,
          masteryLevel: faker.helpers.arrayElement(masteryLevels),
          tags: faker.lorem
            .words(faker.number.int({ min: 0, max: 3 }))
            .split(" ")
            .join(","),
          meanings: {
            create: Array.from({
              length: faker.number.int({ min: 1, max: 2 }),
            }).map(() => ({
              definition: faker.lorem.sentence(),
              partOfSpeech: faker.helpers.arrayElement(partsOfSpeech),
              exampleSentences: faker.lorem.sentences(
                faker.number.int({ min: 1, max: 3 })
              ),
              synonyms: faker.lorem
                .words(faker.number.int({ min: 0, max: 5 }))
                .split(" ")
                .join(", "),
              antonyms: faker.lorem
                .words(faker.number.int({ min: 0, max: 5 }))
                .split(" ")
                .join(", "),
              whenToUse: faker.lorem.sentence(),
              usageNotes: faker.lorem.sentence(),
            })),
          },
        },
      });
      const intervalDays = faker.number.int({ min: 1, max: 5 });

      await prisma.reviewSession.create({
        data: {
          completedAt: new Date(),
          intervalDays: intervalDays,
          scheduledAt: new Date(
            new Date().getTime() + (intervalDays - 1) * 24 * 60 * 60 * 1000
          ),
          userId: user.id,
          wordId: newWord.id,
        },
      });
    } catch (e: unknown) {
      // It's possible faker generates a duplicate word, so we catch and log it.
      if (e instanceof Error) {
        console.log(e.message);
      } else {
        throw e;
      }
    }
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // await prisma.$disconnect();
  });
