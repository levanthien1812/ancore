"use server";
import { prisma } from "@/db/prisma";
import { quizQuestionSchema } from "../validators";
import { buildDistractorGenerationPrompt } from "../ai-prompts/distractor-generation";
import { shuffleArray } from "../utils/shuffle-array";
import { WordWithMeanings } from "@/components/add-word/add-word-form";
import {
  MasteryLevel,
  QuestionType,
  QuizQuestion,
  QuizStatus,
  WordMeaning,
} from "@prisma/client";
import { generateDistractorsWithAi } from "@/app/services/generate-distractors-with-ai";
import { QuizAnswerWithQuestion, QuizWithAnswers } from "../type";
import { authenticationAction } from "./_helpers";
import { revalidatePath } from "next/cache";

export const createQuizSession = async (
  wordCount: number = 5,
  specificWords?: string[],
) =>
  authenticationAction(async (userId) => {
    // 1. Get words for the quiz (New or Learning), ensuring they have meanings
    const quizData = specificWords
      ? await getWordsToQuiz({ wordList: specificWords })
      : await getWordsToQuiz({ wordCount });

    if (!quizData || quizData.words.length === 0) {
      return { success: true, quizId: undefined };
    }
    const { words: wordsToQuiz } = quizData;

    // 2. Get all user's words to use as a distractor pool
    const allUserWords = await prisma.word.findMany({
      where: { userId },
      select: { word: true },
      take: 30,
    });
    const distractorPool = allUserWords.map((w) => w.word);

    // Create a quizzes log first
    const quiz = await prisma.quiz.create({
      data: {
        userId,
        durationSeconds: 0,
        totalWords: wordsToQuiz.length,
      },
    });

    const questionsToLink: { questionId?: string; newData?: any }[] = [];
    const wordsUsedInSingleQuestions = new Set<string>(); // Track words used in single-word questions

    // --- Optimization: Pre-fetch existing questions for all words ---
    const wordIdsToQuiz = wordsToQuiz.map((w) => w.id);
    const existingQuestions = await prisma.quizQuestion.findMany({
      where: {
        userId,
        words: { some: { id: { in: wordIdsToQuiz } } },
      },
      include: { words: true }, // Include words to check if it's a single-word question
    });

    // Map for quick lookup: (wordId, questionType) -> QuizQuestion
    // This is for single-word questions.
    const existingSingleWordQuestionsMap = new Map<
      string,
      Map<QuestionType, QuizQuestion>
    >();
    existingQuestions.forEach((q) => {
      const linkedWordsInQuiz = q.words.filter((w) =>
        wordIdsToQuiz.includes(w.id),
      );
      if (
        linkedWordsInQuiz.length === 1 &&
        (q.type === QuestionType.DefinitionToWord_Typing ||
          q.type === QuestionType.WordToSynonym ||
          q.type === QuestionType.FillInTheBlank)
      ) {
        const wordId = linkedWordsInQuiz[0].id;
        if (!existingSingleWordQuestionsMap.has(wordId)) {
          existingSingleWordQuestionsMap.set(
            wordId,
            new Map<QuestionType, QuizQuestion>(),
          );
        }
        existingSingleWordQuestionsMap.get(wordId)!.set(q.type, q);
      }
    });

    // --- Collect AI prompts to run in parallel ---
    const aiCallPromises: Promise<any>[] = [];
    const aiCallContexts: Array<{
      word: WordWithMeanings;
      questionType: QuestionType;
      mainMeaning: WordMeaning;
      isSynonym?: boolean;
      correctAnswer?: string;
      directionText?: string;
      questionText?: string;
    }> = [];

    // 3. Manually generate questions for each word
    for (const word of wordsToQuiz) {
      // Randomly pick a meaning that has a definition
      const meaningsWithDef = word.meanings.filter(
        (m) => m.definition.trim() !== "",
      );
      const mainMeaning =
        shuffleArray([...meaningsWithDef])[0] || word.meanings[0];
      if (!mainMeaning) continue;

      const allExamples = word.meanings.flatMap((m) => m.examples || []);

      // Determine valid question types for this word based on available data
      const validTypes: QuestionType[] = [];

      // Type 1: Definition
      if (mainMeaning.definition) {
        validTypes.push(QuestionType.DefinitionToWord_Typing);
      }

      // Type 2: Synonym/Antonym
      const synonyms =
        mainMeaning.synonyms
          ?.split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0) || [];
      const antonyms =
        mainMeaning.antonyms
          ?.split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0) || [];

      if (synonyms.length > 0 || antonyms.length > 0) {
        validTypes.push(QuestionType.WordToSynonym);
      }

      // Type 3: Fill in the Blank
      if (
        allExamples.some((ex) =>
          new RegExp(`\\b${word.word}\\b`, "gi").test(ex),
        )
      ) {
        validTypes.push(QuestionType.FillInTheBlank);
      }

      if (validTypes.length === 0) continue;

      // Shuffle the valid types to pick one randomly
      const shuffledValidTypes = shuffleArray([...validTypes]);

      for (const selectedType of shuffledValidTypes) {
        // Check for existing question using the pre-fetched map
        const existingQuestionForType = existingSingleWordQuestionsMap
          .get(word.id)
          ?.get(selectedType);

        if (existingQuestionForType) {
          questionsToLink.push({ questionId: existingQuestionForType.id });
          wordsUsedInSingleQuestions.add(word.word);
          break;
        }

        // If no existing question, try to generate data for the selected type
        if (selectedType === QuestionType.DefinitionToWord_Typing) {
          // NOW TYPING - Add hint logic for definition
          const wordLength = word.word.length;
          const generatedGapHintArray = Array(wordLength).fill("_");

          if (wordLength > 0) {
            generatedGapHintArray[0] = word.word[0];
            const additionalHintCount = Math.floor(wordLength * 0.3);
            let hintsAdded = 0;

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

          questionsToLink.push({
            newData: quizQuestionSchema.parse({
              wordIds: [word.id],
              direction: "Type the word that matches the definition below:",
              question: mainMeaning.definition,
              type: selectedType,
              answer: word.word,
              options: [], // Typing questions have no options
              gapHint,
            }),
          });
          wordsUsedInSingleQuestions.add(word.word);
          break;
        }

        if (selectedType === QuestionType.WordToSynonym) {
          // Randomly decide to create a synonym or antonym question if both are available
          const canCreateSynonym = synonyms.length > 0;
          const canCreateAntonym = antonyms.length > 0;
          let subQuestionType: "synonym" | "antonym" | null = null;

          if (canCreateSynonym && canCreateAntonym) {
            subQuestionType = Math.random() > 0.5 ? "synonym" : "antonym";
          } else if (canCreateSynonym) {
            subQuestionType = "synonym";
          } else if (canCreateAntonym) {
            subQuestionType = "antonym";
          }

          if (subQuestionType) {
            const isSynonym = subQuestionType === "synonym";
            const correctAnswers = isSynonym ? synonyms : antonyms;
            const correctAnswer = correctAnswers[0]; // Pick the first one as the answer
            const directionText = `Which of the following is a${
              isSynonym ? " synonym" : "n antonym"
            } for the word below?`;

            const filteredPool = distractorPool.filter(
              (w) =>
                w.toLowerCase() !== word.word.toLowerCase() &&
                w.toLowerCase() !== correctAnswer.toLowerCase(),
            );

            const prompt = buildDistractorGenerationPrompt(
              correctAnswer,
              filteredPool,
              word.word,
            );
            aiCallPromises.push(generateDistractorsWithAi(prompt));
            aiCallContexts.push({
              word,
              questionType: selectedType,
              mainMeaning,
              isSynonym,
              correctAnswer,
              directionText,
            });
            wordsUsedInSingleQuestions.add(word.word);
            break;
          }
        }

        if (selectedType === QuestionType.FillInTheBlank) {
          // NOW MULTIPLE CHOICE
          const validExamples = allExamples.filter((ex) =>
            new RegExp(`\\b${word.word}\\b`, "gi").test(ex),
          );
          if (validExamples.length === 0) continue;

          const example = shuffleArray([...validExamples])[0];
          const questionText = example.replace(
            new RegExp(`\\b${word.word}\\b`, "gi"),
            "_____",
          );

          const filteredPool = distractorPool.filter(
            (w) => w.toLowerCase() !== word.word.toLowerCase(),
          );

          const prompt = buildDistractorGenerationPrompt(
            word.word,
            filteredPool,
          );
          aiCallPromises.push(generateDistractorsWithAi(prompt));
          aiCallContexts.push({
            word,
            questionType: selectedType,
            mainMeaning,
            directionText: "Choose the correct word to fill in the blank:",
            questionText,
          });
          wordsUsedInSingleQuestions.add(word.word);
          break;
        }
      }
    }

    // --- Execute all AI calls in parallel ---
    const aiResponses = await Promise.all(aiCallPromises);

    // --- Process AI responses and add to questionsToLink ---
    aiResponses.forEach((object, idx) => {
      const context = aiCallContexts[idx];
      if (!object) return;

      if (context.questionType === QuestionType.DefinitionToWord_Typing) {
        // Definitions are now generated statically (typing)
      } else if (context.questionType === QuestionType.FillInTheBlank) {
        let distractors = object.distractors.map((d: string) => d.trim());
        if (distractors.includes(context.word.word)) {
          distractors = distractors.filter(
            (d: string) => d.toLowerCase() !== context.word.word.toLowerCase(),
          );
        }
        questionsToLink.push({
          newData: quizQuestionSchema.parse({
            wordIds: [context.word.id],
            direction: context.directionText,
            question: context.questionText,
            type: QuestionType.FillInTheBlank,
            options: shuffleArray([...distractors, context.word.word]),
            answer: context.word.word,
          }),
        });
      } else if (context.questionType === QuestionType.WordToSynonym) {
        questionsToLink.push({
          newData: quizQuestionSchema.parse({
            wordIds: [context.word.id],
            direction: context.directionText,
            question: context.word.word,
            type: QuestionType.WordToSynonym,
            options: [...object.distractors, context.correctAnswer],
            answer: context.correctAnswer,
          }),
        });
      }
    });

    // --- Question Type 4: Matching (if enough words) ---
    // Consider all words with definitions for matching questions
    const wordsWithDefinitionsForMatching = wordsToQuiz.filter(
      (w) => w.meanings.length > 0 && w.meanings[0].definition.trim() !== "",
    );

    if (wordsWithDefinitionsForMatching.length >= 3) {
      const matchingWords = shuffleArray(wordsWithDefinitionsForMatching).slice(
        0,
        Math.min(wordsWithDefinitionsForMatching.length, 4),
      ); // Randomly pick up to 4 words
      const leftItems = matchingWords.map((w) => w.word);
      const rightItems = matchingWords.map((w) => {
        const randomMeaning =
          w.meanings[Math.floor(Math.random() * w.meanings.length)];
        return randomMeaning.definition;
      });

      // Check if a matching question already exists for this set of words.
      // This is still a single DB query, which is fine outside the main loop.
      const existingMatchingQuestion = await prisma.quizQuestion.findFirst({
        where: {
          userId,
          type: QuestionType.Matching,
          words: { every: { id: { in: matchingWords.map((w) => w.id) } } }, // Check if ALL words are in the question
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
      } else {
        questionsToLink.push({ questionId: existingMatchingQuestion.id });
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
                    userId,
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
  });

export const getWordsToQuiz = async ({
  wordCount,
  wordList,
}: {
  wordCount?: number;
  wordList?: string[];
}) =>
  authenticationAction(async (userId) => {
    let words: WordWithMeanings[];

    if (wordList && wordList.length > 0) {
      // Get specific words by name
      words = await prisma.word.findMany({
        where: {
          userId,
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
          userId,
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
      const meaningsWithDef = word.meanings.filter(
        (m) => m.definition.trim() !== "",
      );
      const mainMeaning =
        shuffleArray([...meaningsWithDef])[0] || word.meanings[0];
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
      const allExamples = word.meanings.flatMap((m) => m.examples || []);
      const example = allExamples.find((ex) =>
        new RegExp(`\\b${word.word}\\b`, "gi").test(ex),
      );
      if (example) questionCount++;
    }

    // Matching question
    if (words.length >= 3) {
      questionCount++;
    }

    const totalTimeInSeconds = questionCount * timePerQuestionInSeconds;
    const estimatedTimeInMinutes = Math.ceil(totalTimeInSeconds / 60);

    return { words, estimatedTimeInMinutes };
  });

/**
 * Deletes old, incomplete quiz sessions.
 * This is intended to be called by a scheduled cron job.
 */
export const cleanupAbandonedQuizzes = async () =>
  authenticationAction(async () => {
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

      return {
        success: true,
        message: `Cleaned up ${count} abandoned quizzes.`,
      };
    } catch (error) {
      console.error("Error cleaning up abandoned quizzes:", error);
      return {
        success: false,
        message: "Failed to clean up abandoned quizzes.",
      };
    }
  });

export const updateQuizAnswer = async (
  answerId: string,
  userAnswer: string | null,
) =>
  authenticationAction(async (userId) => {
    try {
      const quizAnswer = await prisma.quizAnswer.findFirst({
        where: { id: answerId, quiz: { userId } },
        include: {
          quizQuestion: {
            include: { words: { include: { meanings: true } } },
          },
        },
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
          quizQuestion: { include: { words: { include: { meanings: true } } } },
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
      console.log(quizAnswer);
      return { isCorrect, correctAnswer: quizAnswer.quizQuestion.answer };
    } catch (error) {
      console.error("Failed to update quiz question:", error);
      // Optionally return a value to indicate failure
    }
  });

export const logQuizResult = async (quizId: string, durationSeconds: number) =>
  authenticationAction(async (userId) => {
    try {
      // Fetch the questions from the log to calculate the final score

      const answersInSession = await prisma.quizAnswer.findMany({
        where: {
          quizId: quizId,
          quiz: { userId },
        },
        select: {
          isCorrect: true,
          userAnswer: true,
          isSkipped: true,
          isUnreached: true,
          isWrong: true,
        },
      });

      const totalQuestions = answersInSession.length;
      const correctAnswers = answersInSession.filter((a) => a.isCorrect).length;
      const skippedQuestions = answersInSession.filter(
        (a) => a.isSkipped,
      ).length;
      const wrongAnswers = answersInSession.filter((a) => a.isWrong).length;
      const unreachedQuestions = answersInSession.filter(
        (a) => a.isUnreached,
      ).length;

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
      const updatedSession = await prisma.quiz.update({
        where: { id: quizId, userId },
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
            include: {
              quizQuestion: {
                include: { words: { include: { meanings: true } } },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      return updatedSession as QuizWithAnswers;
    } catch (error) {
      console.error("Failed to log quiz result:", error);
    }
  });

export const getQuiz = async (quizId: string) =>
  authenticationAction(async (userId) => {
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId },
      include: {
        quizAnswers: {
          include: {
            quizQuestion: {
              include: { words: { include: { meanings: true } } },
            },
          },
          orderBy: {
            createdAt: "asc", // Keep a consistent order from DB
          },
        },
      },
    });

    if (quiz?.quizAnswers) {
      const isCompleted = quiz.status !== QuizStatus.InProgress;

      const shuffled = shuffleArray(quiz.quizAnswers);
      // Move completed questions (answered or skipped) to the start of the array
      const sortedAnswers = [
        ...shuffled.filter((a) => !a.isUnreached),
        ...shuffled.filter((a) => a.isUnreached),
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
  });

export const getRecentQuizzes = async () =>
  authenticationAction(async (userId) => {
    const quizzes = await prisma.quiz.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return quizzes;
  }, []);

/**
 * Creates a new quiz session using the exact same questions from an existing one.
 */
export const retryQuizSession = async (quizId: string) =>
  authenticationAction(async (userId) => {
    try {
      // 1. Find the original quiz log and its associated questions
      const originalSession = await prisma.quiz.findUnique({
        where: { id: quizId, userId },
        include: { quizAnswers: true },
      });

      if (!originalSession) {
        return { success: false, message: "Original quiz session not found." };
      }

      // 2. Create the new session and answers in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create a new InProgress session
        const newSession = await tx.quiz.create({
          data: {
            userId,
            totalQuestions: originalSession.totalQuestions,
            totalWords: originalSession.totalWords,
            status: "InProgress",
            durationSeconds: 0,
          },
        });

        // Create new answer placeholders linked to the original questions
        const newAnswersData = originalSession.quizAnswers.map((ans) => ({
          quizId: newSession.id,
          quizQuestionId: ans.quizQuestionId,
        }));

        await tx.quizAnswer.createMany({
          data: newAnswersData,
        });

        return newSession;
      });

      return { success: true, quizId: result.id };
    } catch (error) {
      console.error("Retry quiz error:", error);
      return { success: false, message: "Failed to create retry session." };
    }
  });

export const getLatestIncompleteQuiz = async () =>
  authenticationAction(async (userId) => {
    const quiz = await prisma.quiz.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        quizAnswers: {
          select: {
            userAnswer: true,
          },
        },
      },
    });

    if (!quiz || quiz.completedAt !== null) return null;

    const answeredCount = quiz.quizAnswers.filter(
      (a) => a.userAnswer !== null,
    ).length;

    return {
      id: quiz.id,
      answeredCount,
      totalQuestions: quiz.totalQuestions,
      createdAt: quiz.createdAt,
    };
  });

export const deleteQuiz = async (quizId: string) =>
  authenticationAction(async (userId) => {
    console.log(quizId);
    await prisma.$transaction([
      prisma.quizAnswer.deleteMany({ where: { quizId } }),
      prisma.quiz.delete({ where: { id: quizId, userId } }),
    ]);

    revalidatePath("/quizzes");

    return { success: true };
  });
