import { getQuizQuestions } from "@/lib/actions/quiz.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import QuizCarousel from "@/components/quizzes/quiz-carousel";

type Props = {
  params: Promise<{ quizLogId: string }>;
};

// This function sets the page title
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Quiz Session`,
  };
}

const QuizSessionPage = async (props: Props) => {
  const params = await props.params;
  const questions = await getQuizQuestions(params.quizLogId);

  if (!questions || questions.length === 0) {
    notFound();
  }

  return (
    <div className="w-[440px] mx-auto h-full py-2">
      <QuizCarousel questions={questions} />
    </div>
  );
};

export default QuizSessionPage;
