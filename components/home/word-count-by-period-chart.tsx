"use client";
import { getWordsCountByPeriod } from "@/lib/actions/word.actions";
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
import { Flame, Info, MoveUpRight, Sigma } from "lucide-react";
import { MasteryLevelColorCode } from "@/lib/constants/enums";
import { MasteryLevel } from "@prisma/client";

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
  const [period, setPeriod] = useState<Period>("day");
  const [quantity, setQuantity] = useState<number>(7);
  const [quantitySet, setQuantitySet] = useState<number[]>(
    periodQuantitiesMap[period].values,
  );

  const { data: wordCounts } = useQuery({
    queryKey: [QUERY_KEY.GET_WORDS_COUNT_BY_PERIOD, period, quantity],
    queryFn: async () => {
      const fetchedWordCounts = await getWordsCountByPeriod(period, quantity);
      return fetchedWordCounts;
    },
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

      <div className="flex gap-2 md:gap-3 bg-gray-50 rounded-md py-2 md:py-4 border px-3 sm:px-6 *:flex-1 mt-2">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-center">
          <div className="p-2 sm:p-3 rounded-full bg-purple-100 flex items-center justify-center">
            <Sigma width={20} height={20} className="text-purple-500" />
          </div>
          <div className="text-center md:text-start">
            <p className="text-xl font-bold">{33}</p>
            <p className="text-xs text-muted-foreground">Words this week</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-center">
          <div className="p-2 sm:p-3 rounded-full bg-blue-100 flex items-center justify-center">
            <MoveUpRight width={20} height={20} className="text-blue-500" />
          </div>
          <div className="text-center md:text-start">
            <p className="text-xl font-bold">{"+57"}%</p>
            <p className="text-xs text-muted-foreground">vs last week</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-center">
          <div className="p-2 sm:p-3 rounded-full bg-green-100 flex items-center justify-center">
            <Flame width={20} height={20} className="text-green-500" />
          </div>
          <div className="text-center md:text-start">
            <p className="text-xl font-bold">{9}</p>
            <p className="text-xs text-muted-foreground">
              Best day ({"02/05/2026"})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCountByPeriodChart;
