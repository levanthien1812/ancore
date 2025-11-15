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
  await prisma.word.deleteMany({ where: { userId: user.id } });

  console.log("Generating 50 words...");
  for (let i = 0; i < 50; i++) {
    const randomWord = faker.lorem.word();
    try {
      await prisma.word.create({
        data: {
          word: `${randomWord}`,
          userId: user.id,
          cefrLevel: faker.helpers.arrayElement(cefrLevels),
          pronunciation: `/${randomWord}/`,
          masteryLevel: faker.helpers.arrayElement(masteryLevels),
          tags: faker.lorem
            .words(faker.number.int({ min: 1, max: 4 }))
            .split(" "),
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
            })),
          },
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
