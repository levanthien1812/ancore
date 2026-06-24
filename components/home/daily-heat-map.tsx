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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const DailyHeatMap = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedField, setSelectedField] = useState<
    "totalTasks" | "wordsAdded" | "reviewSessions" | "quizzesTaken"
  >("totalTasks");

  const fieldConfig = {
    totalTasks: {
      goal: "Goal: Add words, review, and take quizzes daily.",
      levels: [
        { min: 0, max: 0, color: "bg-gray-200", title: "0 tasks completed" },
        { min: 1, max: 1, color: "bg-yellow-300", title: "1 task completed" },
        { min: 2, max: 2, color: "bg-yellow-400", title: "2 tasks completed" },
        { min: 3, max: Infinity, color: "bg-yellow-600", title: "All 3 tasks completed" },
      ],
    },
    wordsAdded: {
      goal: "Goal: Add new words daily.",
      levels: [
        { min: 0, max: 0, color: "bg-gray-200", title: "0 words added" },
        { min: 1, max: 4, color: "bg-yellow-300", title: "1 - 4 words added" },
        { min: 5, max: 9, color: "bg-yellow-400", title: "5 - 9 words added" },
        { min: 10, max: 14, color: "bg-yellow-500", title: "10 - 14 words added" },
        { min: 15, max: Infinity, color: "bg-yellow-600", title: "15+ words added" },
      ],
    },
    reviewSessions: {
      goal: "Goal: Complete review sessions daily.",
      levels: [
        { min: 0, max: 0, color: "bg-gray-200", title: "0 review sessions completed" },
        { min: 1, max: 1, color: "bg-yellow-300", title: "1 review session completed" },
        { min: 2, max: 2, color: "bg-yellow-400", title: "2 review sessions completed" },
        { min: 3, max: Infinity, color: "bg-yellow-600", title: "3+ review sessions completed" },
      ],
    },
    quizzesTaken: {
      goal: "Goal: Take quizzes daily.",
      levels: [
        { min: 0, max: 0, color: "bg-gray-200", title: "0 quizzes taken" },
        { min: 1, max: 1, color: "bg-yellow-300", title: "1 quiz taken" },
        { min: 2, max: 2, color: "bg-yellow-400", title: "2 quizzes taken" },
        { min: 3, max: Infinity, color: "bg-yellow-600", title: "3+ quizzes taken" },
      ],
    },
  };

  const currentConfig = fieldConfig[selectedField];

  const getDayColorClass = (value: number) => {
    const matchedLevel = currentConfig.levels.find(
      (level) => value >= level.min && value <= level.max
    );
    return matchedLevel ? matchedLevel.color : "bg-gray-200";
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <p className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-1.5">
          Activity Heat Map{" "}
          <Info width={16} height={16} className="inline text-muted-foreground" />
        </p>

        <Select
          value={selectedField}
          onValueChange={(value) =>
            setSelectedField(
              value as "totalTasks" | "wordsAdded" | "reviewSessions" | "quizzesTaken"
            )
          }
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="totalTasks">Total Tasks</SelectItem>
            <SelectItem value="wordsAdded">Words Added</SelectItem>
            <SelectItem value="reviewSessions">Review Sessions</SelectItem>
            <SelectItem value="quizzesTaken">Quizzes Taken</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
              const fieldValue = activity ? activity[selectedField] : 0;
              const colorClass = getDayColorClass(fieldValue);

              return (
                <Popover key={dateKey}>
                  <PopoverTrigger className="flex justify-center">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer hover:ring-2 hover:ring-gray-200 ring-offset-1",
                        colorClass,
                        {
                          "ring-2 ring-blue-500 ring-offset-1": isToday(day),
                        },
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3 space-y-2">
                    <p className="text-primary-2 font-bold text-sm border-b pb-1">
                      {format(day, "PPP")}
                    </p>
                    {activity ? (
                      <div className="space-y-1">
                        <div
                          className={cn(
                            "flex items-center justify-between gap-4 text-xs px-2 py-1 rounded-md",
                            selectedField === "wordsAdded"
                              ? "bg-yellow-50 text-yellow-700 font-semibold"
                              : "text-muted-foreground"
                          )}
                        >
                          <span>Words Added</span>
                          <span
                            className={cn(
                              "font-bold text-sm",
                              selectedField === "wordsAdded"
                                ? "text-yellow-700"
                                : "text-primary"
                            )}
                          >
                            {activity.wordsAdded}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex items-center justify-between gap-4 text-xs px-2 py-1 rounded-md",
                            selectedField === "reviewSessions"
                              ? "bg-yellow-50 text-yellow-700 font-semibold"
                              : "text-muted-foreground"
                          )}
                        >
                          <span>Review Sessions</span>
                          <span
                            className={cn(
                              "font-bold text-sm",
                              selectedField === "reviewSessions"
                                ? "text-yellow-700"
                                : "text-primary"
                            )}
                          >
                            {activity.reviewSessions}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex items-center justify-between gap-4 text-xs px-2 py-1 rounded-md",
                            selectedField === "quizzesTaken"
                              ? "bg-yellow-50 text-yellow-700 font-semibold"
                              : "text-muted-foreground"
                          )}
                        >
                          <span>Quizzes Taken</span>
                          <span
                            className={cn(
                              "font-bold text-sm",
                              selectedField === "quizzesTaken"
                                ? "text-yellow-700"
                                : "text-primary"
                            )}
                          >
                            {activity.quizzesTaken}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex items-center justify-between gap-4 text-xs px-2 py-1 rounded-md border-t pt-1.5 mt-1",
                            selectedField === "totalTasks"
                              ? "bg-yellow-50 text-yellow-700 font-semibold"
                              : "text-muted-foreground font-medium"
                          )}
                        >
                          <span>Total Tasks</span>
                          <span
                            className={cn(
                              "font-bold text-sm",
                              selectedField === "totalTasks"
                                ? "text-yellow-700"
                                : "text-primary"
                            )}
                          >
                            {activity.totalTasks}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-xs px-2">No activity</p>
                    )}
                  </PopoverContent>
                </Popover>
              );
            })}
      </div>

      <div className="flex flex-col items-center justify-between gap-2 pt-4 border-t text-[10px] sm:text-xs text-muted-foreground w-full">
        <p>{currentConfig.goal}</p>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          {currentConfig.levels.map((level, idx) => (
            <div
              key={idx}
              className={cn("h-3 w-3 rounded-sm", level.color)}
              title={level.title}
            ></div>
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default DailyHeatMap;
