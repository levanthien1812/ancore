"use client";
import { MasteryLevel } from "@/lib/generated/prisma/enums";
import { BarChart, Bar, XAxis, LabelList } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { getWordsCountPerMasteryLevel } from "@/lib/actions/word.actions";
import { WordsCountByMasteryLevel } from "@/lib/type";
import { defaultWordsCountByMasteryLevel } from "@/lib/constants/initial-values";

const WordCountByMasteryLevelChart = () => {
  const [wordCounts, setWordCounts] = useState<WordsCountByMasteryLevel>(
    defaultWordsCountByMasteryLevel
  );

  useEffect(() => {
    (async () => {
      const wordCounts = await getWordsCountPerMasteryLevel();
      setWordCounts(wordCounts);
    })();
  }, []);

  const chartData = Object.keys(wordCounts).map((level) => ({
    level: level,
    count: wordCounts[level as MasteryLevel],
  }));

  const chartConfig = {
    count: {
      label: "Word Count",
      color: "#2563eb",
    },
  };

  return (
    <div className="bg-background-2 p-8 rounded-2xl">
      <p className="text-[28px] font-bold text-primary">
        📊 Word counts by mastery level
      </p>
      <ChartContainer config={chartConfig} className="min-h-40 w-full">
        <BarChart accessibilityLayer data={chartData}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <XAxis
            dataKey="level"
            tickLine={false}
            tickMargin={10}
            axisLine={true}
            fontSize={14}
          />
          <Bar
            dataKey="count"
            fill="var(--color-chart-1)"
            radius={12}
            barSize={60}
          >
            <LabelList
              dataKey="count"
              position="top"
              offset={4}
              fontSize={14}
              fontWeight={"bold"}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default WordCountByMasteryLevelChart;
