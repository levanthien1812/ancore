"use client";
import { CheckCircle, XCircle, HelpCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizQuestionType, QuizQuestionTypeLabel } from "@/lib/constants/enums";
import { QuizAnswerWithQuestion } from "@/lib/type";

const AnswerCard = ({
  answer,
  index,
  showDetails,
}: {
  answer: QuizAnswerWithQuestion;
  index: number;
  showDetails: boolean;
}) => {
  const displayAnswer = (questionType: QuizQuestionType, answer: string) => {
    switch (questionType) {
      case QuizQuestionType.DefinitionToWord_Typing:
      case QuizQuestionType.WordToSynonym:
      case QuizQuestionType.FillInTheBlank:
        return <span>{answer}</span>;
      case QuizQuestionType.Matching:
        const correctAnswerMap = JSON.parse(answer) as Record<string, string>;
        const correctAnswers = Object.entries(correctAnswerMap).map(
          ([leftId, rightId]) => {
            return (
              <div
                key={leftId}
                className="grid grid-cols-3 gap-x-4 p-2 not-last:border-b"
              >
                <div>{leftId}</div>
                <div className="col-span-2">{rightId}</div>
              </div>
            );
          },
        );
        return <div className="border rounded-md mt-1">{correctAnswers}</div>;
      default:
        return null;
    }
  };

  return (
    <div
      key={answer.id}
      className={cn(
        "p-3 border rounded-lg",
        answer.isCorrect && "border-green-500 bg-green-50",
        answer.isWrong && "border-red-500 bg-red-50",
        answer.isSkipped && "border-gray-300 bg-gray-50",
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <div
          className={cn(
            `w-6 h-6 flex items-center justify-center shrink-0 rounded-full text-sm text-white`,
            {
              "bg-green-500": answer.isCorrect,
              "bg-red-500": answer.isWrong,
              "bg-gray-500": answer.isSkipped,
            },
          )}
        >
          {index + 1}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex gap-2 items-center">
            <div
              className={cn(`text-sm font-bold`, {
                "text-green-500": answer.isCorrect,
                "text-red-500": answer.isWrong,
                "text-gray-500": answer.isSkipped,
              })}
            >
              {answer.isCorrect
                ? "Correct"
                : answer.isWrong
                  ? "Incorrect"
                  : "Skipped"}
            </div>

            <div className="flex justify-between items-center px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full w-fit shadow">
              {QuizQuestionTypeLabel[answer.quizQuestion.type]}
            </div>

            <div className="ms-auto flex items-center gap-1">
              {answer.retried && (
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full border",
                    answer.isCorrectAfterRetry
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-600",
                  )}
                >
                  <RotateCcw width={10} />
                  {answer.isCorrectAfterRetry ? "✓" : "✗"}
                </span>
              )}
              {answer.isCorrect && (
                <CheckCircle width={18} className="text-green-500 ml-2" />
              )}{" "}
              {answer.isWrong && (
                <XCircle width={18} className="text-red-500 ml-2" />
              )}{" "}
              {answer.isSkipped && (
                <HelpCircle width={18} className="text-gray-400 ml-2" />
              )}
            </div>
          </div>
          <div>
            <p className="font-semibold text-lg">
              {answer.quizQuestion.words.map((w) => w.word).join(" - ")}
            </p>
          </div>
          {showDetails && (
            <div className="mt-2 pt-2 border-t text-sm space-y-1">
              <div className="border rounded-md p-2 bg-white/50">
                <p className="text-sm text-muted-foreground">
                  {answer.quizQuestion.direction}
                </p>
                <p className="text-lg text-primary font-bold">
                  {answer.quizQuestion.question}
                </p>
              </div>
              {answer.userAnswer && (
                <div>
                  <span className="font-semibold">Your answer:</span>{" "}
                  <div className="text-muted-foreground">
                    {displayAnswer(
                      answer.quizQuestion.type as QuizQuestionType,
                      answer.userAnswer,
                    )}
                  </div>
                </div>
              )}
              {answer.quizQuestion.answer && !answer.isCorrect && (
                <div>
                  <span className="font-semibold">Correct answer:</span>{" "}
                  <div className="text-muted-foreground">
                    {displayAnswer(
                      answer.quizQuestion.type as QuizQuestionType,
                      answer.quizQuestion.answer,
                    )}
                  </div>
                </div>
              )}
              {/* Retry result */}
              {answer.retried && (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs border mt-1",
                    answer.isCorrectAfterRetry
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700",
                  )}
                >
                  <RotateCcw width={12} className="shrink-0" />
                  <span className="font-semibold">Retry:</span>
                  {answer.isCorrectAfterRetry ? (
                    <span>Correct on retry ✓</span>
                  ) : answer.userAnswerRetry ? (
                    <span>
                      Answered&nbsp;
                      <span className="font-medium">{answer.userAnswerRetry}</span>
                      &nbsp;— still incorrect
                    </span>
                  ) : (
                    <span>Skipped on retry</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;
