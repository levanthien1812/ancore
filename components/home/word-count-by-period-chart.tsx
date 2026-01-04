"use client";
import { getWordsCountByPeriod } from "@/lib/actions/word.actions";
import { BarChart, Bar, XAxis } from "recharts";
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
    periodQuantitiesMap[period].values
  );

  const { data: wordCounts } = useQuery({
    queryKey: ["getWordsCountByPeriod", period, quantity],
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
    day: format(period.periodStart, "dd/MM/yyyy"),
    new: period.New,
    mastered: period.Mastered,
  }));

  const chartConfig = {
    new: {
      label: "New",
      color: "#2563eb",
    },
    mastered: {
      label: "Mastered",
      color: "#60a5fa",
    },
  } as ChartConfig;

  return (
    <div className="bg-background-2 p-8 rounded-2xl">
      <p className="text-[28px] font-bold text-primary">
        📊 Word counts by periods
      </p>
      <div className="flex justify-end items-center gap-2 mt-2">
        <div>
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
        <div>
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
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={10}
            axisLine={true}
            fontSize={14}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="new"
            fill="var(--color-chart-1)"
            radius={8}
            fontSize={14}
          />
          <Bar
            dataKey="mastered"
            fill="var(--color-chart-2)"
            radius={8}
            fontSize={14}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default WordCountByPeriodChart;
