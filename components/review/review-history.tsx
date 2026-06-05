"use client";
import React from "react";
import { CheckCircle, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import {
  getStudySessions,
  getStudySessionsByMonth,
} from "@/lib/actions/review.actions";
import ReviewSummaryDetail from "./review-summary-detail";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { QUERY_KEY } from "@/lib/constants/queryKey";

const ReviewHistory = () => {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  const { data: studySessions, isFetching: isFetchingStudySessions } = useQuery(
    {
      queryFn: async () => {
        if (!date) return;
        const response = await getStudySessions(date);
        return response;
      },
      queryKey: [QUERY_KEY.GET_STUDY_SESSIONS, date],
    },
  );

  const { data: datesWithSessions = [] } = useQuery({
    queryFn: async () => {
      const response = await getStudySessionsByMonth(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
      );
      return response;
    },
    queryKey: [
      QUERY_KEY.GET_STUDY_SESSIONS,
      "month",
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
    ],
  });

  const modifiers = {
    hasSession: datesWithSessions.map(
      (dateStr) => new Date(dateStr + "T00:00:00Z"),
    ),
  };

  const modifiersClassNames = {
    hasSession: "bg-blue-100 dark:bg-blue-900 font-semibold rounded-full",
  };

  return (
    <div className="flex flex-col gap-3 border rounded-lg p-2 sm:p-4 h-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-full max-w-[360px] justify-between font-normal mx-auto"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="center">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
          />
        </PopoverContent>
      </Popover>
      {isFetchingStudySessions && <div className="text-center">Loading...</div>}
      {!isFetchingStudySessions &&
        studySessions &&
        studySessions.length > 0 && (
          <div className="flex flex-col space-y-6 mt-4">
            {studySessions.map((log) => (
              <div className="relative" key={log.id}>
                {log.completedAt && (
                  <div className="absolute -top-4 z-0">
                    <Badge className="rounded-md py-2 px-4">
                      <CheckCircle width={16} height={16} />
                      Completed at:{" "}
                      <span>
                        {format(log.completedAt, "dd/MM/yyyy hh:mm a")}
                      </span>
                    </Badge>
                  </div>
                )}
                <ReviewSummaryDetail studySession={log} />
              </div>
            ))}
          </div>
        )}
      {date &&
        !isFetchingStudySessions &&
        (!studySessions || studySessions.length === 0) && (
          <p className="text-center text-muted-foreground text-lg">
            No review logs found
          </p>
        )}
      {!date && (
        <p className="text-center text-muted-foreground text-lg">
          Select a date to view review logs
        </p>
      )}
    </div>
  );
};

export default ReviewHistory;
