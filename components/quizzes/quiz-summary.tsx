"use client";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import Image from "next/image";
import QuizSummaryDetail from "./quiz-summary-detail";
import { QuizWithAnswers } from "@/lib/type";
import { List, RotateCcw } from "lucide-react";
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Quiz Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 h-full">
        <div className="flex flex-col justify-center items-center gap-2">
          <Image src={image} alt={level} width={160} />
          <p className="text-2xl font-bold text-primary">{level}</p>
        </div>
        <QuizSummaryDetail quiz={quiz} />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleRetry}>
            <RotateCcw width={16} />{" "}
            {isPending ? "Processing..." : "Retry quiz"}
          </Button>
          <Link href="/quizzes?tab=history" className="flex-1">
            <Button variant="outline" className="w-full">
              <List width={16} /> Back to List
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSummary;
