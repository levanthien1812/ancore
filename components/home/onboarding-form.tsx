"use client";
import { startTransition, useActionState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserOnboarding } from "@/lib/actions/user.actions";
import FieldError from "../shared/field-error";
import { onboardingFormSchema } from "@/lib/validators";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import { SAMPLE_TOPICS } from "@/lib/constants/enums";

type OnboardingFormData = z.infer<typeof onboardingFormSchema>;

const initialState = {
  success: false,
  message: "",
  errors: {
    level: [],
    topics: [],
    dailyGoal: [],
  },
};

export const OnboardingForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [state, formAction, isPending] = useActionState(
    updateUserOnboarding,
    initialState
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      level: "",
      topics: "",
      dailyGoal: 15,
    },
  });

  const allValues = watch();

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const onSubmit = (data: OnboardingFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    startTransition(() => {
      formAction(formData);
    });
  };

  const handleTopicSelect = (topic: string) => {
    const currentTopics = allValues.topics;
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
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="level">Your current English level</Label>
        <Controller
          name="level"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldError error={errors.level?.message} />
      </div>

      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <div className="grid gap-2 w-full">
              <Label htmlFor="topics">Topics you are interested in</Label>
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
                      allValues.topics?.includes(topic)
                        ? "default"
                        : "secondary"
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
        <p className="text-sm text-muted-foreground">
          Separate topics with a comma.
        </p>
        <FieldError error={errors.topics?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dailyGoal">Daily learning goal</Label>
        <Controller
          name="dailyGoal"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(val) => field.onChange(parseInt(val))}
              value={field.value.toString()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your daily goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <FieldError error={errors.dailyGoal?.message} />
      </div>

      <Button type="submit" disabled={isPending} className="mt-4">
        {isPending ? "Saving..." : "Get Started"}
      </Button>
    </form>
  );
};
