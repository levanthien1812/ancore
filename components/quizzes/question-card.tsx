"use client";
import { useState, useEffect } from "react";
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
  const [randomIndex, setRandomIndex] = useState(0);

  useEffect(() => {
    setRandomIndex(Math.floor(Math.random() * CORRECT_ENCOURAGEMENTS.length));
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
  totalQuestions,
  isFinalizing,
}: {
  answerId: string;
  question: QuizQuestionWithWords;
  initialIsCorrect: boolean | null;
  onNext: () => void;
  currentIndex: number;
  totalQuestions: number;
  isFinalizing: boolean;
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(!!question.answer);
  const [localIsCorrect, setLocalIsCorrect] = useState<boolean | null>(
    initialIsCorrect,
  );
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const [correctAnswer, setCorrectAnswer] = useState<typeof question.answer>(
    question.answer,
  );

  const { mutate: updateQuizAnswerMutation, isPending: isUpdatingQuizAnswer } =
    useMutation({
      mutationFn: (data: { userAnswer: string | null }) =>
        updateQuizAnswer(answerId, data.userAnswer),
      onSuccess: (data) => {
        if (data) {
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

  const handleCheckAnswer = () => {
    if (selectedAnswer) {
      updateQuizAnswerMutation({ userAnswer: selectedAnswer });
    } else {
      toast.warning("Please select an answer or finish your answer first.");
    }
  };

  const handleSkip = () => {
    setSelectedAnswer(null);
    setLocalIsCorrect(false);
    setIsAnswered(true);
    updateQuizAnswerMutation({ userAnswer: null });
    onNext();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdatingQuizAnswer) return;
    if (!isAnswered) {
      handleCheckAnswer();
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
          />
        );
      case QuizQuestionType.WordToSynonym:
      case QuizQuestionType.FillInTheBlank:
        return (
          <MultipleChoiceBody
            question={question}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
          />
        );
      case QuizQuestionType.Matching:
        return (
          <MatchingBody
            question={question}
            setSelectedAnswer={setSelectedAnswer}
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
    <Card className="h-full flex flex-col">
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
              selectedAnswer &&
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
            {!isAnswered && (
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
            {isAnswered && (
              <Button type="submit" className="w-full">
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
