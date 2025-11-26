import QuizIntro from "@/components/quizzes/quiz-intro";
import { getWordsToQuiz } from "@/lib/actions/quiz.actions";

const QuizzesPage = async () => {
  const { words, estimatedTimeInMinutes } = await getWordsToQuiz({
    wordCount: 10,
  });

  return (
    <div className="w-[440px] mx-auto h-full py-2">
      <QuizIntro
        wordsToQuizCount={words.length}
        estimatedTime={estimatedTimeInMinutes}
      />
    </div>
  );
};

export default QuizzesPage;
