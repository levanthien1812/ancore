"use server";
import { generateObject } from "ai";
import { prisma } from "@/db/prisma";
import { quizQuestionSchema } from "../validators";
import { auth } from "@/auth";
import {
  buildDistractorGenerationPrompt,
  distractorSchema,
} from "../ai-prompts/distractor-generation";
import { shuffleArray } from "../utils/shuffle-array";
import { WordWithMeanings } from "@/components/add-word/add-word-form";
import { MasteryLevel, QuestionType } from "../generated/prisma/client";

export async function createQuizSession(
  wordCount: number = 5
): Promise<{ success: boolean; quizLogId?: string; message?: string }> {
  const session = await auth();
  if (!session?.user?.id || !session.user) {
    throw new Error("Authentication required.");
  }
  const user = session.user;

  // 1. Get words for the quiz (New or Learning), ensuring they have meanings
  const { words: wordsToQuiz } = await getWordsToQuiz({ wordCount });

  if (wordsToQuiz.length === 0) {
    return { success: true, quizLogId: undefined };
  }

  // 2. Get all user's words to use as a distractor pool
  const allUserWords = await prisma.word.findMany({
    where: { userId: user.id },
    select: { word: true },
  });
  const distractorPool = allUserWords.map((w) => w.word);

  const quizQuestions = [];

  // Create a quizzes log first
  const quizzesLog = await prisma.quizzesLog.create({
    data: {
      userId: user.id!,
      durationSeconds: 0,
      quizzesCompleted: 0,
    },
  });

  // 3. Manually generate questions for each word
  for (const word of wordsToQuiz) {
    const mainMeaning = word.meanings[0];
    if (!mainMeaning) continue;

    // --- Question Type 1: Give Definition -> Choose Word ---
    if (mainMeaning.definition) {
      try {
        const prompt = buildDistractorGenerationPrompt(
          // No contextWord needed here
          word.word,
          distractorPool
        );
        const { object } = await generateObject({
          model: "openai/gpt-4-turbo",
          prompt,
          schema: distractorSchema,
        });

        quizQuestions.push(
          quizQuestionSchema.parse({
            wordIds: [word.id],
            direction: "Choose the correct word for the following definition:",
            question: mainMeaning.definition,
            type: QuestionType.MultipleChoice_DefinitionToWord,
            options: [...object.distractors, word.word], // Combine and shuffle on client
            // options: [word.word, "heelo", "hi", "goodbye"],
            answer: word.word,
          })
        );
      } catch (error) {
        console.error(
          `Failed to generate distractors for ${word.word}:`,
          error
        );
      }
    }

    // --- Question Type 3: Give Word -> Choose Synonym/Antonym ---
    const synonyms = mainMeaning.synonyms
      ?.split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const antonyms = mainMeaning.antonyms
      ?.split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    // Randomly decide to create a synonym or antonym question if both are available
    const createSynonym = synonyms && synonyms.length > 0;
    const createAntonym = antonyms && antonyms.length > 0;
    let questionType: "synonym" | "antonym" | null = null;

    if (createSynonym && createAntonym) {
      questionType = Math.random() > 0.5 ? "synonym" : "antonym";
    } else if (createSynonym) {
      questionType = "synonym";
    } else if (createAntonym) {
      questionType = "antonym";
    }

    if (questionType) {
      const isSynonym = questionType === "synonym";
      const correctAnswers = (isSynonym ? synonyms : antonyms) as string[];
      const correctAnswer = correctAnswers[0]; // Pick the first one as the answer
      const directionText = `Which of the following is a${
        isSynonym ? " synonym" : "n antonym"
      } for the word below?`;

      try {
        const prompt = buildDistractorGenerationPrompt(
          correctAnswer,
          distractorPool
        );
        const { object } = await generateObject({
          model: "openai/gpt-4-turbo",
          prompt,
          schema: distractorSchema,
        });

        quizQuestions.push(
          quizQuestionSchema.parse({
            wordIds: [word.id],
            direction: directionText,
            question: word.word,
            type: QuestionType.MultipleChoice_WordToSynonym, // You might want a new QuestionType for antonyms
            options: [...object.distractors, correctAnswer],
            // options: ["hello", "hi", "goodbye", correctAnswer],
            answer: correctAnswer,
          })
        );
      } catch (error) {
        console.error(
          `Failed to generate distractors for ${questionType} of ${word.word}:`,
          error
        );
      }
    }

    // --- Question Type 2: Fill in the Blank ---
    // const example = mainMeaning.exampleSentences?.split("|")[0];
    const example = mainMeaning.exampleSentences?.split("|")[0];
    if (example) {
      const questionText = example.replace(
        new RegExp(`\\b${word.word}\\b`, "gi"),
        "_____"
      );
      if (questionText !== example) {
        // Ensure the word was actually in the sentence
        quizQuestions.push(
          quizQuestionSchema.parse({
            wordIds: [word.id],
            direction: "Fill in the blank with the correct word.",
            question: questionText,
            type: QuestionType.FillInTheBlank,
            answer: word.word,
          })
        );
      }
    }

    // --- Question Type 4: Matching (if enough words) ---
    if (wordsToQuiz.length >= 3) {
      if (
        !quizQuestions.find(
          (question) =>
            question.type === QuestionType.Matching &&
            question.leftItems?.includes(word.word)
        )
      ) {
        const matchingWords = wordsToQuiz.slice(0, 4); // Use 3 or 4 words
        const leftItems = matchingWords.map((w) => w.word);
        const rightItems = matchingWords.map((w) => w.meanings[0].definition);

        quizQuestions.push(
          quizQuestionSchema.parse({
            wordIds: matchingWords.map((w) => w.id),
            direction: "Match each word to its corresponding definition.",
            question: "", // No central question content for matching
            type: QuestionType.Matching,
            leftItems,
            rightItems,
            // The answer is the correct mapping, which the client can verify
            answer: JSON.stringify(
              Object.fromEntries(leftItems.map((k, i) => [k, rightItems[i]]))
            ),
          })
        );
      }
    }
  }
  // console.log(quizQuestions);

  // 4. Save all generated questions to the database
  if (quizQuestions.length > 0) {
    try {
      // We cannot use createMany with relations, so we create them one by one.
      // A transaction ensures that if one fails, none are created.
      await prisma.$transaction(
        quizQuestions.map((q) => {
          const { wordIds, ...questionData } = q;
          return prisma.quizQuestion.create({
            data: {
              ...questionData,
              userId: user.id!,
              quizzesLogId: quizzesLog.id,
              words: { connect: wordIds.map((id) => ({ id })) },
            },
          });
        })
      );
    } catch (error) {
      console.error("Failed to save quiz questions:", error);
      return { success: false, message: "Could not create quiz session." };
    }
  }

  return { success: true, quizLogId: quizzesLog.id };
}

export const getWordsToQuiz = async ({
  wordCount,
}: {
  wordCount: number;
}): Promise<{ words: WordWithMeanings[]; estimatedTimeInMinutes: number }> => {
  const session = await auth();
  if (!session?.user?.id || !session.user) {
    throw new Error("Authentication required.");
  }
  const user = session.user;

  const words = await prisma.word.findMany({
    where: {
      userId: user.id,
      masteryLevel: {
        in: [MasteryLevel.New, MasteryLevel.Learning],
      },
      meanings: {
        some: { definition: { not: "" } },
      },
    },
    take: wordCount,
    include: {
      meanings: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // --- Calculate Approximate Quiz Time ---
  let questionCount = 0;
  const timePerQuestionInSeconds = 20; // Average time per question

  for (const word of words) {
    const mainMeaning = word.meanings[0];
    if (!mainMeaning) continue;

    // Definition to Word question
    if (mainMeaning.definition) questionCount++;

    // Synonym/Antonym question
    const hasSynonyms =
      mainMeaning.synonyms &&
      mainMeaning.synonyms.split(",").some((s) => s.trim().length > 0);
    const hasAntonyms =
      mainMeaning.antonyms &&
      mainMeaning.antonyms.split(",").some((a) => a.trim().length > 0);
    if (hasSynonyms || hasAntonyms) questionCount++;

    // Fill in the Blank question
    const example = mainMeaning.exampleSentences?.split("|")[0];
    if (example && example.includes(word.word)) questionCount++;
  }

  // Matching question
  if (words.length >= 3) {
    questionCount++;
  }

  const totalTimeInSeconds = questionCount * timePerQuestionInSeconds;
  const estimatedTimeInMinutes = Math.ceil(totalTimeInSeconds / 60);

  return { words, estimatedTimeInMinutes };
};

/**
 * Deletes old, incomplete quiz sessions.
 * This is intended to be called by a scheduled cron job.
 */
export async function cleanupAbandonedQuizzes() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const abandonedQuizzes = await prisma.quizzesLog.findMany({
      where: {
        completedAt: null, // The quiz was never finished
        createdAt: {
          lt: twentyFourHoursAgo, // It was created more than 24 hours ago
        },
      },
      select: {
        id: true,
      },
    });

    if (abandonedQuizzes.length === 0) {
      return { success: true, message: "No abandoned quizzes to clean up." };
    }

    const { count } = await prisma.quizzesLog.deleteMany({
      where: {
        id: {
          in: abandonedQuizzes.map((q) => q.id),
        },
      },
    });

    return { success: true, message: `Cleaned up ${count} abandoned quizzes.` };
  } catch (error) {
    console.error("Error cleaning up abandoned quizzes:", error);
    return { success: false, message: "Failed to clean up abandoned quizzes." };
  }
}

export async function updateQuizQuestion(
  questionId: string,
  userAnswer: string,
  isCorrect: boolean
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required.");
  }

  try {
    const question = await prisma.quizQuestion.update({
      where: {
        id: questionId,
        userId: session.user.id, // Ensure user can only update their own questions
      },
      data: { userAnswer, isCorrect },
      include: {
        words: true, // Fetch the related words
      },
    });

    // --- Mastery Level Update Algorithm ---
    if (question && question.words.length > 0) {
      for (const word of question.words) {
        let newMasteryLevel = word.masteryLevel;

        if (isCorrect) {
          // Promote the word
          if (word.masteryLevel === MasteryLevel.New) {
            newMasteryLevel = MasteryLevel.Learning;
          } else if (word.masteryLevel === MasteryLevel.Learning) {
            newMasteryLevel = MasteryLevel.Familiar;
          } else if (word.masteryLevel === MasteryLevel.Familiar) {
            newMasteryLevel = MasteryLevel.Mastered;
          }
        } else {
          // Demote the word
          if (word.masteryLevel === MasteryLevel.Mastered) {
            newMasteryLevel = MasteryLevel.Familiar;
          } else if (word.masteryLevel === MasteryLevel.Familiar) {
            newMasteryLevel = MasteryLevel.Learning;
          }
        }

        if (newMasteryLevel !== word.masteryLevel) {
          await prisma.word.update({
            where: { id: word.id },
            data: { masteryLevel: newMasteryLevel },
          });
        }
      }
    }
  } catch (error) {
    console.error("Failed to update quiz question:", error);
    // Optionally return a value to indicate failure
  }
}

export async function logQuizResult(
  quizLogId: string,
  durationSeconds: number
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required.");
  }

  try {
    // Fetch the questions from the log to calculate the final score
    const questionsInLog = await prisma.quizQuestion.findMany({
      where: { quizzesLogId: quizLogId, userId: session.user.id },
      select: { isCorrect: true },
    });

    const correctAnswersCount = questionsInLog.filter(
      (q) => q.isCorrect
    ).length;

    // Update the main quiz log with the final details
    await prisma.quizzesLog.update({
      where: { id: quizLogId, userId: session.user.id },
      data: {
        completedAt: new Date(),
        durationSeconds,
        quizzesCompleted: correctAnswersCount,
      },
    });
  } catch (error) {
    console.error("Failed to log quiz result:", error);
  }
}

export async function getQuizLog(quizLogId: string) {
  const quizLog = await prisma.quizzesLog.findUnique({
    where: { id: quizLogId },
    include: {
      questions: {
        include: {
          words: true,
        },
        orderBy: {
          createdAt: "asc", // Keep a consistent order from DB
        },
      },
    },
  });

  if (quizLog?.questions) {
    quizLog.questions = shuffleArray(quizLog.questions);
  }

  return quizLog;
}

export const getRecentQuizzes = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const quizzes = await prisma.quizzesLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return quizzes;
};
