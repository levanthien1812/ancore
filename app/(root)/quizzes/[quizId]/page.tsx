import { getQuiz } from "@/lib/actions/quiz.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import QuizCarousel from "@/components/quizzes/quiz-carousel";
import QuizSummary from "@/components/quizzes/quiz-summary";
import IncompleteQuiz from "@/components/quizzes/incomplete-quiz";

type Props = {
  params: Promise<{ quizId: string }>;
};

// This function sets the page title
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Quiz Session`,
  };
}

const QuizSessionPage = async (props: Props) => {
  const params = await props.params;

  const quiz = await getQuiz(params.quizId);

  if (!quiz || !quiz.quizAnswers || quiz.quizAnswers.length === 0) {
    notFound();
  }

  return (
    <div className={`w-full max-w-[520px] mx-auto py-2 px-2 h-full`}>
      {quiz.completedAt ? (
        <QuizSummary quiz={quiz} />
      ) : quiz.unreachedQuestions ? (
        <IncompleteQuiz quiz={quiz} />
      ) : (
        <QuizCarousel quiz={quiz} />
      )}
    </div>
  );
};

export default QuizSessionPage;
