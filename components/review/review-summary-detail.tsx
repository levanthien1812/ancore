import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  Annoyed,
  ChevronRight,
  Frown,
  Laugh,
  Meh,
  Smile,
  WandSparkles,
} from "lucide-react";
import Image from "next/image";
import RoadSign from "@/public/images/road-sign.png";
import { WordWithMeanings } from "../add-word/add-word-form";
import WordDetail from "../word-card/word-detail";
import { StudySessionWithWordReviews } from "@/lib/type";
import { ReviewPerformance } from "@prisma/client";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import needsPractice from "@/public/images/needs-practice.png";
import fair from "@/public/images/fair.png";
import good from "@/public/images/good.png";
import awesome from "@/public/images/awesome.png";
import outstanding from "@/public/images/outstanding.png";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";

const WordList = ({
  title,
  words,
}: {
  title: string;
  words: WordWithMeanings[];
}) => {
  if (words.length === 0) return null;

  const colorMap: Record<string, string> = {
    Forgot: "border-level-forgot bg-level-forgot/10 hover:bg-level-forgot/20",
    Hard: "border-level-hard bg-level-hard/10 hover:bg-level-hard/20",
    Medium: "border-level-medium bg-level-medium/10 hover:bg-level-medium/20",
    Good: "border-level-good bg-level-good/10 hover:bg-level-good/20",
    Easy: "border-level-easy bg-level-easy/10 hover:bg-level-easy/20",
  };

  const bgColorMap: Record<string, string> = {
    Forgot: "bg-level-forgot/20",
    Hard: "bg-level-hard/20",
    Medium: "bg-level-medium/20",
    Good: "bg-level-good/20",
    Easy: "bg-level-easy/20",
  };

  const iconMap: Record<string, React.ReactNode> = {
    Forgot: <Frown width={20} height={20} className="text-level-forgot" />,
    Hard: <Annoyed width={20} height={20} className="text-level-hard" />,
    Medium: <Meh width={20} height={20} className="text-level-medium" />,
    Good: <Smile width={20} height={20} className="text-level-good" />,
    Easy: <Laugh width={20} height={20} className="text-level-easy" />,
  };

  return (
    <div
      className={`flex gap-2 rounded-xl p-3 shadow-md border-l-3 bg-white border-level-${title.toLowerCase()}`}
    >
      <div className={`h-fit p-2 rounded-full ${bgColorMap[title]}`}>
        {iconMap[title]}
      </div>
      <div>
        <h3 className="font-semibold">
          {title} ({words.length})
        </h3>
        <div className="flex flex-wrap gap-1 mt-1">
          {words.map((wordObj, index) => (
            <Popover key={`${wordObj.id}-${index}`}>
              <PopoverTrigger asChild>
                <button
                  className={`border text-sm px-2 py-1 ${colorMap[title]} rounded-md cursor-pointer transition`}
                  onClick={(e) => {
                    handlePlayAudio(wordObj.word);
                  }}
                >
                  {wordObj.word}
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-120 overflow-hidden bg-primary p-4"
                side="top"
              >
                <WordDetail word={wordObj} showReviewStats={false} />
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReviewSummaryDetail = ({
  studySession,
}: {
  studySession?: StudySessionWithWordReviews;
}) => {
  const summary = React.useMemo(() => {
    const s: Record<ReviewPerformance, WordWithMeanings[]> = {
      Forgot: [],
      Hard: [],
      Medium: [],
      Good: [],
      Easy: [],
    };

    if (studySession?.reviews) {
      studySession.reviews.forEach((session) => {
        if (session.performance && session.word) {
          s[session.performance].push(session.word);
        }
      });
    }
    return s;
  }, [studySession]);

  const total = Object.values(summary).reduce(
    (acc, words) => acc + words.length,
    0,
  );

  // Collect all words from the performance summary
  const allWords = Object.values(summary).flat();
  const wordsParam = allWords.map((w) => w.word).join(",");

  const evaluationImage = React.useMemo(() => {
    if (total === 0) return RoadSign;

    // Define success as words that were Good or Easy
    const successCount = summary.Good.length + summary.Easy.length;
    const percentage = (successCount / total) * 100;

    if (percentage === 100) return outstanding;
    if (percentage >= 85) return awesome;
    if (percentage >= 70) return good;
    if (percentage >= 50) return fair;
    return needsPractice;
  }, [summary, total]);

  return (
    <div className="shadow-lg rounded-2xl border-primary p-4 space-y-2 bg-linear-to-b from-[#2563eb]/20 to-white">
      <div className="flex justify-center items-center gap-2">
        <p className="text-center text-xl font-bold mx-auto">
          You reviewed <span className="text-3xl text-[#2563eb]">{total}</span>{" "}
          words.
        </p>
        <Image
          src={evaluationImage}
          width={100}
          height={100}
          alt="Performance illustration"
        />
      </div>
      <div className="space-y-1">
        <WordList title="Forgot" words={summary.Forgot} />
        <WordList title="Hard" words={summary.Hard} />
        <WordList title="Medium" words={summary.Medium} />
        <WordList title="Good" words={summary.Good} />
        <WordList title="Easy" words={summary.Easy} />
      </div>

      <Link href={`/quizzes?words=${encodeURIComponent(wordsParam)}`}>
        <Button
          variant={"outline"}
          className="text-sm w-full font-bold text-primary hover:bg-[#2563eb]/10  bg-white"
        >
          <WandSparkles width={16} height={16} className="text-[#2563eb]" />
          <span>Generate quiz for these words</span>
          <ChevronRight />
        </Button>
      </Link>
    </div>
  );
};

export default ReviewSummaryDetail;
