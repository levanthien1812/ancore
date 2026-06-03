"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuizIntro from "@/components/quizzes/quiz-intro";
import RecentQuizzes from "@/components/quizzes/recent-quizzes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { WordWithMeanings } from "@/components/add-word/add-word-form";

interface QuizzesTabsWrapperProps {
  words: WordWithMeanings[];
  estimatedTimeInMinutes: number;
  wordsParam?: string;
  initialTab: string;
}

const QuizzesTabsWrapper = ({
  words,
  estimatedTimeInMinutes,
  wordsParam,
  initialTab,
}: QuizzesTabsWrapperProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={initialTab} onValueChange={handleTabChange} className="h-full">
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
  );
};

export default QuizzesTabsWrapper;
