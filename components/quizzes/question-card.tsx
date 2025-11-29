"use client";
import { QuizQuestion } from "@/lib/type";
import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizQuestionType } from "@/lib/constants/enums";
import MultipleChoiceBody from "@/components/quizzes/multiple-choice-body";
import FillInTheBlankBody from "@/components/quizzes/fill-in-the-blank-body";
import MatchingBody from "@/components/quizzes/matching-body";
import { Separator } from "../ui/separator";

const QuestionCard = ({
  question,
  onAnswered,
  onNext,
  isLastQuestion,
}: {
  question: QuizQuestion;
  onAnswered: (userAnswer: string, isCorrect: boolean) => void;
  onNext: () => void;
  isLastQuestion: boolean;
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const isCorrect = useCallback(() => {
    if (!selectedAnswer) return false;
    if (question.type === QuizQuestionType.Matching) {
      const selectedMatchs = JSON.parse(selectedAnswer);
      const correctAnswerMap = JSON.parse(question.answer);
      return Object.entries(selectedMatchs).every(([leftId, rightId]) => {
        return correctAnswerMap[leftId] === rightId;
      });
    }
    return selectedAnswer === question.answer;
  }, [selectedAnswer, question.answer, question.type]);

  const handleCheckAnswer = () => {
    if (selectedAnswer) {
      setIsAnswered(true);
      onAnswered(selectedAnswer, isCorrect());
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
            isAnswered={isAnswered}
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
          }
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
    <Card className="h-[760px] flex flex-col">
      <CardHeader>
        {/* Display the direction */}
        <p className="text-muted-foreground">{question.direction}</p>
        {/* Display the main question content, if it exists */}
        {question.question && (
          <CardTitle className="text-lg leading-snug pt-2">
            {question.question}
          </CardTitle>
        )}
      </CardHeader>
      <CardContent className="grow flex flex-col justify-between custom-scrollbar-y">
        <div className="grow flex flex-col justify-center">
          {renderQuestionBody()}
        </div>
        <div className="mt-4">
          {isAnswered && (
            <div
              className={cn(
                "p-4 rounded-md font-bold",
                isCorrect()
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              )}
            >
              {isCorrect() ? (
                <div className="text-center">Correct!</div>
              ) : (
                <div>Incorrect. The correct answer is: {correctAnswer()}</div>
              )}
            </div>
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
            <Button onClick={onNext} className="w-full mt-2">
              {isLastQuestion ? "Finish Quiz" : "Next"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
