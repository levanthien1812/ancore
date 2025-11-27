"use client";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import Congrats from "@/public/images/congrats.png";
import Image from "next/image";
import QuizSummaryDetail from "./quiz-summary-detail";
import { QuizQuestionWithWords } from "@/lib/type";

const QuizSummary = ({ questions }: { questions: QuizQuestionWithWords[] }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center items-center">
            <Image src={Congrats} alt="congrats" width={240} />
          </div>
          <QuizSummaryDetail questions={questions} />
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild>
              <Link href="/quizzes">Take Another Quiz</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizSummary;
