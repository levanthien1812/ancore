"use server";
import { prisma } from "@/db/prisma";
import { quizQuestionSchema } from "../validators";
import { auth } from "@/auth";
import { buildDistractorGenerationPrompt } from "../ai-prompts/distractor-generation";
import { shuffleArray } from "../utils/shuffle-array";
import { WordWithMeanings } from "@/components/add-word/add-word-form";
import { MasteryLevel, QuestionType, QuizStatus } from "@prisma/client";
import { generateDistractorsWithAi } from "@/app/services/generate-distractors-with-ai";
import { QuizAnswerWithQuestion, QuizWithAnswers } from "../type";

export async function createQuizSession(
  wordCount: number = 5,
  specificWords?: string[],
): Promise<{ success: boolean; quizId?: string; message?: string }> {
  const session = await auth();
  if (!session?.user?.id || !session.user) {
    throw new Error("Authentication required.");
  }
  const user = session.user;

  // 1. Get words for the quiz (New or Learning), ensuring they have meanings
  const { words: wordsToQuiz } = specificWords
    ? await getWordsToQuiz({ wordList: specificWords })
    : await getWordsToQuiz({ wordCount });

  if (wordsToQuiz.length === 0) {
    return { success: true, quizId: undefined };
  }

  // 2. Get all user's words to use as a distractor pool
  const allUserWords = await prisma.word.findMany({
    where: { userId: user.id },
    select: { word: true },
    take: 30,
  });
  const distractorPool = allUserWords.map((w) => w.word);

  // Create a quizzes log first
  const quiz = await prisma.quiz.create({
    data: {
      userId: user.id!,
      durationSeconds: 0,
      totalWords: wordsToQuiz.length,
    },
  });

  const questionsToLink: { questionId?: string; newData?: any }[] = [];
  const matchedWords = new Set<string>();

  // 3. Manually generate questions for each word
  for (const word of wordsToQuiz) {
    const mainMeaning = word.meanings[0];
    if (!mainMeaning) continue;

    const randomQuestionType: QuestionType = shuffleArray([
      QuestionType.MultipleChoice_DefinitionToWord,
      QuestionType.FillInTheBlank,
      QuestionType.MultipleChoice_WordToSynonym,
      // QuestionType.Matching, // Matching will be generated separately if enough words
    ])[0];

    const existingQuestion = await prisma.quizQuestion.findFirst({
      where: {
        userId: user.id,
        words: { some: { id: word.id } },
        type: randomQuestionType,
      },
    });

    if (existingQuestion) {
      questionsToLink.push({ questionId: existingQuestion.id });
    } else {
      switch (randomQuestionType) {
        // --- Question Type 1: Give Definition -> Choose Word ---
        case QuestionType.MultipleChoice_DefinitionToWord:
          if (mainMeaning.definition) {
            const filteredPool = distractorPool.filter(
              (w) => w.toLowerCase() !== word.word.toLowerCase(),
            );

            try {
              const prompt = buildDistractorGenerationPrompt(
                word.word,
                filteredPool,
              );

              const object = await generateDistractorsWithAi(prompt);
              if (!object) break;
              let distractors = object.distractors.map((d) => d.trim());
              if (distractors.includes(word.word)) {
                distractors = distractors.filter(
                  (d) => d.toLowerCase() !== word.word.toLowerCase(),
                );
              }

              questionsToLink.push({
                newData: quizQuestionSchema.parse({
                  wordIds: [word.id],
                  direction:
                    "Choose the correct word for the following definition:",
                  question: mainMeaning.definition,
                  type: QuestionType.MultipleChoice_DefinitionToWord,
                  options: [...distractors, word.word], // Combine and shuffle on client
                  answer: word.word,
                }),
              });
            } catch (error) {
              console.error(
                `Failed to generate distractors for ${word.word}:`,
                error,
              );
            }
          }
          break;
        // --- Question Type 2: Give Word -> Choose Synonym/Antonym ---
        case QuestionType.MultipleChoice_WordToSynonym:
          const synonyms = mainMeaning.synonyms
            ?.split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          const antonyms = mainMeaning.antonyms
            ?.split(",")
            .map((a) => a.trim())
            .filter((a) => a.length > 0);

          // Randomly decide to create a synonym or antonym question if both are available
          const canCreateSynonym = synonyms && synonyms.length > 0;
          const canCreateAntonym = antonyms && antonyms.length > 0;
          let questionType: "synonym" | "antonym" | null = null;

          if (canCreateSynonym && canCreateAntonym) {
            questionType = Math.random() > 0.5 ? "synonym" : "antonym";
          } else if (canCreateSynonym) {
            questionType = "synonym";
          } else if (canCreateAntonym) {
            questionType = "antonym";
          } else {
            break;
          }

          if (questionType) {
            const isSynonym = questionType === "synonym";
            const correctAnswers = (
              isSynonym ? synonyms : antonyms
            ) as string[];
            const correctAnswer = correctAnswers[0]; // Pick the first one as the answer
            const directionText = `Which of the following is a${
              isSynonym ? " synonym" : "n antonym"
            } for the word below?`;

            const filteredPool = distractorPool.filter(
              (w) =>
                w.toLowerCase() !== word.word.toLowerCase() &&
                w.toLowerCase() !== correctAnswer.toLowerCase(),
            );

            try {
              const prompt = buildDistractorGenerationPrompt(
                correctAnswer,
                filteredPool,
                word.word,
              );

              const object = await generateDistractorsWithAi(prompt);
              if (!object) break;

              questionsToLink.push({
                newData: quizQuestionSchema.parse({
                  wordIds: [word.id],
                  direction: directionText,
                  question: word.word,
                  type: QuestionType.MultipleChoice_WordToSynonym, // You might want a new QuestionType for antonyms
                  options: [...object.distractors, correctAnswer],
                  answer: correctAnswer,
                }),
              });
            } catch (error) {
              console.error(
                `Failed to generate distractors for ${questionType} of ${word.word}:`,
                error,
              );
            }
          }
          break;
        // --- Question Type 3: Fill in the Blank ---
        case QuestionType.FillInTheBlank:
          // const example = mainMeaning.exampleSentences?.split("|")[0];
          if (
            !mainMeaning.exampleSentences ||
            mainMeaning.exampleSentences.trim().length === 0
          ) {
            break;
          }
          const example = mainMeaning.exampleSentences.split("|")[0];
          if (!example.includes(word.word)) {
            break;
          }
          const questionText = example.replace(
            new RegExp(`\\b${word.word}\\b`, "gi"),
            "_____",
          );

          const wordLength = word.word.length;
          const generatedGapHintArray = Array(wordLength).fill("_");

          if (wordLength > 0) {
            // Always show the first letter
            generatedGapHintArray[0] = word.word[0];

            // Determine how many additional hints to show (e.g., 30% of the word length)
            const additionalHintCount = Math.floor(wordLength * 0.3);
            let hintsAdded = 0;

            // Add random hints, ensuring they are not the first letter and not duplicates
            while (hintsAdded < additionalHintCount) {
              const randomIndex = Math.floor(Math.random() * wordLength);
              if (
                randomIndex !== 0 &&
                generatedGapHintArray[randomIndex] === "_"
              ) {
                generatedGapHintArray[randomIndex] = word.word[randomIndex];
                hintsAdded++;
              }
            }
          }
          const gapHint = generatedGapHintArray.join("");

          if (questionText !== example) {
            // Ensure the word was actually in the sentence
            questionsToLink.push({
              newData: quizQuestionSchema.parse({
                wordIds: [word.id],
                direction: "Fill in the blank with the correct word.",
                question: questionText,
                type: QuestionType.FillInTheBlank,
                answer: word.word,
                gapHint,
              }),
            });
          }

          break;
      }
    }

    // --- Question Type 4: Matching (if enough words) ---
    const availableWords = wordsToQuiz.filter((w) => !matchedWords.has(w.word));
    if (availableWords.length >= 3) {
      const matchingWords = shuffleArray(availableWords).slice(0, 4); // Randomly pick 3 or 4 words
      const leftItems = matchingWords.map((w) => w.word);
      const rightItems = matchingWords.map((w) => w.meanings[0].definition);

      // Check if any of these words are already in a matching question for this user
      const existingMatchingQuestion = await prisma.quizQuestion.findFirst({
        where: {
          userId: user.id,
          type: QuestionType.Matching,
          words: { some: { id: { in: matchingWords.map((w) => w.id) } } },
        },
      });

      if (!existingMatchingQuestion) {
        questionsToLink.push({
          newData: quizQuestionSchema.parse({
            wordIds: matchingWords.map((w) => w.id),
            direction: "Match each word to its corresponding definition.",
            question: "", // No central question content for matching
            type: QuestionType.Matching,
            leftItems,
            rightItems,
            answer: JSON.stringify(
              Object.fromEntries(leftItems.map((k, i) => [k, rightItems[i]])),
            ),
          }),
        });
        // Mark these words as matched to avoid creating duplicate matching questions
      } else {
        questionsToLink.push({ questionId: existingMatchingQuestion.id });
      }
      // Mark these words as matched
      matchingWords.forEach((w) => matchedWords.add(w.word));
    }
  }

  // 4. Save all generated questions to the database
  if (questionsToLink.length > 0) {
    try {
      await prisma.$transaction(
        questionsToLink.map((q) => {
          if (q.questionId) {
            // Link existing question
            return prisma.quizAnswer.create({
              data: {
                quiz: { connect: { id: quiz.id } },
                quizQuestion: { connect: { id: q.questionId } },
              },
            });
          }
          // Create new question AND link it
          const { wordIds, ...questionData } = q.newData;
          return prisma.quizAnswer.create({
            data: {
              quiz: { connect: { id: quiz.id } },
              quizQuestion: {
                create: {
                  ...questionData,
                  userId: user.id!,
                  words: { connect: wordIds.map((id: string) => ({ id })) },
                },
              },
            },
          });
        }),
      );
    } catch (error) {
      await prisma.quiz.delete({ where: { id: quiz.id } });
      console.error("Failed to save quiz questions:", error);
      return { success: false, message: "Could not create quiz session." };
    }
  }

  return { success: true, quizId: quiz.id };
}

export const getWordsToQuiz = async ({
  wordCount,
  wordList,
}: {
  wordCount?: number;
  wordList?: string[];
}): Promise<{ words: WordWithMeanings[]; estimatedTimeInMinutes: number }> => {
  const session = await auth();
  if (!session?.user?.id || !session.user) {
    throw new Error("Authentication required.");
  }
  const user = session.user;

  let words: WordWithMeanings[];

  if (wordList && wordList.length > 0) {
    // Get specific words by name
    words = await prisma.word.findMany({
      where: {
        userId: user.id,
        word: {
          in: wordList,
        },
        meanings: {
          some: { definition: { not: "" } },
        },
      },
      include: {
        meanings: true,
      },
    });
  } else {
    // Get words automatically based on mastery level and review history
    words = await prisma.word.findMany({
      where: {
        userId: user.id,
        masteryLevel: {
          in: [MasteryLevel.New, MasteryLevel.Learning],
        },
        meanings: {
          some: { definition: { not: "" } },
        },
      },
      take: wordCount || 10,
      include: {
        meanings: true,
      },
      orderBy: [
        // Prioritize words that already have review history, then fall back to older words.
        { reviews: { _count: "desc" } },
        { createdAt: "asc" },
      ],
    });
  }

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
    const abandonedQuizzes = await prisma.quiz.findMany({
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

    const { count } = await prisma.quiz.deleteMany({
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

export async function updateQuizAnswer(
  answerId: string,
  userAnswer: string | null,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required.");
  }

  try {
    const quizAnswer = await prisma.quizAnswer.findFirst({
      where: { id: answerId, quiz: { userId: session.user.id } },
      include: { quizQuestion: true },
    });

    if (!quizAnswer || !quizAnswer.quizQuestion) {
      throw new Error("Quiz answer or question not found.");
    }

    let isCorrect = false;
    let isSkipped = false;

    if (userAnswer === null || !quizAnswer.quizQuestion.answer) {
      isSkipped = true;
    } else {
      if (quizAnswer.quizQuestion.type === QuestionType.Matching) {
        try {
          const userObj = JSON.parse(userAnswer);
          const correctObj = JSON.parse(quizAnswer.quizQuestion.answer);
          const correctKeys = Object.keys(correctObj);
          isCorrect =
            correctKeys.length === Object.keys(userObj).length &&
            correctKeys.every((key) => userObj[key] === correctObj[key]);
        } catch (e) {
          isCorrect = false;
        }
      } else {
        isCorrect =
          userAnswer.trim().toLowerCase() ===
          quizAnswer.quizQuestion.answer.trim().toLowerCase();
      }
    }

    const answer = await prisma.quizAnswer.update({
      where: { id: answerId },
      data: {
        userAnswer,
        isCorrect,
        isWrong: isSkipped ? false : !isCorrect,
        isSkipped,
        isUnreached: false,
      },
      include: {
        quizQuestion: { include: { words: true } },
      },
    });

    // --- Mastery Level Update Algorithm ---
    const questionWords = answer?.quizQuestion?.words;
    if (questionWords && questionWords.length > 0) {
      for (const word of questionWords) {
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

    return { isCorrect, correctAnswer: quizAnswer.quizQuestion.answer };
  } catch (error) {
    console.error("Failed to update quiz question:", error);
    // Optionally return a value to indicate failure
  }
}

export async function logQuizResult(
  quizId: string,
  durationSeconds: number,
): Promise<QuizWithAnswers | undefined> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required.");
  }

  try {
    // Fetch the questions from the log to calculate the final score

    const answersInLog = await prisma.quizAnswer.findMany({
      where: {
        quizId: quizId,
        quiz: { userId: session.user.id },
      },
      select: {
        isCorrect: true,
        userAnswer: true,
        isSkipped: true,
        isUnreached: true,
        isWrong: true,
      },
    });

    const totalQuestions = answersInLog.length;
    const correctAnswers = answersInLog.filter((a) => a.isCorrect).length;
    const skippedQuestions = answersInLog.filter((a) => a.isSkipped).length;
    const wrongAnswers = answersInLog.filter((a) => a.isWrong).length;
    const unreachedQuestions = answersInLog.filter((a) => a.isUnreached).length;

    const completedQuestions = totalQuestions - unreachedQuestions;

    // Calculate quiz status based on performance
    let status: QuizStatus;
    // If there are unreached questions, the user quit early
    if (completedQuestions < totalQuestions) {
      status = QuizStatus.InProgress;
    } else {
      if (correctAnswers === totalQuestions) {
        status = QuizStatus.Perfect;
      } else if (correctAnswers / totalQuestions >= 0.8) {
        status = QuizStatus.Excellent;
      } else {
        status = QuizStatus.NeedsReview;
      }
    }
    // Update the main quiz log with the final details
    const updatedLog = await prisma.quiz.update({
      where: { id: quizId, userId: session.user.id },
      data: {
        completedAt: new Date(),
        durationSeconds,
        correctAnswers,
        totalQuestions,
        wrongAnswers,
        skippedQuestions,
        completedQuestions,
        unreachedQuestions,
        status,
      },
      include: {
        quizAnswers: {
          include: { quizQuestion: { include: { words: true } } },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return updatedLog as QuizWithAnswers;
  } catch (error) {
    console.error("Failed to log quiz result:", error);
  }
}

export async function getQuiz(quizId: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId },
    include: {
      quizAnswers: {
        include: { quizQuestion: { include: { words: true } } },
        orderBy: {
          createdAt: "asc", // Keep a consistent order from DB
        },
      },
    },
  });

  // console.log(quiz);

  if (quiz?.quizAnswers) {
    const isCompleted = quiz.status !== QuizStatus.InProgress;

    const shuffled = shuffleArray(quiz.quizAnswers);
    // Move completed questions (answered or skipped) to the start of the array
    const sortedAnswers = [
      ...shuffled.filter((a) => a.userAnswer !== null || a.isSkipped),
      ...shuffled.filter((a) => a.userAnswer === null && !a.isSkipped),
    ];

    quiz.quizAnswers = sortedAnswers.map((ans) => {
      if (!isCompleted) {
        // Strip the answer field if the quiz is not completed
        return {
          ...ans,
          quizQuestion: { ...ans.quizQuestion, answer: null },
        };
      }
      return ans;
    }) as QuizAnswerWithQuestion[];
  }

  return quiz;
}

export const getRecentQuizzes = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const quizzes = await prisma.quiz.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return quizzes;
};

/**
 * Creates a new quiz session using the exact same questions from an existing one.
 */
export async function retryQuizSession(quizId: string) {
  try {
    // 1. Find the original quiz log and its associated questions
    const originalLog = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { quizAnswers: true },
    });

    if (!originalLog) {
      return { success: false, message: "Original quiz session not found." };
    }

    // 2. Create the new session and answers in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create a new InProgress session
      const newLog = await tx.quiz.create({
        data: {
          userId: originalLog.userId,
          totalQuestions: originalLog.totalQuestions,
          totalWords: originalLog.totalWords,
          status: "InProgress",
          durationSeconds: 0,
        },
      });

      // Create new answer placeholders linked to the original questions
      const newAnswersData = originalLog.quizAnswers.map((ans) => ({
        quizId: newLog.id,
        quizQuestionId: ans.quizQuestionId,
      }));

      await tx.quizAnswer.createMany({
        data: newAnswersData,
      });

      return newLog;
    });

    return { success: true, quizId: result.id };
  } catch (error) {
    console.error("Retry quiz error:", error);
    return { success: false, message: "Failed to create retry session." };
  }
}
