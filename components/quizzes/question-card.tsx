"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizQuestionType } from "@/lib/constants/enums";
import MultipleChoiceBody from "@/components/quizzes/multiple-choice-body";
import FillInTheBlankBody from "@/components/quizzes/fill-in-the-blank-body";
import MatchingBody from "@/components/quizzes/matching-body";
import { QuizQuestionWithWords } from "@/lib/type";
import { toast } from "sonner";
import {
  updateQuizAnswer,
  updateQuizAnswerRetry,
} from "@/lib/actions/quiz.actions";
import { useMutation } from "@tanstack/react-query";
import { QuizResultMode } from "@prisma/client";
import QuestionResult from "./question-result";
import { normalizeText } from "@/lib/utils/normalize-text";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

const QuestionCard = ({
  answerId,
  question,
  initialIsCorrect,
  onNext,
  currentIndex,
  isActive,
  totalQuestions,
  isFinalizing,
  isRetryMode = false,
}: {
  answerId: string;
  question: QuizQuestionWithWords;
  initialIsCorrect: boolean | null;
  onNext: () => void;
  currentIndex: number;
  isActive: boolean;
  totalQuestions: number;
  isFinalizing: boolean;
  isRetryMode?: boolean;
}) => {
  const { data: user } = useCurrentUser();
  // In retry mode, no time limit applies
  const timeLimit = isRetryMode ? 0 : user?.settings?.timeLimitPerQuestion || 0;
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [localIsCorrect, setLocalIsCorrect] = useState<boolean | null>(
    initialIsCorrect,
  );
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCorrectRef = useRef<HTMLAudioElement | null>(null);
  const audioWrongRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioCorrectRef.current = new Audio("/sounds/correct-answer-sound.mp3");
    audioWrongRef.current = new Audio("/sounds/wrong-answer-sound.mp3");
    audioCorrectRef.current.preload = "auto";
    audioWrongRef.current.preload = "auto";
  }, []);

  const computeIsCorrect = useCallback(
    (answer: string | null): boolean => {
      if (!answer || !question.answer) return false;
      if (question.type === "Matching") {
        try {
          const userObj = JSON.parse(answer);
          const correctObj = JSON.parse(question.answer);
          const correctKeys = Object.keys(correctObj);
          return (
            correctKeys.length === Object.keys(userObj).length &&
            correctKeys.every((key) => userObj[key] === correctObj[key])
          );
        } catch {
          return false;
        }
      }
      return (
        answer.trim().toLowerCase() === question.answer.trim().toLowerCase()
      );
    },
    [question.answer, question.type],
  );

  const { mutate: updateQuizAnswerMutation } = useMutation({
    mutationFn: async (data: {
      userAnswer: string | null;
      isCorrect: boolean;
    }) => {
      if (isRetryMode) {
        await updateQuizAnswerRetry(answerId, data.userAnswer, data.isCorrect);
      } else {
        await updateQuizAnswer(answerId, data.userAnswer, data.isCorrect);
      }
    },
    mutationKey: isRetryMode
      ? ["updateQuizAnswerRetry", answerId]
      : ["updateQuizAnswer", answerId],
  });

  const handleCheckAnswer = useCallback(
    (isTimeout: boolean = false) => {
      const answer = isTimeout ? selectedAnswer || null : selectedAnswer;
      if (!isTimeout && !selectedAnswer) {
        toast.warning("Please select an answer or finish your answer first.");
        return;
      }

      const isCorrect = computeIsCorrect(answer);

      // Update UI immediately — no need to wait for the server
      if (
        isRetryMode ||
        user?.settings?.showResultsMode === QuizResultMode.AfterEachQuestion
      ) {
        if (isCorrect) {
          audioCorrectRef.current!.currentTime = 0;
          audioCorrectRef
            .current!.play()
            .catch((err) => console.error("Audio play failed:", err));
        } else {
          audioWrongRef.current!.currentTime = 0;
          audioWrongRef
            .current!.play()
            .catch((err) => console.error("Audio play failed:", err));
        }
        setLocalIsCorrect(isCorrect);
        setIsAnswered(true);
      }

      // Fire-and-forget: persist to DB in the background
      updateQuizAnswerMutation({ userAnswer: answer, isCorrect });
    },
    [
      selectedAnswer,
      computeIsCorrect,
      isRetryMode,
      user?.settings?.showResultsMode,
      updateQuizAnswerMutation,
    ],
  );

  const handleSkip = useCallback(() => {
    setSelectedAnswer(null);
    if (isRetryMode) {
      // In retry mode, skip goes directly to next without showing result
      updateQuizAnswerMutation({ userAnswer: null, isCorrect: false });
      onNext();
    } else {
      updateQuizAnswerMutation({ userAnswer: null, isCorrect: false });
      if (
        user?.settings?.showResultsMode !== QuizResultMode.AfterEachQuestion
      ) {
        onNext();
      }
    }
  }, [
    isRetryMode,
    onNext,
    updateQuizAnswerMutation,
    user?.settings?.showResultsMode,
  ]);

  useEffect(() => {
    // If the card is not active, ensure timer is stopped and reset
    if (!isActive) {
      return;
    }

    if (timeLimit > 0 && !isAnswered) {
      setTimeLeft(timeLimit);
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 0.1));
      }, 100);

      return () => clearInterval(timerIntervalRef.current ?? undefined);
    }
  }, [isActive, isAnswered, timeLimit]);

  useEffect(() => {
    if (isActive && !isAnswered && timeLimit > 0 && timeLeft <= 0) {
      handleCheckAnswer(true);
    }
  }, [isActive, isAnswered, timeLimit, timeLeft, handleCheckAnswer]);

  const progressWidth = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAnswered) {
      handleCheckAnswer();
      // In retry mode, always show the result (like AfterEachQuestion);
      // in AtTheEnd mode without retry, move immediately
      if (
        !isRetryMode &&
        user?.settings?.showResultsMode === QuizResultMode.AtTheEnd
      ) {
        onNext();
      }
    } else {
      onNext();
    }
  };

  const questionBody = () => {
    switch (question.type) {
      case QuizQuestionType.DefinitionToWord_Typing:
        return (
          <FillInTheBlankBody
            question={question}
            setSelectedAnswer={setSelectedAnswer}
            correctAnswer={question.answer}
            isAnswered={isAnswered}
          />
        );
      case QuizQuestionType.WordToSynonym:
      case QuizQuestionType.FillInTheBlank:
        return (
          <MultipleChoiceBody
            question={question}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            correctAnswer={question.answer}
            isAnswered={isAnswered}
          />
        );
      case QuizQuestionType.Matching:
        return (
          <MatchingBody
            question={question}
            setSelectedAnswer={setSelectedAnswer}
            correctAnswer={question.answer}
            isAnswered={isAnswered}
          />
        );
      default:
        return <p>Unsupported question type.</p>;
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden relative">
      {timeLimit > 0 && !isAnswered && (
        <div className="absolute top-0 left-0 h-1 w-full bg-muted z-20">
          <div
            className="h-full bg-primary-2 transition-all duration-100 ease-linear"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      )}
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        <CardHeader>
          {/* Display the direction */}
          <p className="text-xs py-1 px-2 rounded-full bg-primary text-white w-fit">
            Question {currentIndex + 1}/{totalQuestions}
          </p>
          <p className="text-muted-foreground">{question.direction}</p>
          {/* Display the main question content, if it exists */}
          {question.question && (
            <CardTitle className="text-lg leading-snug pt-2 text-primary">
              {normalizeText(question.question)}
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-y-auto custom-scrollbar-y">
          <div className="flex-1 flex flex-col">
            <div className="my-auto">{questionBody()}</div>
          </div>
          <div className="mt-4 space-y-2 shrink-0">
            {isAnswered &&
              (isRetryMode ||
                user?.settings?.showResultsMode ===
                  QuizResultMode.AfterEachQuestion) && (
                <QuestionResult
                  question={question}
                  localIsCorrect={localIsCorrect}
                  correctAnswer={question.answer}
                />
              )}
            {!isAnswered && (
              <Button
                type="button"
                variant={"outline"}
                onClick={handleSkip}
                className="w-full"
                size={"lg"}
              >
                Skip
              </Button>
            )}
            {!isAnswered &&
              (isRetryMode ||
                user?.settings?.showResultsMode ===
                  QuizResultMode.AfterEachQuestion) && (
                <Button
                  type="submit"
                  disabled={!selectedAnswer || isFinalizing}
                  className="w-full"
                  size={"lg"}
                  isLoading={isFinalizing}
                >
                  Check Answer
                </Button>
              )}
            {(isAnswered ||
              (!isRetryMode &&
                user?.settings?.showResultsMode ===
                  QuizResultMode.AtTheEnd)) && (
              <Button
                type="submit"
                className="w-full"
                size={"lg"}
                disabled={selectedAnswer?.length === 0 || isFinalizing}
                isLoading={isFinalizing}
              >
                {!isLastQuestion
                  ? isRetryMode
                    ? "Next Retry"
                    : "Next"
                  : isRetryMode
                    ? "Finish Retry"
                    : "Finish Quiz"}
              </Button>
            )}
          </div>
        </CardContent>
      </form>
    </Card>
  );
};

export default QuestionCard;
