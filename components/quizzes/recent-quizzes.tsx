"use client";
import { getRecentQuizzes } from "@/lib/actions/quiz.actions";
import QuizCard from "./quiz-card";
import { QuizStatusLabel, QuizStatusUI } from "@/lib/constants/enums";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "../ui/input";

type QuizStatusCount = {
  status: QuizStatusUI;
  count: number;
  label: QuizStatusLabel;
};

const RecentQuizzes = () => {
  const [statusFilter, setStatusFilter] = useState(QuizStatusUI.ALL);

  const { data: recentQuizzes, isLoading } = useQuery({
    queryKey: ["recentQuizzes"],
    queryFn: async () => {
      const quizzes = await getRecentQuizzes();
      return quizzes;
    },
  });

  // Derive the filtered list automatically whenever data or filter changes
  const filteredQuizzes = useMemo(() => {
    if (!recentQuizzes) return [];
    if (statusFilter === QuizStatusUI.ALL) return recentQuizzes;
    return recentQuizzes.filter(
      (quiz) => (quiz.status as string) === (statusFilter as string),
    );
  }, [recentQuizzes, statusFilter]);

  if (!recentQuizzes || recentQuizzes.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        You haven&apos;t taken any quizzes yet.
      </div>
    );
  }

  const statusCounts: QuizStatusCount[] = Object.entries(QuizStatusUI).map(
    ([key, status]) => ({
      status,
      count:
        status === QuizStatusUI.ALL
          ? recentQuizzes.length
          : recentQuizzes.filter(
              (quiz) => (quiz.status as string) === (status as string),
            ).length,
      label: QuizStatusLabel[key as keyof typeof QuizStatusLabel],
    }),
  );

  const handleStatusFilterChange = (status: QuizStatusUI) =>
    setStatusFilter(status);

  return (
    <div className="flex flex-col gap-2 border rounded-lg p-2 sm:p-4 h-full">
      <div className="flex justify-between items-center gap-1">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {statusCounts
            .filter((sc) => sc.count > 0)
            .map(({ status, count, label }) => (
              <button
                key={status}
                className={`text-xs text-muted-foreground rounded-sm px-2 py-1.5 font-medium whitespace-nowrap ${statusFilter === status ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                onClick={() => handleStatusFilterChange(status)}
                disabled={statusFilter === status}
              >
                {label} ({count})
              </button>
            ))}
        </div>
        <Input type="date" className="w-[110px] ms-auto shrink-0" size="sm" />
      </div>
      {filteredQuizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
};

export default RecentQuizzes;
