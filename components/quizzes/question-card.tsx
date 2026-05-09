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
    }
  };

  const handleSkip = () => {
    setSelectedAnswer(null);
    setIsAnswered(true);
    onAnswer(null);
    onNext();
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
    switch (question.type) {
      case QuizQuestionType.MultipleChoice_DefinitionToWord:
      case QuizQuestionType.MultipleChoice_WordToSynonym:
      case QuizQuestionType.FillInTheBlank:
        return <p className="text-center">{question.answer}</p>;
      case QuizQuestionType.Matching:
        if (!question.answer) return null;
        const correctAnswerMap = JSON.parse(question.answer) as Record<
          string,
          string
        >;
        const correctAnswers = Object.entries(correctAnswerMap).map(
          ([leftId, rightId], index) => {
            return (
              <div key={leftId} className="grid grid-cols-3 gap-x-4">
                <div className="space-y-3 col-span-1 text-green-600">
                  {leftId}
                </div>
                <div className="space-y-3 col-span-2 text-green-600">
                  {rightId}
                </div>
                {index !== Object.entries(correctAnswerMap).length - 1 && (
                  <Separator
                    decorative
                    className="col-span-3 my-2 bg-green-500"
                  />
                )}
              </div>
            );
          },
        );
        return (
          <div className="border border-green-600 rounded-md p-4">
            {correctAnswers}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="h-full flex flex-col">
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
      <CardContent className="flex-1 flex flex-col justify-center custom-scrollbar-y overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center">
          {renderQuestionBody()}
        </div>
        <div className="mt-4 space-y-2">
          {isAnswered && !isSubmitting && isCorrect !== null && (
            <div
              className={cn(
                "p-4 rounded-md font-bold",
                isCorrect
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800",
              )}
            >
              {isCorrect ? (
                <div className="text-center">Correct!</div>
              ) : (
                <div>Incorrect. The correct answer is: {correctAnswer()}</div>
              )}
            </div>
          )}
          {!isAnswered && (
            <Button variant={"outline"} onClick={handleSkip} className="w-full">
              Skip
            </Button>
          )}
          {!isAnswered && (
            <Button
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer}
              className="w-full"
            >
              Check Answer
            </Button>
          )}
          {isAnswered && (
            <Button onClick={onNext} className="w-full" disabled={isSubmitting}>
              {!isLastQuestion
                ? isSubmitting
                  ? "Checking answer..."
                  : "Next"
                : "Finish Quiz"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
