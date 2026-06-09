"use client";
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SpacedRepetitionAlgorithm } from "@prisma/client";

const SpacedRepetition = () => {
  const { register, control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spaced Repetition Settings</CardTitle>
        <CardDescription>
          Adjust the intervals for spaced repetition to optimize your learning
          schedule.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Review Algorithm */}
        <div className="grid gap-1.5">
          <Label htmlFor="reviewAlgorithm">Review Algorithm</Label>
          <Controller
            control={control}
            name="reviewAlgorithm"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="reviewAlgorithm">
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SpacedRepetitionAlgorithm).map((algo) => (
                    <SelectItem key={algo} value={algo}>
                      {algo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Choose the algorithm that determines your review intervals.
          </p>
        </div>

        {/* Interval Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: "forgottenInterval", label: "Forgotten Interval (days)" },
            { id: "familiarInterval", label: "Familiar Interval (days)" },
            { id: "easyInterval", label: "Easy Interval (days)" },
            { id: "masteredInterval", label: "Mastered Interval (days)" },
          ].map((item) => (
            <div key={item.id} className="grid gap-1.5">
              <Label htmlFor={item.id}>{item.label}</Label>
              <Input
                id={item.id}
                type="number"
                {...register(item.id as string, { valueAsNumber: true })}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Define the number of days before a word is reviewed again based on
          your performance.
        </p>
      </CardContent>
    </Card>
  );
};

export default SpacedRepetition;
