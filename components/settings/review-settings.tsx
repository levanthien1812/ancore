"use client";
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import { DayOfWeek, MasteryLevel, ReviewFrequency } from "@prisma/client";
import { REQUIRED_REVIEW_MASTERY_LEVELS } from "@/lib/constants/constant";

const ReviewSettings = () => {
  const { register, control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Settings</CardTitle>
        <CardDescription>
          Configure how you review your vocabulary and manage your daily study
          sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Words Per Review */}
        <div className="grid gap-1.5">
          <Label htmlFor="wordsPerReview">Words Per Review Session</Label>
          <Input
            id="wordsPerReview"
            type="number"
            {...register("wordsPerReview", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of words to include in a single review session.
          </p>
        </div>

        {/* Review Frequency */}
        <div className="grid gap-1.5">
          <Label htmlFor="reviewFrequency">Review Frequency</Label>
          <Controller
            control={control}
            name="reviewFrequency"
            render={({ field }) => (
              <Select
                onValueChange={(val) =>
                  setTimeout(() => field.onChange(val), 0)
                }
                value={field.value}
              >
                <SelectTrigger id="reviewFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ReviewFrequency).map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {freq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Review Reminder Time */}
        <div className="grid gap-1.5">
          <Label htmlFor="reviewReminderTime">Review Reminder Time</Label>
          <Input
            id="reviewReminderTime"
            type="time"
            {...register("reviewReminderTime")}
          />
          <p className="text-xs text-muted-foreground">
            Preferred time to receive a reminder for your review session.
          </p>
        </div>

        {/* Review Days */}
        <div className="grid gap-3">
          <Label>Active Review Days</Label>
          <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
            {Object.values(DayOfWeek).map((day) => (
              <div key={day} className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="reviewDays"
                  render={({ field }) => (
                    <Checkbox
                      id={`day-${day}`}
                      checked={field.value?.includes(day)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...(field.value || []), day]
                          : field.value?.filter((v: string) => v !== day);
                        setTimeout(() => field.onChange(newValue), 0);
                      }}
                    />
                  )}
                />
                <Label htmlFor={`day-${day}`} className="text-sm font-normal">
                  {day}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Mastery Levels to Include */}
        <div className="grid gap-3">
          <Label>Include Mastery Levels</Label>
          <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
            {Object.values(MasteryLevel).map((level) => (
              <div key={level} className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="includeWordLevels"
                  render={({ field }) => (
                    <Checkbox
                      id={`level-${level}`}
                      checked={field.value?.includes(level)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...(field.value || []), level]
                          : field.value?.filter((v: string) => v !== level);
                        setTimeout(() => field.onChange(newValue), 0);
                      }}
                      disabled={REQUIRED_REVIEW_MASTERY_LEVELS.includes(level)}
                    />
                  )}
                />
                <Label
                  htmlFor={`level-${level}`}
                  className="text-sm font-normal"
                >
                  {level}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Boolean Toggles */}
        <div className="space-y-4">
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base" htmlFor="prioritizeWeakWords">
                Prioritize Weak Words
              </Label>
              <p className="text-xs text-muted-foreground">
                Focus more on words with lower mastery levels.
              </p>
            </div>
            <Controller
              control={control}
              name="prioritizeWeakWords"
              render={({ field }) => (
                <Switch
                  id="prioritizeWeakWords"
                  checked={!!field.value}
                  onCheckedChange={(val) =>
                    setTimeout(() => field.onChange(val), 0)
                  }
                />
              )}
            />
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base" htmlFor="autoRepeatForgottenWords">
                Auto-repeat Forgotten Words
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically re-queue words marked as forgotten in the same
                session.
              </p>
            </div>
            <Controller
              control={control}
              name="autoRepeatForgottenWords"
              render={({ field }) => (
                <Switch
                  id="autoRepeatForgottenWords"
                  checked={!!field.value}
                  onCheckedChange={(val) =>
                    setTimeout(() => field.onChange(val), 0)
                  }
                />
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewSettings;
