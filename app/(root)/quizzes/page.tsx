import { getWordsToQuiz } from "@/lib/actions/quiz.actions";
import { WordWithMeanings } from "@/components/add-word/add-word-form";
import QuizzesTabsWrapper from "@/components/quizzes/quizzes-tabs-wrapper";
import { Suspense } from "react";

interface QuizzesPageProps {
  searchParams: Promise<{ words?: string; tab?: string }>;
}

const QuizzesPage = async ({ searchParams }: QuizzesPageProps) => {
  const params = await searchParams;
  const wordsParam = params.words;

  let words: WordWithMeanings[] = [];
  let estimatedTimeInMinutes = 0;

  if (wordsParam) {
    // Parse the words from URL parameter (comma-separated)
    const wordList = wordsParam.split(",").map((w) => w.trim());
    const result = await getWordsToQuiz({ wordList });
    words = result.words;
    estimatedTimeInMinutes = result.estimatedTimeInMinutes;
  } else {
    // Default behavior: get words automatically
    const result = await getWordsToQuiz({ wordCount: 10 });
    words = result.words;
    estimatedTimeInMinutes = result.estimatedTimeInMinutes;
  }

  return (
    <div className="w-full max-w-[500px] mx-auto h-full py-2 px-2 sm:px-4 md:px-0">
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <QuizzesTabsWrapper
          words={words}
          estimatedTimeInMinutes={estimatedTimeInMinutes}
          wordsParam={wordsParam}
          initialTab={params.tab || "start"}
        />
      </Suspense>
    </div>
  );
};

export default QuizzesPage;
