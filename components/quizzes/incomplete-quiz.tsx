"use client";
import React, { useState } from "react";
import CheckList from "@/public/images/checklist.png";
import Image from "next/image";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { QuizWithAnswers } from "@/lib/type";
import IconDisplay from "../shared/icon-display";
import {
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  List,
  LogOut,
  StepForward,
} from "lucide-react";
import { convertSecondsToMinutes2 } from "@/lib/utils/time-convert";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import QuizCarousel from "./quiz-carousel";

const IncompleteQuiz = ({ quiz }: { quiz: QuizWithAnswers }) => {
  const router = useRouter();
  const [isContinuing, setIsContinuing] = useState(false);

  if (isContinuing) {
    return <QuizCarousel quiz={quiz} />;
  }

  const handleExit = () => {
    router.push("/quizzes");
  };

  return (
    <div className="w-full p-4 flex flex-col gap-2 justify-center bg-gray-50 rounded-md h-full">
      <Image
        width={100}
        height={100}
        alt="checklist"
        src={CheckList}
        className="mx-auto mt-auto"
      />
      <p className="text-2xl mx-auto w-3/5 text-center font-bold">
        You have an incomplete quiz
      </p>
      <p className="text-sm text-muted-foreground mx-auto w-4/5 text-center">
        Continue where you left off and keep your streak going
      </p>
      <div className="p-3 rounded-md border bg-white">
        <p className="text-sm">Current Quiz Process</p>
        <div className="flex items-center justify-around mt-2">
          <div className="w-20 h-20">
            <CircularProgressbar
              value={(quiz.completedQuestions / quiz.totalQuestions) * 100}
              text={`${Math.round((quiz.completedQuestions / quiz.totalQuestions) * 100)}%`}
              strokeWidth={7}
              styles={buildStyles({
                pathColor: "#48A111",
                textColor: "#111827",
                textSize: "24px",
                trailColor: "#e5e7eb",
              })}
            />
          </div>
          <div className="flex flex-col gap-2 justify-center items-center">
            <CheckCircle width={16} height={16} className="text-purple-600" />
            <p className="text-xl leading-none font-bold">
              {quiz.completedQuestions}
            </p>
            <p className="text-xs text-muted-foreground leading-none">
              Answered
            </p>
          </div>
          <div className="flex flex-col gap-2 justify-center items-center">
            <Circle width={16} height={16} className="text-yellow-600" />
            <p className="text-xl leading-none font-bold">
              {quiz.unreachedQuestions}
            </p>
            <p className="text-xs text-muted-foreground leading-none">
              Remaning
            </p>
          </div>
          <div className="flex flex-col gap-2 justify-center items-center">
            <Clock width={16} height={16} className="text-green-600" />
            <p className="text-xl leading-none font-bold">
              {convertSecondsToMinutes2(quiz.durationSeconds)}
            </p>
            <p className="text-xs text-muted-foreground leading-none">
              Time spent
            </p>
          </div>
        </div>
      </div>
      <div className="p-3 rounded-md border bg-white">
        <div className="flex gap-2 pb-2">
          <IconDisplay
            icon={List}
            iconColor="text-purple-600"
            bgClass="bg-purple-100"
          />
          <div>
            <p className="text-xs text-muted-foreground">Total questions</p>
            <p className="text-base">{quiz.totalQuestions}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <IconDisplay
            icon={Calendar}
            iconColor="text-green-600"
            bgClass="bg-green-100"
          />
          <div>
            <p className="text-xs text-muted-foreground">Started</p>
            <p className="text-base">
              {format(quiz.createdAt, "MMMM do, yyyy hh:mm a")}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-2 mt-auto">
        <Button className="w-full" onClick={() => setIsContinuing(true)}>
          <StepForward width={18} height={18} className="text-white mt-auto" />{" "}
          Continue Quiz
        </Button>
        <Button className="w-full" variant={"outline"} onClick={handleExit}>
          <LogOut width={18} height={18} className="text-primary" /> Exit Quiz
        </Button>
      </div>
    </div>
  );
};

export default IncompleteQuiz;
