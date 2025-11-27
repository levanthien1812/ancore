"use client";
import { useState } from "react";
import { QuizQuestionWithWords } from "@/lib/type";
import { Button } from "../ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const QuizSummaryDetail = ({
  questions,
}: {
  questions: QuizQuestionWithWords[];
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const correctCount = questions.filter((q) => q.isCorrect).length;

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
        {questions.map((q) => (
          <div
            key={q.id}
            className={cn(
              "p-3 border rounded-lg",
              q.isCorrect ? "border-green-500" : "border-red-500"
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
              ) : (
                <XCircle className="text-red-500 ml-2" />
              )}
            </div>
            {showDetails && (
              <div className="mt-2 pt-2 border-t text-sm space-y-1">
                <p>
                  <span className="font-semibold">Your answer:</span>{" "}
                  <span className="text-muted-foreground">{q.userAnswer}</span>
                </p>
                {!q.isCorrect && (
                  <p>
                    <span className="font-semibold">Correct answer:</span>{" "}
                    <span className="text-muted-foreground">{q.answer}</span>
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
