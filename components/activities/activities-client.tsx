"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getDailyActivities,
  getActivitiesDateRange,
  ActivityItem,
} from "@/lib/actions/activity.actions";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { format, isToday, isYesterday, subDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BookOpen,
  Star,
  CircleQuestionMark,
  Mic,
  CalendarDays,
  CalendarX,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import ActivityCard from "./activity-card";

type ActivityTypeFilter =
  | "word_added"
  | "review_session"
  | "quiz"
  | "conversation";

const ALL_TYPES: ActivityTypeFilter[] = [
  "word_added",
  "review_session",
  "quiz",
  "conversation",
];

const typeConfig: Record<
  ActivityTypeFilter,
  {
    label: string;
    singular: string;
    Icon: React.ElementType;
    activeClass: string;
    countClass: string;
    dotClass: string;
  }
> = {
  word_added: {
    label: "Words",
    singular: "Word",
    Icon: BookOpen,
    activeClass: "bg-blue-600 text-white hover:bg-blue-700 shadow-xs",
    countClass: "bg-blue-100 text-blue-700",
    dotClass: "bg-blue-500",
  },
  review_session: {
    label: "Reviews",
    singular: "Review",
    Icon: Star,
    activeClass: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-xs",
    countClass: "bg-yellow-100 text-yellow-700",
    dotClass: "bg-yellow-500",
  },
  quiz: {
    label: "Quizzes",
    singular: "Quiz",
    Icon: CircleQuestionMark,
    activeClass: "bg-purple-600 text-white hover:bg-purple-700 shadow-xs",
    countClass: "bg-purple-100 text-purple-700",
    dotClass: "bg-purple-500",
  },
  conversation: {
    label: "Talk",
    singular: "Talk",
    Icon: Mic,
    activeClass: "bg-green-600 text-white hover:bg-green-700 shadow-xs",
    countClass: "bg-green-100 text-green-700",
    dotClass: "bg-green-500",
  },
};

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatSelectedDate(dateStr: string): string {
  try {
    const date = parseLocalDate(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEE, MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

function todayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export default function ActivitiesClient() {
  const [selectedDate, setSelectedDate] = useState<string>(todayString());
  const [selectedTypes, setSelectedTypes] =
    useState<ActivityTypeFilter[]>(ALL_TYPES);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  const today = todayString();
  const isViewingToday = selectedDate === today;

  const { data: activities, isLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_DAILY_ACTIVITIES, selectedDate],
    queryFn: () => getDailyActivities(selectedDate),
  });

  const { data: dateRange } = useQuery({
    queryKey: ["getActivitiesDateRange"],
    queryFn: () => getActivitiesDateRange(),
  });

  const firstDate = dateRange?.firstDate ?? undefined;

  const handlePrevDay = () => {
    const prev = subDays(parseLocalDate(selectedDate), 1);
    setSelectedDate(format(prev, "yyyy-MM-dd"));
  };

  const handleNextDay = () => {
    if (isViewingToday) return;
    const next = addDays(parseLocalDate(selectedDate), 1);
    setSelectedDate(format(next, "yyyy-MM-dd"));
  };

  const toggleType = (type: ActivityTypeFilter) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.length === 1
          ? prev // keep at least one selected
          : prev.filter((t) => t !== type)
        : [...prev, type],
    );
  };

  const selectAllTypes = () => {
    setSelectedTypes(ALL_TYPES);
  };

  const filteredActivities: ActivityItem[] = (activities ?? []).filter((a) =>
    selectedTypes.includes(a.type as ActivityTypeFilter),
  );

  const countByType = (type: ActivityTypeFilter) =>
    (activities ?? []).filter((a) => a.type === type).length;

  return (
    <div className="mx-auto p-2 sm:p-4 bg-gray-50 min-h-full space-y-3 sm:space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2.5 rounded-2xl">
            <CalendarDays className="text-primary" width={24} height={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Activities
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Review what you accomplished each day
            </p>
          </div>
        </div>

        {/* Date Stepper Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white p-1 rounded-2xl border shadow-xs">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl"
            onClick={handlePrevDay}
            title="Previous day"
          >
            <ChevronLeft width={18} height={18} />
          </Button>

          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 gap-1.5 font-semibold text-xs sm:text-sm text-gray-800 hover:bg-gray-100 rounded-xl"
              >
                <CalendarDays width={14} height={14} className="text-primary" />
                {formatSelectedDate(selectedDate)}
                <ChevronDown
                  width={14}
                  height={14}
                  className="text-muted-foreground"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="center">
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                Jump to date
              </label>
              <input
                type="date"
                className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedDate}
                max={today}
                min={firstDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                    setDatePopoverOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl disabled:opacity-30"
            onClick={handleNextDay}
            disabled={isViewingToday}
            title="Next day"
          >
            <ChevronRight width={18} height={18} />
          </Button>

          {!isViewingToday && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs font-medium ml-1 rounded-lg text-primary border-primary/30 hover:bg-primary/5"
              onClick={() => setSelectedDate(today)}
            >
              Today
            </Button>
          )}
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {/* Total Summary */}
        <div className="col-span-1 bg-white p-3 rounded-2xl border shadow-xs flex flex-col justify-start sm:justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Total Activities
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {isLoading ? "-" : (activities?.length ?? 0)}
            </span>
            <span className="text-xs text-muted-foreground">recorded</span>
          </div>
        </div>

        {/* 4 Type Badges */}
        <div className="gap-2 col-span-2 sm:col-span-4 grid grid-cols-2 sm:grid-cols-4">
          {ALL_TYPES.map((type) => {
            const { label, Icon, countClass, dotClass } = typeConfig[type];
            const count = isLoading ? "-" : countByType(type);
            const isSelected = selectedTypes.includes(type);

            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={cn(
                  "bg-white p-3 rounded-2xl border shadow-xs text-left transition-all cursor-pointer flex flex-col justify-between hover:border-gray-300",
                  isSelected
                    ? "ring-2 ring-primary/20 border-primary/30"
                    : "opacity-60 grayscale-[30%]",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">
                    {label}
                  </span>
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isSelected ? dotClass : "bg-gray-300",
                    )}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xl font-bold text-gray-900">
                    {count}
                  </span>
                  <div className={cn("p-1.5 rounded-lg", countClass)}>
                    <Icon width={14} height={14} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-white p-2.5 rounded-2xl border shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground px-1">
            Filter:
          </span>
          {ALL_TYPES.map((type) => {
            const { label, Icon, activeClass } = typeConfig[type];
            const isActive = selectedTypes.includes(type);
            return (
              <Button
                key={type}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "gap-1.5 text-xs h-7 px-2.5 font-medium rounded-xl transition-all",
                  isActive
                    ? activeClass
                    : "bg-white text-gray-600 hover:bg-gray-50",
                )}
                onClick={() => toggleType(type)}
              >
                <Icon width={12} height={12} />
                {label}
              </Button>
            );
          })}
        </div>

        {selectedTypes.length < ALL_TYPES.length && (
          <Button
            variant="ghost"
            size="sm"
            onClick={selectAllTypes}
            className="h-7 text-xs text-primary gap-1 font-medium hover:bg-primary/10 rounded-xl"
          >
            <RotateCcw width={12} height={12} />
            Show all types
          </Button>
        )}
      </div>

      {/* Timeline Section */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-xs">
            <div className="bg-primary/10 p-4 rounded-full mb-3">
              <CalendarX className="text-primary" width={32} height={32} />
            </div>
            <p className="font-bold text-base sm:text-lg text-gray-900">
              No activities found
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1">
              {activities &&
              activities.length > 0 &&
              selectedTypes.length < ALL_TYPES.length
                ? "Activities exist for this day but are hidden by your filter. Try enabling more activity types."
                : `No activity was recorded on ${formatSelectedDate(selectedDate)}.`}
            </p>
            {activities &&
              activities.length > 0 &&
              selectedTypes.length < ALL_TYPES.length && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllTypes}
                  className="mt-4 rounded-xl text-xs font-semibold"
                >
                  Reset filters
                </Button>
              )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredActivities.map((item) => (
              <ActivityCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
