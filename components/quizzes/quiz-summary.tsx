"use client";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import Praise from "@/public/images/praise.png";
import Image from "next/image";
import QuizSummaryDetail from "./quiz-summary-detail";
import { QuizQuestionWithWords } from "@/lib/type";

const QuizSummary = ({ questions }: { questions: QuizQuestionWithWords[] }) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Quiz Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 h-full">
        <div className="flex justify-center items-center">
          <Image src={Praise} alt="praise" width={200} />
        </div>
        <QuizSummaryDetail questions={questions} />
        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <Link href="/quizzes">Take Another Quiz</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/quizzes">Back to List</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSummary;
