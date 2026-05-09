"use client";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import Praise from "@/public/images/praise.png";
import Image from "next/image";
import QuizSummaryDetail from "./quiz-summary-detail";
import { QuizWithAnswers } from "@/lib/type";
import { List, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { retryQuizSession } from "@/lib/actions/quiz.actions";
import { useTransition } from "react";
import { toast } from "sonner";

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Quiz Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 h-full">
        <div className="flex justify-center items-center">
          <Image src={Praise} alt="praise" width={200} />
        </div>
        <QuizSummaryDetail quiz={quiz} />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleRetry}>
            <RotateCcw width={16} />{" "}
            {isPending ? "Processing..." : "Retry quiz"}
          </Button>
          <Button variant="outline" className="flex-1">
            <Link href="/quizzes?tab=history">
              {" "}
              <List width={16} /> Back to List
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSummary;
