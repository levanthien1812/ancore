import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import { SAMPLE_TOPICS } from "@/lib/constants/enums";

const LearningPreferences = () => {
  const { register, control, watch, setValue } = useFormContext();
  const topics = watch("topics");

  const handleTopicSelect = (topic: string) => {
    const currentTopics = topics as string;
    const topicsArray = currentTopics
      ? currentTopics.split(",").map((t) => t.trim())
      : [];
    if (!topicsArray.includes(topic)) {
      if (topicsArray.length >= 3) return;
      const newTopics = [...topicsArray, topic].filter(Boolean).join(", ");
      setValue("topics", newTopics, { shouldValidate: true });
    } else {
      const newTopics = topicsArray.filter((t) => t !== topic).join(", ");
      setValue("topics", newTopics, { shouldValidate: true });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Learning Preferences</CardTitle>
        <CardDescription>Customize your learning experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-1.5">
          <Label htmlFor="nativeLanguage">Native Language</Label>
          <Input
            id="nativeLanguage"
            type="text"
            {...register("nativeLanguage")}
            placeholder="e.g. English, Spanish, French"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="level">Current Level</Label>
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select your proficiency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <div className="grid gap-2 w-full">
                <Label htmlFor="topics">Topics of interest</Label>
                <Input
                  id="topics"
                  placeholder="e.g., Technology, Business, Travel"
                  {...register("topics")}
                  autoComplete="off"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-88">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Suggestions</h4>
                  <p className="text-sm text-muted-foreground">
                    Select topics you are interested in. (maximum 3 topics)
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {SAMPLE_TOPICS.map((topic, index) => (
                    <Badge
                      key={index}
                      variant={
                        topics?.includes(topic) ? "default" : "secondary"
                      }
                      className="cursor-pointer"
                      onClick={() => handleTopicSelect(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Separate topics with commas
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="dailyGoal">Daily Goal (Words)</Label>
          <Input
            id="dailyGoal"
            type="number"
            {...register("dailyGoal", { valueAsNumber: true })}
            min={1}
            max={100}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningPreferences;
