"use client";

import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { shuffleArray } from "@/lib/utils/shuffle-array";
import { cn } from "@/lib/utils";
import { QuizQuestionType } from "@/lib/constants/enums";
import { QuizAnswerWithQuestion } from "@/lib/type";

const QuizSummaryDetail = ({
  quizAnswers,
}: {
  quizAnswers: QuizAnswerWithQuestion[];
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Randomize questions once on component mount
  const shuffledAnswers = useMemo(
    () => shuffleArray(quizAnswers),
    [quizAnswers],
  );

  const correctCount = quizAnswers.filter((a) => a.isCorrect).length;

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
          },
        );
        return <div className="border rounded-md p-4">{correctAnswers}</div>;
      default:
        return null;
    }
  };

  return (
    <div className="border border-dashed rounded-lg border-primary p-2 space-y-4 flex-1">
      <p className="text-center text-xl font-bold text-primary-2">
        You got {correctCount} out of {quizAnswers.length} correct!
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

      <div className="space-y-2">
        {shuffledAnswers.map((a) => (
          <div
            key={a.id}
            className={cn(
              "p-3 border rounded-lg",
              a.isCorrect === true && "border-green-500",
              a.isCorrect === false && "border-red-500",
              a.isCorrect === null && "border-gray-300",
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {a.quizQuestion.direction}
                </p>
                <p className="font-semibold">
                  {a.quizQuestion.type === QuizQuestionType.Matching
                    ? "Multiple Word Matching"
                    : a.quizQuestion.question || a.quizQuestion.words[0]?.word}
                </p>
              </div>
              {a.isCorrect ? (
                <CheckCircle className="text-green-500 ml-2" />
              ) : a.isCorrect === false ? (
                <XCircle className="text-red-500 ml-2" />
              ) : (
                <HelpCircle className="text-gray-400 ml-2" />
              )}
            </div>
            {showDetails && (
              <div className="mt-2 pt-2 border-t text-sm space-y-1">
                <div>
                  <span className="font-semibold">Your answer:</span>{" "}
                  <div className="text-muted-foreground">
                    {a.userAnswer
                      ? answer(
                          a.quizQuestion.type as QuizQuestionType,
                          a.userAnswer,
                        )
                      : "Not answered"}
                  </div>
                </div>
                {!a.isCorrect && (
                  <div>
                    <span className="font-semibold">Correct answer:</span>{" "}
                    <div className="text-muted-foreground">
                      {answer(
                        a.quizQuestion.type as QuizQuestionType,
                        a.quizQuestion.answer,
                      )}
                    </div>
                  </div>
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
