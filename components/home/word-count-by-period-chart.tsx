"use client";
import {
  getBestDay,
  getWeekComparison,
  getWordsCountByPeriod,
  getWordsThisWeek,
} from "@/lib/actions/word.actions";
import { BarChart, Bar, XAxis, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format } from "date-fns";
import { Period } from "@/lib/type";
import { Label } from "../ui/label";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { Flame, Info, MoveDownRight, MoveUpRight, Sigma } from "lucide-react";
import { MasteryLevelColorCode } from "@/lib/constants/enums";
import { MasteryLevel } from "@prisma/client";
import { Skeleton } from "../ui/skeleton";

const periodQuantitiesMap: Record<
  Period,
  { values: number[]; default: number }
> = {
  day: { values: [3, 5, 7], default: 7 },
  week: { values: [2, 4, 6, 8], default: 4 },
  month: { values: [6, 12], default: 12 },
};

const PERIOD_OPTIONS: Period[] = ["day", "week", "month"];

const WordCountByPeriodChart = () => {
  const [period, setPeriod] = useState<Period>("week");
  const [quantity, setQuantity] = useState<number>(7);
  const [quantitySet, setQuantitySet] = useState<number[]>(
    periodQuantitiesMap[period].values,
  );

  const { data: wordCounts, isLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_WORDS_COUNT_BY_PERIOD, period, quantity],
    queryFn: async () => {
      const fetchedWordCounts = await getWordsCountByPeriod(period, quantity);
      console.log({ fetchedWordCounts });
      return fetchedWordCounts;
    },
  });

  const { data: wordsThisWeek, isLoading: isLoadingWordsThisWeek } = useQuery({
    queryKey: [QUERY_KEY.GET_WORDS_THIS_WEEK],
    queryFn: getWordsThisWeek,
  });

  const { data: weekComparison, isLoading: isLoadingWeekComparison } = useQuery(
    {
      queryKey: [QUERY_KEY.GET_WEEK_COMPARISON],
      queryFn: getWeekComparison,
    },
  );

  const { data: bestDay, isLoading: isLoadingBestDay } = useQuery({
    queryKey: [QUERY_KEY.GET_BEST_DAY],
    queryFn: getBestDay,
  });
  useEffect(() => {
    setQuantitySet(periodQuantitiesMap[period].values);
    setQuantity(periodQuantitiesMap[period].default);
  }, [period]);

  const chartData = wordCounts?.map((period) => ({
    day: format(period.periodStart, "dd/MM"),
    new: period.New,
    mastered: period.Mastered,
  }));

  const chartConfig = {
    new: {
      label: "New",
      color: MasteryLevelColorCode.New.primary,
    },
    mastered: {
      label: "Mastered",
      color: MasteryLevelColorCode.Mastered.primary,
    },
  } as ChartConfig;

  const selectionInputs = (
    <div className="flex justify-center md:justify-end items-center gap-2 md:gap-4 mt-2">
      <div className="flex flex-col md:flex-row md:gap-2">
        <Label htmlFor="period" className="">
          Period
        </Label>
        <Select
          onValueChange={(value) => setPeriod(value as Period)}
          value={period}
        >
          <SelectTrigger className="bg-white min-w-40" name="period">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col md:flex-row md:gap-2">
        <Label htmlFor="quantity" className="">
          Quantity
        </Label>
        <Select
          onValueChange={(value) => setQuantity(parseInt(value))}
          value={quantity.toString()}
        >
          <SelectTrigger className="bg-white min-w-40" name="quantity">
            <SelectValue placeholder="Select CEFR level" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {quantitySet.map((quantity) => (
                <SelectItem key={quantity} value={quantity.toString()}>
                  {quantity}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const chart = (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <defs>
          {Object.entries(MasteryLevelColorCode).map(([level, color]) => (
            <linearGradient
              key={level}
              id={`grad-${level}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor={color.light} stopOpacity={1} />
              <stop offset="40%" stopColor={color.primary} stopOpacity={1} />
            </linearGradient>
          ))}
        </defs>
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={true}
          fontSize={12}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="new"
          fill={`url(#grad-${MasteryLevel.New})`}
          radius={[12, 12, 0, 0]}
          fontSize={14}
        />
        <Bar
          dataKey="mastered"
          fill={`url(#grad-${MasteryLevel.Mastered})`}
          radius={[12, 12, 0, 0]}
          fontSize={14}
        />
      </BarChart>
    </ChartContainer>
  );

  const statistics = (
    <div className="flex gap-2 md:gap-3 bg-gray-50 rounded-md py-2 md:py-4 border px-3 sm:px-6 justify-around mt-2">
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-center">
        <div className="p-2 sm:p-3 rounded-full bg-purple-100 flex items-center justify-center">
          <Sigma width={20} height={20} className="text-purple-500" />
        </div>
        <div className="text-center md:text-start">
          {isLoadingWordsThisWeek ? (
            <Skeleton className="h-6 w-12" />
          ) : (
            <p className="text-xl font-bold">{wordsThisWeek}</p>
          )}
          <p className="text-xs text-muted-foreground">Words this week</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-center">
        <div className="p-2 sm:p-3 rounded-full bg-blue-100 flex items-center justify-center">
          {(weekComparison?.percentageChange || 0) < 0 ? (
            <MoveDownRight width={20} height={20} className="text-red-500" />
          ) : (
            <MoveUpRight width={20} height={20} className="text-blue-500" />
          )}
        </div>
        <div className="text-center md:text-start">
          {isLoadingWeekComparison ? (
            <Skeleton className="h-6 w-12" />
          ) : (
            <p className="text-xl font-bold">
              {Math.round(weekComparison?.percentageChange || 0)}%
            </p>
          )}
          <p className="text-xs text-muted-foreground">vs last week</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-center">
        <div className="p-2 sm:p-3 rounded-full bg-green-100 flex items-center justify-center">
          <Flame width={20} height={20} className="text-green-500" />
        </div>
        <div className="text-center md:text-start">
          {isLoadingBestDay ? (
            <Skeleton className="h-6 w-12" />
          ) : (
            <p className="text-xl font-bold">{bestDay?.count || 0}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Best day ({format(bestDay?.date || new Date(), "dd/MM/yyyy")})
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-2xl gap-2 h-full">
      <p className="text-2xl font-bold text-primary">
        Word counts by periods{" "}
        <span>
          <Info
            width={18}
            height={18}
            className="inline text-muted-foreground"
          />
        </span>
      </p>

      {isLoading || !wordCounts ? (
        <LoadingSkeleton />
      ) : (
        <>
          {selectionInputs}
          {chart}
          {statistics}
        </>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="flex flex-col gap-4 mt-2">
    <div className="flex justify-center md:justify-end gap-2 md:gap-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-10 w-40" />
    </div>
    <Skeleton className="h-[260px] w-full rounded-xl" />
    <div className="flex gap-2 md:gap-3 bg-gray-50 rounded-md py-4 border px-6 mt-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-1 gap-2 items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-12 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default WordCountByPeriodChart;
