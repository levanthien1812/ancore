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
import { updateQuizAnswer } from "@/lib/actions/quiz.actions";
import { useMutation } from "@tanstack/react-query";
import { QuizResultMode } from "@prisma/client";
import { useLayout } from "../layout/layout-context";
import QuestionResult from "./question-result";

const QuestionCard = ({
  answerId,
  question,
  initialIsCorrect,
  onNext,
  currentIndex,
  isActive,
  totalQuestions,
  isFinalizing,
}: {
  answerId: string;
  question: QuizQuestionWithWords;
  initialIsCorrect: boolean | null;
  onNext: () => void;
  currentIndex: number;
  isActive: boolean;
  totalQuestions: number;
  isFinalizing: boolean;
}) => {
  const { settings } = useLayout();
  const timeLimit = settings?.timeLimitPerQuestion || 0;
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(!!question.answer);
  const [localIsCorrect, setLocalIsCorrect] = useState<boolean | null>(
    initialIsCorrect,
  );
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const [correctAnswer, setCorrectAnswer] = useState<typeof question.answer>(
    question.answer,
  );
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { mutate: updateQuizAnswerMutation, isPending: isUpdatingQuizAnswer } =
    useMutation({
      mutationFn: (data: { userAnswer: string | null }) =>
        updateQuizAnswer(answerId, data.userAnswer),
      mutationKey: ["updateQuizAnswer", answerId],
      onSuccess: (data) => {
        if (
          data &&
          settings?.showResultsMode === QuizResultMode.AfterEachQuestion
        ) {
          const audio = new Audio(
            data.isCorrect
              ? "/sounds/correct-answer-sound.mp3"
              : "/sounds/wrong-answer-sound.mp3",
          );
          audio.play().catch((err) => console.error("Audio play failed:", err));
          setLocalIsCorrect(data.isCorrect);
          setCorrectAnswer(data.correctAnswer);
          setIsAnswered(true);
        }
      },
    });

  const handleCheckAnswer = useCallback((isTimeout: boolean = false) => {
    if (isTimeout) {
      updateQuizAnswerMutation({ userAnswer: selectedAnswer || null });
    } else {
      if (selectedAnswer) {
        updateQuizAnswerMutation({ userAnswer: selectedAnswer });
      } else {
        toast.warning("Please select an answer or finish your answer first.");
      }
    }
  }, [selectedAnswer, updateQuizAnswerMutation]);

  const handleSkip = useCallback(() => {
    setSelectedAnswer(null);
    setLocalIsCorrect(false);
    setIsAnswered(true);
    updateQuizAnswerMutation({ userAnswer: null });
    if (settings?.showResultsMode !== QuizResultMode.AfterEachQuestion) {
      onNext();
    }
  }, [onNext, updateQuizAnswerMutation, settings?.showResultsMode]);

  useEffect(() => {
    // If the card is not active, ensure timer is stopped and reset
    if (!isActive) {
      return;
    }

    if (timeLimit > 0 && !isAnswered && !isUpdatingQuizAnswer) {
      setTimeLeft(timeLimit);
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 0.1));
      }, 100);

      return () => clearInterval(timerIntervalRef.current ?? undefined);
    }
  }, [isActive, isAnswered, isUpdatingQuizAnswer, timeLimit]);

  useEffect(() => {
    if (isActive && !isAnswered && timeLimit > 0 && timeLeft <= 0) {
      handleCheckAnswer(true);
    }
  }, [isActive, isAnswered, timeLimit, timeLeft, handleSkip]);

  const progressWidth = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdatingQuizAnswer) return;
    if (!isAnswered) {
      handleCheckAnswer();
      if (settings?.showResultsMode === QuizResultMode.AtTheEnd) {
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
            correctAnswer={correctAnswer}
          />
        );
      case QuizQuestionType.WordToSynonym:
      case QuizQuestionType.FillInTheBlank:
        return (
          <MultipleChoiceBody
            question={question}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            correctAnswer={correctAnswer}
          />
        );
      case QuizQuestionType.Matching:
        return (
          <MatchingBody
            question={question}
            setSelectedAnswer={setSelectedAnswer}
            correctAnswer={correctAnswer}
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
              {question.question}
            </CardTitle>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center custom-scrollbar-y">
          <div className="flex-1 flex flex-col justify-center">
            {questionBody()}
          </div>
          <div className="mt-4 space-y-2">
            {isAnswered &&
              !isUpdatingQuizAnswer &&
              settings?.showResultsMode ===
              QuizResultMode.AfterEachQuestion && (
                <QuestionResult
                  question={question}
                  localIsCorrect={localIsCorrect}
                  correctAnswer={correctAnswer}
                />
              )}
            {!isAnswered && (
              <Button
                disabled={isUpdatingQuizAnswer}
                type="button"
                variant={"outline"}
                onClick={handleSkip}
                className="w-full"
              >
                Skip
              </Button>
            )}
            {!isAnswered &&
              settings?.showResultsMode ===
              QuizResultMode.AfterEachQuestion && (
                <Button
                  type="submit"
                  disabled={
                    !selectedAnswer || isUpdatingQuizAnswer || isFinalizing
                  }
                  className="w-full"
                  isLoading={isUpdatingQuizAnswer || isFinalizing}
                >
                  {isUpdatingQuizAnswer ? "Checking..." : "Check Answer"}
                </Button>
              )}
            {(isAnswered ||
              settings?.showResultsMode === QuizResultMode.AtTheEnd) && (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    selectedAnswer?.length === 0 ||
                    isUpdatingQuizAnswer ||
                    isFinalizing
                  }
                  isLoading={isUpdatingQuizAnswer || isFinalizing}
                >
                  {!isLastQuestion ? "Next" : "Finish Quiz"}
                </Button>
              )}
          </div>
        </CardContent>
      </form>
    </Card>
  );
};

export default QuestionCard;
