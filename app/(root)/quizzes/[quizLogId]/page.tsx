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

  if (!quizLog || !quizLog.quizAnswers || quizLog.quizAnswers.length === 0) {
    notFound();
  }

  // Determine if the quiz has been started (at least one question answered)
  const isQuizStarted = quizLog.quizAnswers.some((q) => q.userAnswer !== null);

  return (
    <div className={`w-full max-w-[500px] mx-auto py-2 px-2 h-full`}>
      {quizLog.completedAt || isQuizStarted ? (
        <QuizSummary quizzesLog={quizLog} />
      ) : (
        <QuizCarousel quizzesLog={quizLog} />
      )}
    </div>
  );
};

export default QuizSessionPage;
