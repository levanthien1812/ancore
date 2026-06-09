"use client";
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Notifications = () => {
  const { control, register } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Manage how and when you receive notifications from Ancore.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Reminder */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base" htmlFor="dailyReminderEnabled">
              Daily Reminder
            </Label>
            <p className="text-xs text-muted-foreground">
              Receive a daily reminder to review your words.
            </p>
          </div>
          <Controller
            control={control}
            name="dailyReminderEnabled"
            render={({ field }) => (
              <Switch
                id="dailyReminderEnabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Notification Time */}
        <div className="grid gap-1.5">
          <Label htmlFor="notificationTime">Notification Time</Label>
          <Input
            id="notificationTime"
            type="time"
            {...register("notificationTime")}
          />
          <p className="text-xs text-muted-foreground">
            Set the preferred time for your daily reminder.
          </p>
        </div>

        {/* Missed Review Reminder */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base" htmlFor="missedReviewReminderEnabled">
              Missed Review Reminder
            </Label>
            <p className="text-xs text-muted-foreground">
              Get a reminder if you miss a scheduled review session.
            </p>
          </div>
          <Controller
            control={control}
            name="missedReviewReminderEnabled"
            render={({ field }) => (
              <Switch
                id="missedReviewReminderEnabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Streak Reminder */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base" htmlFor="streakReminderEnabled">
              Streak Reminder
            </Label>
            <p className="text-xs text-muted-foreground">
              Receive notifications to help maintain your learning streak.
            </p>
          </div>
          <Controller
            control={control}
            name="streakReminderEnabled"
            render={({ field }) => (
              <Switch
                id="streakReminderEnabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Word of the Day */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base" htmlFor="wordOfTheDayEnabled">
              Word of the Day
            </Label>
            <p className="text-xs text-muted-foreground">
              Get a daily notification with a new word to learn.
            </p>
          </div>
          <Controller
            control={control}
            name="wordOfTheDayEnabled"
            render={({ field }) => (
              <Switch
                id="wordOfTheDayEnabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Notifications;
