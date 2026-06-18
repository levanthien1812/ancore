"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getMonthlyActivity,
  DailyActivity,
} from "@/lib/actions/activity.actions";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { Skeleton } from "../ui/skeleton";

// Helper function to determine the color class based on tasks completed
const getDayColorClass = (tasksCompleted: number) => {
  if (tasksCompleted >= 3) return "bg-yellow-600"; // Dark yellow
  if (tasksCompleted === 2) return "bg-yellow-400"; // Normal yellow
  if (tasksCompleted === 1) return "bg-yellow-300"; // Light yellow
  return "bg-gray-200"; // Gray for no tasks
};

const DailyHeatMap = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1; // getMonth() is 0-indexed

  const { data: monthlyActivity, isLoading } = useQuery<DailyActivity[]>({
    queryKey: [QUERY_KEY.GET_MONTHLY_ACTIVITY, year, month],
    queryFn: () => getMonthlyActivity(year, month),
  });

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday

  // Create empty cells for days before the 1st of the month
  const emptyDaysBefore = Array.from({
    length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1,
  }).map((_, i) => `empty-before-${i}`); // Adjust for Monday start

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const activityMap = useMemo(() => {
    const map = new Map<string, DailyActivity>();
    monthlyActivity?.forEach((activity) => {
      map.set(activity.date, activity);
    });
    return map;
  }, [monthlyActivity]);

  return (
    <div className="bg-white p-4 rounded-2xl space-y-4 h-full">
      <p className="text-xl sm:text-2xl font-bold text-primary">
        Activity Heat Map{" "}
        <Info width={16} height={16} className="inline text-muted-foreground" />
      </p>

      <div className="flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
          <ChevronLeft />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {emptyDaysBefore.map((key) => (
          <div key={key} className="h-8 w-8"></div>
        ))}
        {isLoading
          ? Array.from({ length: daysInMonth.length }).map((_, i) => (
              <Skeleton key={`skeleton-${i}`} className="h-8 w-8 rounded-md" />
            ))
          : daysInMonth.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const activity = activityMap.get(dateKey);
              const tasksCompleted = activity?.totalTasks || 0;
              const colorClass = getDayColorClass(tasksCompleted);

              return (
                <div
                  key={dateKey}
                  className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center text-xs font-medium",
                    colorClass,
                    {
                      "ring-2 ring-blue-500 ring-offset-1": isToday(day),
                    },
                  )}
                  title={
                    activity
                      ? `${format(day, "PPP")}\nWords Added: ${activity.wordsAdded}\nReview Sessions: ${activity.reviewSessions}\nQuizzes Taken: ${activity.quizzesTaken}\nTotal Tasks: ${activity.totalTasks}`
                      : `${format(day, "PPP")}\nNo activity`
                  }
                >
                  {format(day, "d")}
                </div>
              );
            })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t text-[10px] sm:text-xs text-muted-foreground">
        <p>Goal: Add words, review, and take quizzes daily.</p>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div
            className="h-3 w-3 rounded-sm bg-gray-200"
            title="0 tasks completed"
          ></div>
          <div
            className="h-3 w-3 rounded-sm bg-yellow-300"
            title="1 task completed"
          ></div>
          <div
            className="h-3 w-3 rounded-sm bg-yellow-400"
            title="2 tasks completed"
          ></div>
          <div
            className="h-3 w-3 rounded-sm bg-yellow-600"
            title="All 3 tasks completed"
          ></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default DailyHeatMap;
