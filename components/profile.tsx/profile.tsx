"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormProvider, useForm } from "react-hook-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DialogClose } from "../ui/dialog";
import { Button } from "../ui/button";
import Account from "./account";
import LearningPreferences from "./learning-preference";
import { startTransition, useActionState, useEffect } from "react";
import { saveProfile } from "@/lib/actions/user.actions";
import { INITIAL_ACTION_STATE } from "@/lib/constants/initial-values";
import { UserProfile } from "@/lib/type";
import { useLayout } from "../layout/layout-context";
import { UserLevel } from "@prisma/client";
import { DEFAULT_DAILY_WORD_GOAL } from "@/lib/constants/constant";
import { toast } from "sonner";

const Profile = () => {
  const [state, action, isPending] = useActionState(
    saveProfile,
    INITIAL_ACTION_STATE,
  );

  const { user } = useLayout();

  const methods = useForm({
    defaultValues: {
      email: user?.email || "",
      name: user?.name || "",
      image: user?.image || "",
      level: user?.level || UserLevel.Beginner,
      topics: user?.topics || "",
      nativeLanguage: user?.nativeLanguage || "English",
      dailyGoal: user?.dailyGoal || DEFAULT_DAILY_WORD_GOAL,
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: UserProfile) => {
    const formData = new FormData();
    for (const key in data) {
      if (key === "image") {
        formData.append("image", "");
        continue;
      }
      const value = data[key as keyof UserProfile];
      if (value) {
        formData.append(key, String(value));
      }
    }
    startTransition(async () => {
      await action(formData);
    });
  };

  useEffect(() => {
    if (!state.message) return;
    if (state.success) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="">
          <Tabs
            defaultValue="account"
            orientation="vertical"
            className="flex-row gap-6 hidden md:flex"
          >
            <TabsList className="flex flex-col h-fit bg-transparent  rounded-none p-0 items-stretch min-w-[180px]">
              <TabsTrigger
                value="account"
                className="justify-start px-4 py-2 data-[state=active]:bg-muted"
              >
                Account
              </TabsTrigger>
              <TabsTrigger
                value="learning-preferences"
                className="justify-start px-4 py-2 data-[state=active]:bg-muted"
              >
                Learning Preferences
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 flex flex-col gap-2 custom-scrollbar-y h-[70vh] custom-scrollbar-y">
              <TabsContent
                value="account"
                className="m-0 border-none p-0 shadow-none"
              >
                <Account />
              </TabsContent>
              <TabsContent
                value="learning-preferences"
                className="m-0 border-none p-0 shadow-none"
              >
                <LearningPreferences />
              </TabsContent>
            </div>
          </Tabs>
          <Accordion
            type="single"
            collapsible
            className="w-full block md:hidden h-[70vh] overflow-y-auto no-scrollbar"
          >
            <AccordionItem value="learning-preferences">
              <AccordionTrigger>Account</AccordionTrigger>
              <AccordionContent>
                <Account />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="review-settings">
              <AccordionTrigger>Learning Preferences</AccordionTrigger>
              <AccordionContent>
                <LearningPreferences />
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

export default Profile;
