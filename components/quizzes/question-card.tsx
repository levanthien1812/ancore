"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizQuestionType } from "@/lib/constants/enums";
import MultipleChoiceBody from "@/components/quizzes/multiple-choice-body";
import FillInTheBlankBody from "@/components/quizzes/fill-in-the-blank-body";
import MatchingBody from "@/components/quizzes/matching-body";
import { Separator } from "../ui/separator";
import { QuizQuestionWithWords } from "@/lib/type";
import { CheckCircle, CircleX } from "lucide-react";
import {
  CORRECT_ENCOURAGEMENTS,
  INCORRECT_ENCOURAGEMENTS,
} from "@/lib/constants/constant";
import { toast } from "sonner";

const AnswerWrapper = ({
  isCorrect,
  description,
  correctAnswer,
}: {
  isCorrect: boolean;
  description?: string;
  correctAnswer?: React.ReactNode;
}) => {
  const [randomIndex] = useState(() =>
    Math.floor(Math.random() * CORRECT_ENCOURAGEMENTS.length),
  );

  const randomEncouragement = isCorrect
    ? CORRECT_ENCOURAGEMENTS[randomIndex]
    : INCORRECT_ENCOURAGEMENTS[randomIndex];

  return (
    <div
      className={cn(
        "p-3 sm:p-4 rounded-md",
        isCorrect && "border-green-300 bg-green-100",
        !isCorrect && "border-red-300 bg-red-100",
      )}
    >
      <div className="flex justify-center items-center gap-2">
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
  question,
  onAnswer,
  isCorrect,
  onNext,
  currentIndex,
  totalQuestions,
  isSubmitting,
}: {
  question: QuizQuestionWithWords;
  onAnswer: (userAnswer: string | null) => void;
  isCorrect: boolean | null;
  onNext: () => void;
  currentIndex: number;
  totalQuestions: number;
  isSubmitting: boolean;
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleCheckAnswer = () => {
    if (selectedAnswer) {
      setIsAnswered(true);
      onAnswer(selectedAnswer);
    } else {
      toast.warning("Please select an answer or finish your answer first.");
    }
  };

  const handleSkip = () => {
    setSelectedAnswer(null);
    setIsAnswered(true);
    onAnswer(null);
    onNext();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!isAnswered) {
      handleCheckAnswer();
    } else {
      onNext();
    }
  };

  const renderQuestionBody = () => {
    switch (question.type) {
      case QuizQuestionType.MultipleChoice_DefinitionToWord:
      case QuizQuestionType.MultipleChoice_WordToSynonym:
        return (
          <MultipleChoiceBody
            question={question}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
          />
        );
      case QuizQuestionType.FillInTheBlank:
        return (
          <FillInTheBlankBody
            question={question}
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

  const correctAnswer = () => {
    if (isCorrect) {
      return <AnswerWrapper isCorrect={true} />;
    }

    switch (question.type) {
      case QuizQuestionType.MultipleChoice_DefinitionToWord:
      case QuizQuestionType.MultipleChoice_WordToSynonym:
      case QuizQuestionType.FillInTheBlank:
        return (
          <AnswerWrapper
            isCorrect={false}
            correctAnswer={<div>{question.answer}</div>}
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
            {renderQuestionBody()}
          </div>
          <div className="mt-4 space-y-2">
            {isAnswered &&
              !isSubmitting &&
              isCorrect !== null &&
              correctAnswer()}
            {!isAnswered && (
              <Button
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
                disabled={!selectedAnswer}
                className="w-full"
              >
                Check Answer
              </Button>
            )}
            {isAnswered && (
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                {!isLastQuestion
                  ? isSubmitting
                    ? "Checking answer..."
                    : "Next"
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
