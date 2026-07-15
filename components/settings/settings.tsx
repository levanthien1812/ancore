"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import LearningPreferences from "./learning-preferences";
import ReviewSettings from "./review-settings";
import QuizSettings from "./quiz-settings";
import SpacedRepetitionSettings from "./spaced-repetition";
import Notifications from "./notifications";
import { FormProvider, useForm } from "react-hook-form";
import {
  INITIAL_ACTION_STATE,
  INITIAL_USER_SETTINGS,
} from "@/lib/constants/initial-values";
import { Button } from "@/components/ui/button";
import { saveUserSettings } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useActionState, useEffect } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

const Settings = () => {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [state, action, isPending] = useActionState(
    saveUserSettings,
    INITIAL_ACTION_STATE,
  );

  const methods = useForm({
    defaultValues: user?.settings || INITIAL_USER_SETTINGS,
  });

  const onSubmit = async (data: typeof INITIAL_USER_SETTINGS) => {
    const formData = new FormData();
    for (const key in data) {
      const value = data[key as keyof typeof data];
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item.toString()));
      } else if (typeof value === "boolean") {
        formData.append(key, value.toString());
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    }
    startTransition(() => {
      action(formData);
    });
  };

  useEffect(() => {
    if (state.success) {
      toast.success("Settings saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      queryClient.invalidateQueries({ queryKey: ["wordsToReview"] });
    } else if (state.message) {
      toast.error("Failed to save settings:" + state.message);
    }
  }, [state, queryClient]);

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="">
          <Tabs
            defaultValue="learning-preferences"
            orientation="vertical"
            className="flex-row gap-6 hidden md:flex"
          >
            <TabsList className="flex flex-col h-fit bg-transparent  rounded-none p-0 items-stretch min-w-[180px]">
              <TabsTrigger
                value="learning-preferences"
                className="justify-start px-4 py-2 data-[state=active]:bg-muted"
              >
                Learning Preferences
              </TabsTrigger>
              <TabsTrigger
                value="review-settings"
                className="justify-start px-4 py-2 data-[state=active]:bg-muted"
              >
                Review Settings
              </TabsTrigger>
              <TabsTrigger
                value="quiz-settings"
                className="justify-start px-4 py-2 data-[state=active]:bg-muted"
              >
                Quiz Settings
              </TabsTrigger>
              <TabsTrigger
                value="space-repetition"
                className="justify-start px-4 py-2 data-[state=active]:bg-muted"
              >
                Space Repetition
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="justify-start px-4 py-2 data-[state=active]:bg-muted"
              >
                Notifications
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 flex flex-col gap-2 custom-scrollbar-y h-[70vh] custom-scrollbar-y">
              <TabsContent
                value="learning-preferences"
                className="m-0 border-none p-0 shadow-none"
              >
                <LearningPreferences />
              </TabsContent>
              <TabsContent
                value="review-settings"
                className="m-0 border-none p-0 shadow-none"
              >
                <ReviewSettings />
              </TabsContent>
              <TabsContent
                value="quiz-settings"
                className="m-0 border-none p-0 shadow-none"
              >
                <QuizSettings />
              </TabsContent>
              <TabsContent
                value="space-repetition"
                className="m-0 border-none p-0 shadow-none"
              >
                <SpacedRepetitionSettings />
              </TabsContent>
              <TabsContent
                value="notifications"
                className="m-0 border-none p-0 shadow-none"
              >
                <Notifications />
              </TabsContent>
            </div>
          </Tabs>
          <Accordion
            type="single"
            collapsible
            className="w-full block md:hidden h-[70vh] overflow-y-auto no-scrollbar"
          >
            <AccordionItem value="learning-preferences">
              <AccordionTrigger>Learning Preferences</AccordionTrigger>
              <AccordionContent>
                <LearningPreferences />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="review-settings">
              <AccordionTrigger>Review Settings</AccordionTrigger>
              <AccordionContent>
                <ReviewSettings />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="quiz-settings">
              <AccordionTrigger>Quiz Settings</AccordionTrigger>
              <AccordionContent>
                <QuizSettings />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="space-repetition">
              <AccordionTrigger>Space Repetition</AccordionTrigger>
              <AccordionContent>
                <SpacedRepetitionSettings />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="notifications">
              <AccordionTrigger>Notifications</AccordionTrigger>
              <AccordionContent>
                <Notifications />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-end gap-2 mt-2 p-2 w-full rounded-md border bg-diagonal-stripes bg-blue-200">
            <DialogClose asChild>
              <Button variant={"secondary"}>Cancel</Button>
            </DialogClose>
            <Button type="submit" isLoading={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default Settings;
