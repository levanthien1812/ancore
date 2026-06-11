"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizQuestionType } from "@/lib/constants/enums";
import MultipleChoiceBody from "@/components/quizzes/multiple-choice-body";
import FillInTheBlankBody from "@/components/quizzes/fill-in-the-blank-body";
import MatchingBody from "@/components/quizzes/matching-body";
import { Separator } from "../ui/separator";
import { QuizQuestionWithWords } from "@/lib/type";
import { CheckCircle, CircleX, Info } from "lucide-react";
import {
  CORRECT_ENCOURAGEMENTS,
  INCORRECT_ENCOURAGEMENTS,
} from "@/lib/constants/constant";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import WordDetail from "../word-card/word-detail";
import { updateQuizAnswer } from "@/lib/actions/quiz.actions";
import { useMutation } from "@tanstack/react-query";
import { QuizResultMode } from "@prisma/client";
import { useLayout } from "../layout/layout-context";

const AnswerWrapper = ({
  isCorrect,
  description,
  correctAnswer,
  words,
}: {
  isCorrect: boolean;
  description?: string;
  correctAnswer?: React.ReactNode;
  words: QuizQuestionWithWords["words"];
}) => {
  const randomIndex = useMemo(() => {
    return Math.floor(Math.random() * CORRECT_ENCOURAGEMENTS.length);
  }, []);

  const randomEncouragement = isCorrect
    ? CORRECT_ENCOURAGEMENTS[randomIndex]
    : INCORRECT_ENCOURAGEMENTS[randomIndex];

  const [selectedWordId, setSelectedWordId] = useState<string | null>(
    words[0].id,
  );

  const selectedWord = words.find((w) => w.id === selectedWordId);

  return (
    <div
      className={cn(
        "p-3 sm:p-4 rounded-md",
        isCorrect && "border-green-300 bg-green-100",
        !isCorrect && "border-red-300 bg-red-100",
      )}
    >
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle className="text-green-600" width={32} height={32} />
          ) : (
            <CircleX className="text-red-600" width={32} height={32} />
          )}
          <div>
            <p className={isCorrect ? "text-green-600" : "text-red-600"}>
              {isCorrect ? "Correct" : "Incorrect"}
            </p>
            <p className="text-sm text-muted-foreground">
              {description || randomEncouragement}
            </p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={"ghost"} size={"sm"} type="button">
              <Info className="text-muted-foreground" width={20} height={20} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0 bg-primary">
            <DialogHeader className="text-white">
              <DialogTitle>Word Details</DialogTitle>
            </DialogHeader>

            {words.length > 1 && (
              <div className="flex gap-1">
                {words.map((word) => (
                  <Badge
                    key={word.id}
                    variant={
                      selectedWordId === word.id ? "secondary" : "default"
                    }
                    className="cursor-pointer hover:underline"
                    onClick={() => setSelectedWordId(word.id)}
                  >
                    {word.word}
                  </Badge>
                ))}
              </div>
            )}

            {selectedWord ? (
              <WordDetail word={selectedWord} showReviewStats={false} />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Select a word to view details.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {correctAnswer && (
        <div className="bg-white/50 p-3 sm:p-4 rounded-md mt-2">
          <p className="mb-1 text-green-600">Correct answer:</p>
          {correctAnswer}
        </div>
      )}
    </div>
  );
};

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

  const handleCheckAnswer = useCallback(() => {
    if (selectedAnswer) {
      updateQuizAnswerMutation({ userAnswer: selectedAnswer });
    } else {
      toast.warning("Please select an answer or finish your answer first.");
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
      handleSkip();
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

  const questionResult = () => {
    if (localIsCorrect) {
      return <AnswerWrapper isCorrect={true} words={question.words} />;
    }

    switch (question.type) {
      case QuizQuestionType.DefinitionToWord_Typing:
      case QuizQuestionType.WordToSynonym:
      case QuizQuestionType.FillInTheBlank:
        return (
          <AnswerWrapper
            isCorrect={false}
            words={question.words}
            correctAnswer={<div>{correctAnswer}</div>}
          />
        );
      case QuizQuestionType.Matching:
        if (!question.answer) return null;
        const correctAnswerMap = JSON.parse(question.answer) as Record<
          string,
          string
        >;
        const correctMatches = Object.entries(correctAnswerMap).map(
          ([leftId, rightId], index) => {
            return (
              <div key={leftId} className="grid grid-cols-3 gap-x-4">
                <div className="space-y-3 col-span-1 text-green-600">
                  {leftId}
                </div>
                <div className="space-y-3 col-span-2">{rightId}</div>
                {index !== Object.entries(correctAnswerMap).length - 1 && (
                  <Separator decorative className="col-span-3 my-2" />
                )}
              </div>
            );
          },
        );

        return (
          <AnswerWrapper
            isCorrect={false}
            description={"Some matches are not correct."}
            words={question.words}
            correctAnswer={
              <div className="border border-green-600 rounded-md p-3 sm:p-4">
                {correctMatches}
              </div>
            }
          />
        );
      default:
        return null;
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
              settings?.showResultsMode === QuizResultMode.AfterEachQuestion &&
              questionResult()}
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
                disabled={selectedAnswer?.length === 0}
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
