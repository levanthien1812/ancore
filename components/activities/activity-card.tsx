"use client";
import { ActivityItem } from "@/lib/actions/activity.actions";
import { MasteryLevel } from "@/lib/constants/enums";
import { cn } from "@/lib/utils";
import { BookOpen, Star, CircleQuestionMark, Mic } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

const masteryColors: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Learning: "bg-yellow-100 text-yellow-700",
  Familiar: "bg-purple-100 text-purple-700",
  Mastered: "bg-green-100 text-green-700",
};

const quizStatusColors: Record<string, string> = {
  Perfect: "bg-green-100 text-green-700",
  Excellent: "bg-blue-100 text-blue-700",
  NeedsReview: "bg-red-100 text-red-700",
  InProgress: "bg-yellow-100 text-yellow-700",
};

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  return mins <= 1 ? "1 min" : `${mins} mins`;
}

interface ActivityMeta {
  word?: string;
  masteryLevel?: string;
  type?: string;
  partOfSpeech?: string | null;
  durationSeconds?: number;
  wordsReviewedCount?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  status?: string;
  title?: string;
  isNew?: boolean;
}

type Props = {
  item: ActivityItem;
};

export default function ActivityCard({ item }: Props) {
  const time = format(parseISO(item.createdAt), "h:mm a");

  const typeConfig = {
    word_added: {
      borderColor: "border-l-blue-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      typeLabel: "Word Added",
      Icon: BookOpen,
    },
    review_session: {
      borderColor: "border-l-yellow-400",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      badgeColor: "bg-yellow-50 text-yellow-700 border-yellow-200",
      typeLabel: "Review",
      Icon: Star,
    },
    quiz: {
      borderColor: "border-l-purple-500",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      typeLabel: "Quiz",
      Icon: CircleQuestionMark,
    },
    conversation: {
      borderColor: "border-l-green-500",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      badgeColor: "bg-green-50 text-green-700 border-green-200",
      typeLabel: "Talk",
      Icon: Mic,
    },
  };

  const config = typeConfig[item.type];
  const { Icon, iconBg, iconColor, borderColor, badgeColor, typeLabel } = config;

  const renderChips = () => {
    const meta = item.metadata as ActivityMeta;

    if (item.type === "word_added") {
      return (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {meta.masteryLevel && (
            <span
              className={cn(
                "text-[11px] px-2 py-0.5 rounded-full font-medium",
                masteryColors[meta.masteryLevel] ?? "bg-gray-100 text-gray-600",
              )}
            >
              {meta.masteryLevel}
            </span>
          )}
          {meta.partOfSpeech && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 italic">
              {meta.partOfSpeech}
            </span>
          )}
          {meta.type && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 capitalize">
              {meta.type}
            </span>
          )}
        </div>
      );
    }

    if (item.type === "review_session") {
      return (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {meta.wordsReviewedCount != null && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-800">
              {meta.wordsReviewedCount} words reviewed
            </span>
          )}
          {meta.durationSeconds != null && meta.durationSeconds > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
              {formatDuration(meta.durationSeconds)}
            </span>
          )}
        </div>
      );
    }

    if (item.type === "quiz") {
      const status = meta.status;
      return (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {status && (
            <span
              className={cn(
                "text-[11px] px-2 py-0.5 rounded-full font-medium",
                quizStatusColors[status] ?? "bg-gray-100 text-gray-600",
              )}
            >
              {status === "NeedsReview"
                ? "Needs Review"
                : status === "InProgress"
                  ? "In Progress"
                  : status}
            </span>
          )}
          {meta.correctAnswers != null && meta.totalQuestions != null && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 font-semibold">
              {meta.correctAnswers}/{meta.totalQuestions} correct
            </span>
          )}
          {meta.durationSeconds != null && meta.durationSeconds > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
              {formatDuration(meta.durationSeconds)}
            </span>
          )}
        </div>
      );
    }

    if (item.type === "conversation") {
      return (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
            {meta.isNew ? "New Session" : "Continued Session"}
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-gray-100 border-l-4 flex gap-3 sm:gap-4 transition-all hover:shadow-sm",
        borderColor,
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center self-start",
          iconBg,
        )}
      >
        <Icon width={20} height={20} className={iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border",
                badgeColor,
              )}
            >
              {typeLabel}
            </span>
            <p className="font-bold text-sm sm:text-base text-gray-900 truncate">
              {item.title}
            </p>
          </div>
          {/* Time */}
          <span className="shrink-0 text-xs text-muted-foreground font-medium">
            {time}
          </span>
        </div>

        {item.description && (
          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        {renderChips()}
      </div>
    </div>
  );
}
