"use client";
import { QuizQuestion } from "@/lib/type";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizQuestionType } from "@/lib/constants/enums";
import MultipleChoiceBody from "@/components/quizzes/multiple-choice-body";
import FillInTheBlankBody from "@/components/quizzes/fill-in-the-blank-body";
import MatchingBody from "@/components/quizzes/matching-body";

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

  const isCorrect = useMemo(() => {
    if (!isAnswered) return null;
    return selectedAnswer === question.answer;
  }, [isAnswered, selectedAnswer, question.answer]);

  const handleCheckAnswer = () => {
    if (selectedAnswer) {
      setIsAnswered(true);
      onAnswered(selectedAnswer, selectedAnswer === question.answer);
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
      <CardContent className="grow flex flex-col justify-between">
        <div className="grow flex flex-col justify-center">
          {renderQuestionBody()}
        </div>
        <div className="mt-4">
          {isAnswered && (
            <div
              className={cn(
                "p-4 rounded-md text-center font-bold",
                isCorrect
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              )}
            >
              {isCorrect
                ? "Correct!"
                : `Incorrect. The answer is: ${question.answer}`}
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
