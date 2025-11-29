import { getQuizLog } from "@/lib/actions/quiz.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import QuizCarousel from "@/components/quizzes/quiz-carousel";
import QuizSummary from "@/components/quizzes/quiz-summary";

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

  const quizLog = await getQuizLog(params.quizLogId);

  if (!quizLog || !quizLog.questions || quizLog.questions.length === 0) {
    notFound();
  }

  // Determine if the quiz has been started (at least one question answered)
  const isQuizStarted = quizLog.questions.some((q) => q.userAnswer !== null);

  return (
    <div className={`w-[440px] mx-auto h-full py-2`}>
      {/* {quizLog.completedAt || isQuizStarted ? (
        <QuizSummary questions={quizLog.questions} />
          ) :
              (
        <QuizCarousel questions={quizLog.questions} />
        )} */}
      <QuizCarousel questions={quizLog.questions} />
    </div>
  );
};

export default QuizSessionPage;
