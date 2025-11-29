"use client";

import { useMemo, useState } from "react";
import { QuizQuestionWithWords } from "@/lib/type";
import { Button } from "../ui/button";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { shuffleArray } from "@/lib/utils/shuffle-array";
import { cn } from "@/lib/utils";
import { QuizQuestionType } from "@/lib/constants/enums";

const QuizSummaryDetail = ({
  questions,
}: {
  questions: QuizQuestionWithWords[];
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Randomize questions once on component mount
  const shuffledQuestions = useMemo(() => shuffleArray(questions), [questions]);

  const correctCount = questions.filter((q) => q.isCorrect).length;

  const answer = (questionType: QuizQuestionType, answer: string) => {
    switch (questionType) {
      case QuizQuestionType.MultipleChoice_DefinitionToWord:
      case QuizQuestionType.MultipleChoice_WordToSynonym:
      case QuizQuestionType.FillInTheBlank:
        return <span>{answer}</span>;
      case QuizQuestionType.Matching:
        const correctAnswerMap = JSON.parse(answer) as Record<string, string>;
        const correctAnswers = Object.entries(correctAnswerMap).map(
          ([leftId, rightId]) => {
            return (
              <div key={leftId} className="grid grid-cols-3 gap-x-4">
                <div>{leftId}</div>
                <div className="col-span-2">{rightId}</div>
              </div>
            );
          }
        );
        return <div className="border rounded-md p-4">{correctAnswers}</div>;
      default:
        return null;
    }
  };

  return (
    <div className="border border-dashed rounded-lg border-primary p-4 space-y-4">
      <p className="text-center text-xl font-bold text-primary-2">
        You got {correctCount} out of {questions.length} correct!
      </p>

      <div className="text-right">
        <Button
          variant="link"
          className="text-primary"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "View Details"}
        </Button>
      </div>

      <div className="space-y-4">
        {shuffledQuestions.map((q) => (
          <div
            key={q.id}
            className={cn(
              "p-3 border rounded-lg",
              q.isCorrect === true && "border-green-500",
              q.isCorrect === false && "border-red-500",
              q.isCorrect === null && "border-gray-300"
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{q.direction}</p>
                <p className="font-semibold">
                  {q.question || q.words[0]?.word}
                </p>
              </div>
              {q.isCorrect ? (
                <CheckCircle className="text-green-500 ml-2" />
              ) : q.isCorrect === false ? (
                <XCircle className="text-red-500 ml-2" />
              ) : (
                <HelpCircle className="text-gray-400 ml-2" />
              )}
            </div>
            {showDetails && (
              <div className="mt-2 pt-2 border-t text-sm space-y-1">
                <p>
                  <span className="font-semibold">Your answer:</span>{" "}
                  <span className="text-muted-foreground">
                    {q.userAnswer
                      ? answer(q.type as QuizQuestionType, q.userAnswer)
                      : "Not answered"}
                  </span>
                </p>
                {!q.isCorrect && (
                  <p>
                    <span className="font-semibold">Correct answer:</span>{" "}
                    <span className="text-muted-foreground">
                      {answer(q.type as QuizQuestionType, q.answer)}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizSummaryDetail;
