"use client";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import QuizSummaryDetail from "./quiz-summary-detail";
import { QuizWithAnswers } from "@/lib/type";
import { ArrowLeft, ArrowRight, List, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { retryQuizSession } from "@/lib/actions/quiz.actions";
import { useTransition } from "react";
import { toast } from "sonner";
import { QuizEvaluationLevel } from "@/lib/constants/constant";
import needsPractice from "@/public/images/needs-practice.png";
import fair from "@/public/images/fair.png";
import good from "@/public/images/good.png";
import awesome from "@/public/images/awesome.png";
import outstanding from "@/public/images/outstanding.png";

const QuizSummary = ({ quiz }: { quiz: QuizWithAnswers }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRetry = () => {
    startTransition(async () => {
      const result = await retryQuizSession(quiz.id);
      if (result.success && result.quizId) {
        router.push(`/quizzes/${result.quizId}`);
      } else {
        toast.error(result.message || "Failed to retry quiz");
      }
    });
  };

  const getEvaluation = () => {
    const percentage =
      quiz.totalQuestions > 0
        ? (quiz.correctAnswers / quiz.totalQuestions) * 100
        : 0;

    if (percentage === 100)
      return { level: QuizEvaluationLevel.Outstanding, image: outstanding };
    if (percentage >= 85)
      return { level: QuizEvaluationLevel.Awesome, image: awesome };
    if (percentage >= 70)
      return { level: QuizEvaluationLevel.Good, image: good };
    if (percentage >= 50)
      return { level: QuizEvaluationLevel.Fair, image: fair };
    return { level: QuizEvaluationLevel.NeedsPractice, image: needsPractice };
  };

  const { level, image } = getEvaluation();

  return (
    <div className="py-4 px-8 h-full rounded-[24px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] no-scrollbar overflow-y-auto">
      <div className="flex justify-between">
        <Link href="/quizzes">
          <Button variant="link" size="sm">
            <ArrowLeft width={16} />
            New quiz
          </Button>
        </Link>
        <Link href="/quizzes?tab=history">
          <Button variant="link" size="sm">
            History
            <ArrowRight width={16} />
          </Button>
        </Link>
      </div>
      <p className="text-center text-2xl bg-primary-2 text-white rounded-lg p-2 w-fit px-4 mx-auto">
        Quiz Complete!
      </p>
      <div className="space-y-4 mt-2">
        <div className="flex flex-col justify-center items-center gap-2">
          <Image src={image} alt={level} width={160} />
          <p className="text-2xl font-bold text-primary">{level}</p>
        </div>
        <QuizSummaryDetail quiz={quiz} />
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={handleRetry}
            isLoading={isPending}
          >
            <RotateCcw width={16} />{" "}
            {isPending ? "Processing..." : "Retry quiz"}
          </Button>
          <Link href="/quizzes?tab=history" className="flex-1">
            <Button variant="outline" className="w-full">
              <List width={16} /> Back to List
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizSummary;
