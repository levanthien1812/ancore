"use client";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { QuizzesLog } from "@prisma/client";
import {
  CheckCircle,
  ChevronRight,
  CircleX,
  Clock,
  Dot,
  EllipsisVertical,
  RotateCcw,
  Star,
  XCircle,
} from "lucide-react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { convertSecondsToMinutes } from "@/lib/utils/time-convert";
import { QuizStatusLabel } from "@/lib/constants/enums";
import { useRouter } from "next/navigation";

type Action = {
  label: string;
  onClick: () => void;
  variant: "default" | "outline";
  icon?: React.ReactNode;
};

const QuizCard = ({ quiz }: { quiz: QuizzesLog }) => {
  const router = useRouter();

  const statusBgColor = {
    Perfect: "bg-[#4C8CE4]/10",
    Excellent: "bg-[#48A111]/10",
    NeedsReview: "bg-[#D62828]/10",
    InProgress: "bg-[#FF8C00]/10",
  }[quiz.status];

  const statusTextColor = {
    Perfect: "text-[#4C8CE4]",
    Excellent: "text-[#48A111]",
    NeedsReview: "text-[#D62828]",
    InProgress: "text-[#FF8C00]",
  }[quiz.status];

  const statusBorderColor = {
    Perfect: "border-[#4C8CE4]",
    Excellent: "border-[#48A111]",
    NeedsReview: "border-[#D62828]",
    InProgress: "border-[#FF8C00]",
  }[quiz.status];

  const statusText = {
    Perfect: QuizStatusLabel.PERFECT,
    Excellent: QuizStatusLabel.EXCELLENT,
    NeedsReview: QuizStatusLabel.NEEDS_REVIEW,
    InProgress: QuizStatusLabel.IN_PROGRESS,
  }[quiz.status];

  const statusIcon = {
    Perfect: <CheckCircle width={20} height={20} color="#4C8CE4" />,
    Excellent: <Clock width={20} height={20} color="#48A111" />,
    NeedsReview: <Star width={20} height={20} color="#D62828" />,
    InProgress: <CircleX width={20} height={20} color="#FF8C00" />,
  }[quiz.status];

  const actions: Action[] = {
    Perfect: [
      {
        label: "View Details",
        onClick: () => {
          router.push(`/quizzes/${quiz.id}`);
        },
        variant: "default" as const,
        icon: <ChevronRight width={14} height={14} />,
      },
    ],
    Excellent: [
      {
        label: "View Details",
        onClick: () => {
          router.push(`/quizzes/${quiz.id}`);
        },
        variant: "default" as const,
        icon: <ChevronRight width={14} height={14} />,
      },
    ],
    NeedsReview: [
      {
        label: "View Details",
        onClick: () => {
          router.push(`/quizzes/${quiz.id}`);
        },
        variant: "outline" as const,
        icon: <ChevronRight width={14} height={14} />,
      },
      {
        label: "Retry",
        onClick: () => {
          router.push(`/quizzes/${quiz.id}`);
        },
        variant: "default" as const,
        icon: <RotateCcw width={14} height={14} />,
      },
    ],
    InProgress: [
      {
        label: "Continue",
        onClick: () => {},
        variant: "default" as const,
        icon: <ChevronRight width={14} height={14} />,
      },
    ],
  }[quiz.status];

  return (
    <div
      className={`border-l-4 ${statusBorderColor} rounded-xl shadow-[0_0_10px_3px_rgba(0,0,0,0.1)] p-4`}
    >
      <div className={`flex gap-3 `}>
        <div>
          <div
            className={`p-3 rounded-full flex items-center justify-center ${statusBgColor}`}
          >
            {statusIcon}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start w-full gap-2">
            <div>
              <p className="text-lg font-bold leading-none">
                {format(quiz.createdAt, "MMMM do, yyyy")}
              </p>
              <div className="flex items-center gap-0">
                <span className="text-gray-400 text-[13px] font-bold">
                  {quiz.totalWords} words
                </span>
                <Dot className="text-gray-400" />
                <span className="text-gray-400 text-[13px] font-bold">
                  {convertSecondsToMinutes(quiz.durationSeconds)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`text-xs px-4 py-1 whitespace-nowrap rounded-md font-bold ${
                  statusBgColor
                } ${statusTextColor}`}
              >
                {statusText}
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-gray-400">
                    <EllipsisVertical width={16} height={16} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0">
                  <div>
                    <Button variant={"outline"} size={"sm"}>
                      Delete
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-between gap-2 mt-1">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12">
                <CircularProgressbar
                  value={(quiz.correctAnswers / quiz.totalQuestions) * 100}
                  text={`${quiz.correctAnswers}/${quiz.totalQuestions}`}
                  strokeWidth={8}
                  styles={buildStyles({
                    pathColor: "#48A111",
                    textColor: "#111827",
                    textSize: "28px",
                    trailColor: "#e5e7eb",
                  })}
                />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500">Score</p>
                <div className=" ">
                  <p className="text-xs whitespace-nowrap text-gray-400">
                    <span className="font-bold text-md text-[#48A111]">
                      {quiz.correctAnswers}
                    </span>{" "}
                    correct{" "}
                    <CheckCircle
                      width={14}
                      height={14}
                      className="inline text-[#48A111]"
                    />
                  </p>
                  <p className="text-xs whitespace-nowrap text-gray-400">
                    <span
                      className={`font-bold text-md ${quiz.wrongAnswers === 0 ? "text-gray-600" : "text-[#D62828]"}`}
                    >
                      {quiz.wrongAnswers}
                    </span>{" "}
                    incorrect{" "}
                    <XCircle
                      width={14}
                      height={14}
                      className="inline text-[#D62828]"
                    />
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 justify-end">
              {actions.map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant}
                  size={"sm"}
                  onClick={action.onClick}
                  className="h-fit px-4 py-1 min-w-[100px] justify-center rounded-sm text-xs flex items-center gap-1"
                >
                  <span>{action.label}</span>
                  {action.icon}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
