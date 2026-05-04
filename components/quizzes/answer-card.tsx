"use client";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuizQuestionType, QuizQuestionTypeLabel } from "@/lib/constants/enums";
import { QuizAnswerWithQuestion } from "@/lib/type";
import { Badge } from "../ui/badge";

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
    <div
      key={answer.id}
      className={cn(
        "p-3 border rounded-lg",
        answer.isCorrect === true && "border-green-500 bg-green-50",
        answer.isCorrect === false && "border-red-500 bg-red-50",
        answer.isCorrect === null && "border-gray-300 bg-gray-50",
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <div
          className={`w-6 h-6 flex items-center justify-center shrink-0 rounded-full text-sm text-white ${answer.isCorrect === true ? "bg-green-500" : answer.isCorrect === false ? "bg-red-500" : "bg-gray-300"}`}
        >
          {index + 1}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex gap-2 items-center">
            <div
              className={`${answer.isCorrect ? "text-green-500" : "text-red-500"} text-sm font-bold`}
            >
              {answer.isCorrect ? "Correct" : "Incorrect"}
            </div>

            <div className="flex justify-between items-center px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full w-fit shadow">
              {QuizQuestionTypeLabel[answer.quizQuestion.type]}
            </div>

            <div className="ms-auto">
              {answer.isCorrect ? (
                <CheckCircle width={18} className="text-green-500 ml-2" />
              ) : answer.isCorrect === false ? (
                <XCircle width={18} className="text-red-500 ml-2" />
              ) : (
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
              <div>
                <span className="font-semibold">Your answer:</span>{" "}
                <div className="text-muted-foreground">
                  {answer.userAnswer
                    ? displayAnswer(
                        answer.quizQuestion.type as QuizQuestionType,
                        answer.userAnswer,
                      )
                    : "Not answered"}
                </div>
              </div>
              {!answer.isCorrect && (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;
