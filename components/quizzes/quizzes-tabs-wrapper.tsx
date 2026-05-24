"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuizIntro from "@/components/quizzes/quiz-intro";
import RecentQuizzes from "@/components/quizzes/recent-quizzes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { WordWithMeanings } from "@/components/add-word/add-word-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteQuiz } from "@/lib/actions/quiz.actions";
import { format } from "date-fns";
import { useState } from "react";

interface QuizzesTabsWrapperProps {
  words: WordWithMeanings[];
  estimatedTimeInMinutes: number;
  wordsParam?: string;
  initialTab: string;
  incompleteQuiz: {
    id: string;
    answeredCount: number;
    totalQuestions: number;
    createdAt: Date;
  } | null;
}

const QuizzesTabsWrapper = ({
  words,
  estimatedTimeInMinutes,
  wordsParam,
  initialTab,
  incompleteQuiz,
}: QuizzesTabsWrapperProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showIncompleteDialog, setShowIncompleteDialog] =
    useState(!!incompleteQuiz);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleContinue = () => {
    if (incompleteQuiz) {
      router.push(`/quizzes/${incompleteQuiz.id}`);
    }
  };

  const handleStartNew = async () => {
    if (incompleteQuiz && incompleteQuiz.answeredCount === 0) {
      await deleteQuiz(incompleteQuiz.id);
    }
    setShowIncompleteDialog(false);
  };

  return (
    <>
      <Tabs
        value={initialTab}
        onValueChange={handleTabChange}
        className="h-full"
      >
        <TabsList className="mx-auto">
          <TabsTrigger value="start">Start Quiz</TabsTrigger>
          <TabsTrigger value="history">Recent Quizzes</TabsTrigger>
        </TabsList>
        <TabsContent value="start">
          <QuizIntro
            wordsToQuizCount={words.length}
            estimatedTime={estimatedTimeInMinutes}
            specificWords={wordsParam ? words.map((w) => w.word) : undefined}
          />
        </TabsContent>
        <TabsContent value="history">
          <RecentQuizzes />
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={showIncompleteDialog}
        onOpenChange={setShowIncompleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Incomplete Quiz Found</AlertDialogTitle>
            <AlertDialogDescription>
              You have an unfinished quiz from{" "}
              {incompleteQuiz &&
                format(new Date(incompleteQuiz.createdAt), "PPP")}
              . Would you like to continue it or start a new one?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStartNew}>
              Start New Quiz
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue}>
              Continue Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QuizzesTabsWrapper;
