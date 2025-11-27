import QuizIntro from "@/components/quizzes/quiz-intro";
import RecentQuizzes from "@/components/quizzes/recent-quizzes";
import { getWordsToQuiz } from "@/lib/actions/quiz.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const QuizzesPage = async () => {
  const { words, estimatedTimeInMinutes } = await getWordsToQuiz({
    wordCount: 10,
  });

  return (
    <div className="w-[440px] mx-auto h-full py-2">
      <Tabs defaultValue="start" className="h-full">
        <TabsList className="mx-auto">
          <TabsTrigger value="start">Start Quiz</TabsTrigger>
          <TabsTrigger value="history">Recent Quizzes</TabsTrigger>
        </TabsList>
        <TabsContent value="start">
          <QuizIntro
            wordsToQuizCount={words.length}
            estimatedTime={estimatedTimeInMinutes}
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
