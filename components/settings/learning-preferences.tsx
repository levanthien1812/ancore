"use client";
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const LearningPreferences = () => {
  const { register, control } = useFormContext();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Learning Preferences</CardTitle>
        <CardDescription>
          Customize your daily learning experience and how word information is
          displayed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base" htmlFor="showIpaPronunciation">
              Show IPA Pronunciation
            </Label>
            <p className="text-xs text-muted-foreground">
              Display International Phonetic Alphabet (IPA) for words.
            </p>
          </div>
          <Controller
            control={control}
            name="showIpaPronunciation"
            render={({ field }) => (
              <Switch
                id="showIpaPronunciation"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base" htmlFor="autoPlayPronunciation">
              Auto-play Pronunciation
            </Label>
            <p className="text-xs text-muted-foreground">
              Automatically play word audio when viewing details.
            </p>
          </div>
          <Controller
            control={control}
            name="autoPlayPronunciation"
            render={({ field }) => (
              <Switch
                id="autoPlayPronunciation"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="dailyNewWordsGoal">Daily New Words Goal</Label>
          <Input
            id="dailyNewWordsGoal"
            type="number"
            {...register("dailyNewWordsGoal", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">
            Set a target for how many new words you want to add each day.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningPreferences;
