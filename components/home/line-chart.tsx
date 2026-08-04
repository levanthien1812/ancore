"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { MasteryLevelColorCode } from "@/lib/constants/enums";
import { getWordProgressChartData } from "@/lib/actions/word.actions";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

type TimePeriod = "week" | "month" | "quarter" | "year";
type ViewMode = "total" | "daily";

const chartConfig = {
  added: {
    label: "Added",
    color: "hsl(var(--chart-1))",
  },
  mastered: {
    label: "Mastered",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function WordProgressChart() {
  const [period, setPeriod] = useState<TimePeriod>("month");
  const [mode, setMode] = useState<ViewMode>("daily");

  const { data: wordProgressChartData, isLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_WORD_PROGRESS_CHART_DATA],
    queryFn: getWordProgressChartData,
  });

  const filteredData = useMemo(() => {
    let daysToInclude = 30;
    switch (period) {
      case "week":
        daysToInclude = 7;
        break;
      case "month":
        daysToInclude = 30;
        break;
      case "quarter":
        daysToInclude = 90;
        break;
      case "year":
        daysToInclude = 365;
        break;
    }
    return wordProgressChartData?.slice(-daysToInclude);
  }, [period, wordProgressChartData]);

  const addedKey = mode === "total" ? "addedTotal" : "addedDaily";
  const masteredKey = mode === "total" ? "masteredTotal" : "masteredDaily";

  return (
    <div className="bg-white p-4 rounded-2xl space-y-4 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-1.5">
          <p className="text-xl sm:text-2xl font-bold text-primary">
            Learning Progress
          </p>
          <Info
            width={16}
            height={16}
            className="inline text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={mode}
            onValueChange={(value: ViewMode) => setMode(value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily Words</SelectItem>
              <SelectItem value="total">Total Words</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={period}
            onValueChange={(value: TimePeriod) => setPeriod(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <AreaChart
            data={filteredData}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={MasteryLevelColorCode.New.primary}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={MasteryLevelColorCode.New.primary}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorMastered" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={MasteryLevelColorCode.Mastered.primary}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={MasteryLevelColorCode.Mastered.primary}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return format(date, "MMM d");
              }}
              minTickGap={30}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(label) =>
                    format(new Date(label), "MMM d, yyyy")
                  }
                />
              }
            />
            <Legend />
            <Area
              type="monotone"
              dataKey={addedKey}
              name="Words Added"
              stroke={MasteryLevelColorCode.New.primary}
              fillOpacity={1}
              fill="url(#colorAdded)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey={masteredKey}
              name="Words Mastered"
              stroke={MasteryLevelColorCode.Mastered.primary}
              fillOpacity={1}
              fill="url(#colorMastered)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="h-[200px] w-full rounded-xl" />
  </div>
);
