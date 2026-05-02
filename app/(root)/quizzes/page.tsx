import QuizIntro from "@/components/quizzes/quiz-intro";
import RecentQuizzes from "@/components/quizzes/recent-quizzes";
import { getWordsToQuiz } from "@/lib/actions/quiz.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WordWithMeanings } from "@/components/add-word/add-word-form";

interface QuizzesPageProps {
  searchParams: Promise<{ words?: string }>;
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
    <div className="w-full max-w-[440px] mx-auto h-full py-2 px-4 md:px-0">
      <Tabs defaultValue="start" className="h-full">
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
    </div>
  );
};

export default QuizzesPage;
