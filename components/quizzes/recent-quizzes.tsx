"use client";
import { getRecentQuizzes } from "@/lib/actions/quiz.actions";
import QuizCard from "./quiz-card";
import { QuizStatusLabel, QuizStatusUI } from "@/lib/constants/enums";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type QuizStatusCount = {
  status: QuizStatusUI;
  count: number;
  label: QuizStatusLabel;
};

const RecentQuizzes = () => {
  const [statusFilter, setStatusFilter] = useState(QuizStatusUI.ALL);
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

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
    return recentQuizzes.filter((quiz) => {
      const matchesStatus =
        statusFilter === QuizStatusUI.ALL ||
        (quiz.status as string) === (statusFilter as string);
      const quizDate = new Date(quiz.createdAt).toISOString().split("T")[0];
      const matchesDate = !selectedDate || quizDate === selectedDate;
      return matchesStatus && matchesDate;
    });
  }, [recentQuizzes, statusFilter, selectedDate]);

  // Get only the quizzes that should be visible based on "Show more"
  const visibleQuizzes = useMemo(() => {
    return filteredQuizzes.slice(0, visibleCount);
  }, [filteredQuizzes, visibleCount]);

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground p-8">
        Loading quizzes...
      </div>
    );
  }

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
          ? recentQuizzes.filter((q) => {
              const qDate = new Date(q.createdAt).toISOString().split("T")[0];
              return !selectedDate || qDate === selectedDate;
            }).length
          : recentQuizzes.filter(
              (q) =>
                (q.status as string) === (status as string) &&
                (!selectedDate ||
                  new Date(q.createdAt).toISOString().split("T")[0] ===
                    selectedDate),
            ).length,
      label: QuizStatusLabel[key as keyof typeof QuizStatusLabel],
    }),
  );

  const handleStatusFilterChange = (status: QuizStatusUI) => {
    setStatusFilter(status);
    setVisibleCount(5); // Reset count when filter changes
  };

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
        <div className="flex items-center gap-1 ms-auto shrink-0">
          {selectedDate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate("")}
              // className="h-8 text-xs"
            >
              Show All
            </Button>
          )}
          <Input
            type="date"
            className="w-[110px]"
            size="sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {visibleQuizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}

      {!filteredQuizzes.length && (
        <div className="text-center text-muted-foreground p-8">
          No quizzes match the selected filters.
        </div>
      )}

      {filteredQuizzes.length > visibleCount && (
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            onClick={() => setVisibleCount((prev) => prev + 5)}
          >
            Show more
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentQuizzes;
