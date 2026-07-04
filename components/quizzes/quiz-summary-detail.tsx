"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  CheckCircle,
  ListChevronsDownUp,
  ClipboardList,
  Star,
  CircleX,
} from "lucide-react";
import { QuizWithAnswers } from "@/lib/type";
import Image from "next/image";
import Medal from "@/public/images/medal.png";
import AnswerCard from "./answer-card";
import { QuizEvaluationEncouragement } from "@/lib/constants/constant";

const QuizSummaryDetail = ({ quiz }: { quiz: QuizWithAnswers }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Randomize questions once on component mount
  // const shuffledAnswers = useMemo(
  //   () => shuffleArray(quiz.quizAnswers),
  //   [quizAnswers],
  // );

  const correctCount = quiz.quizAnswers.filter((a) => a.isCorrect).length;

  const getEncouragement = () => {
    const total = quiz.quizAnswers.length;
    if (total === 0) return "";
    const percentage = (correctCount / total) * 100;

    if (percentage === 100) return QuizEvaluationEncouragement.Outstanding;
    if (percentage >= 85) return QuizEvaluationEncouragement.Awesome;
    if (percentage >= 70) return QuizEvaluationEncouragement.Good;
    if (percentage >= 50) return QuizEvaluationEncouragement.Fair;
    return QuizEvaluationEncouragement.NeedsPractice;
  };

  return (
    <div className="space-y-4 flex-1">
      <div className="flex gap-2 items-center">
        <div>
          <Image src={Medal} alt="Medal" width={64} height={64} />
        </div>
        <div className="">
          <p className="text-xl font-bold">
            You got{" "}
            <span className="text-green-500 text-2xl">{correctCount}</span> out
            of {quiz.quizAnswers.length} correct!
          </p>
          <p className="text-sm text-muted-foreground">{getEncouragement()}</p>
        </div>
      </div>

      <div className="text-right">
        <Button
          variant="outline"
          size={"sm"}
          className="text-primary"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "View Details"}{" "}
          <ListChevronsDownUp width={16} />
        </Button>
      </div>

      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Quiz Stats
        </p>

        <div className="mt-1 bg-gray-50 rounded-md p-3 shadow-md flex gap-2 [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-gray-200 [&>*:not(:last-child)]:pr-2 [&>*:not(:last-child)]:flex-1 no-scrollbar overflow-x-auto">
          <div className="flex gap-2 items-center">
            <div className="p-2 rounded-full bg-purple-100 flex items-center justify-center">
              <Star width={14} height={14} className="text-purple-500" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">
                {Math.round((correctCount / quiz.quizAnswers.length) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="p-2 rounded-full bg-blue-100 flex items-center justify-center">
              <ClipboardList width={14} height={14} className="text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">
                {quiz.totalQuestions}
              </p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="p-2 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle width={14} height={14} className="text-green-500" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">
                {quiz.correctAnswers}
              </p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="p-2 rounded-full bg-red-100 flex items-center justify-center">
              <CircleX width={14} height={14} className="text-red-500" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">
                {quiz.wrongAnswers}
              </p>
              <p className="text-xs text-muted-foreground">Incorrect</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          Question Details
        </p>
        <div className="space-y-2 mt-1">
          {quiz.quizAnswers.map((a, index) => (
            <AnswerCard
              key={a.id}
              answer={a}
              index={index}
              showDetails={showDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizSummaryDetail;
