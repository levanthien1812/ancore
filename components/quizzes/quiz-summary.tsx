"use client";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import Praise from "@/public/images/praise.png";
import Image from "next/image";
import QuizSummaryDetail from "./quiz-summary-detail";
import { QuizLogWithAnswers } from "@/lib/type";
import { List, RotateCcw } from "lucide-react";

const QuizSummary = ({ quizzesLog }: { quizzesLog: QuizLogWithAnswers }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Quiz Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 h-full">
        <div className="flex justify-center items-center">
          <Image src={Praise} alt="praise" width={200} />
        </div>
        <QuizSummaryDetail quizzesLog={quizzesLog} />
        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <Link href="/quizzes">
              <RotateCcw width={16} /> Take Another Quiz
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
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
