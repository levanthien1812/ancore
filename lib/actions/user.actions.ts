"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import {
  onboardingFormSchema,
  signInFormSchema,
  signUpFormSchema,
  forgotPasswordFormSchema,
  userSettingsSchema,
  resetPasswordFormSchema,
} from "../validators/user.validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts-edge";
import z from "zod";
import { revalidatePath } from "next/cache";
import { UserLevel, UserSettings } from "@prisma/client";
import { authenticationAction } from "./_helpers";

export const signInWithCredentials = async (
  prevState: unknown,
  formData: FormData,
) => {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", { ...user, redirectTo: "/" });

    return {
      success: true,
      message: "Sign in successful",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "Invalid credentials",
          };
        default:
          return {
            success: false,
            message: error.cause?.err?.message,
          };
      }
    }

    return {
      success: false,
      message: "Invalid credentials",
    };
  }
};

export const signOutUser = async () => {
  await signOut({ redirectTo: "/sign-in" });
};

export const signUpWithCredentials = async (
  prevState: unknown,
  formData: FormData,
) => {
  try {
    const user = signUpFormSchema.parse({
      email: formData.get("email"),
      name: formData.get("name"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirm-password"),
    });

    if (await prisma.user.findUnique({ where: { email: user.email } })) {
      return {
        success: false,
        message: "User already exists",
      };
    }

    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashSync(user.password),
      },
    });

    return {
      success: true,
      message: "Sign up successful",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0].message,
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

export const updateUserOnboarding = async (
  prevState: unknown,
  formData: FormData,
) =>
  authenticationAction(async (userId) => {
    const validatedFields = onboardingFormSchema.safeParse({
      level: formData.get("level"),
      topics: formData.get("topics"),
      dailyGoal: parseInt(formData.get("dailyGoal") as string),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...validatedFields.data,
        level: validatedFields.data.level as UserLevel,
        onboarded: true,
      },
    });
    revalidatePath("/");
    return { success: true, message: "Welcome!", errors: {} };
  });

export const forgotPassword = async (
  prevState: unknown,
  formData: FormData,
) => {
  const user = forgotPasswordFormSchema.parse({
    email: formData.get("email"),
  });

  const existingUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!existingUser) {
    // Don't reveal if email exists or not for security
    return {
      success: true,
      message:
        "If an account with that email exists, we've sent you a password reset link.",
    };
  }

  // Generate a reset token (you might want to use a more secure method)
  const resetToken = crypto.randomUUID();
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  // Here you would typically send an email with the reset link
  // For now, we'll just return success
  console.log(`Reset link: /reset-password?token=${resetToken}`);

  return {
    success: true,
    message:
      "If an account with that email exists, we've sent you a password reset link.",
  };
};

export async function resetPassword(prevState: unknown, formData: FormData) {
  const user = resetPasswordFormSchema.parse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    token: formData.get("token"),
  });

  const existingUser = await prisma.user.findFirst({
    where: {
      resetToken: user.token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!existingUser) {
    return {
      success: false,
      message: "Invalid or expired reset token",
    };
  }

  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      password: hashSync(user.password),
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return {
    success: true,
    message:
      "Password reset successfully. You can now sign in with your new password.",
  };
}

export const stopWordOfTheDay = async () =>
  authenticationAction(async (userId) => {
    await prisma.userSettings.update({
      where: { userId: userId },
      data: {
        wordOfTheDayEnabled: false,
      },
    });
    return { success: true, message: "Word of the day stopped." };
  });

export const enableWordOfTheDay = async () =>
  authenticationAction(async (userId) => {
    await prisma.userSettings.update({
      where: { userId: userId },
      data: {
        wordOfTheDayEnabled: true,
      },
    });
    return { success: true, message: "Word of the day enabled." };
  });

export const saveUserSettings = async (
  prevState: unknown,
  formData: FormData,
) =>
  authenticationAction(async (userId) => {
    const validatedFields = userSettingsSchema.safeParse({
      wordsPerReview: parseInt(formData.get("wordsPerReview") as string),
      reviewFrequency: formData.get("reviewFrequency"),
      reviewReminderTime: formData.get("reviewReminderTime"),
      reviewDays: formData.getAll("reviewDays"),
      includeWordLevels: formData.getAll("includeWordLevels"),
      prioritizeWeakWords: formData.get("prioritizeWeakWords") === "true",
      autoRepeatForgottenWords:
        formData.get("autoRepeatForgottenWords") === "true",
      questionsPerQuiz: parseInt(formData.get("questionsPerQuiz") as string),
      quizTypes: formData.getAll("quizTypes"),
      timeLimitPerQuestion: parseInt(
        formData.get("timeLimitPerQuestion") as string,
      ),
      showResultsMode: formData.get("showResultsMode"),
      allowRetry: formData.get("allowRetry") === "true",
      includeAudioQuestions: formData.get("includeAudioQuestions") === "true",
      includeFirstLetterInHint:
        formData.get("includeFirstLetterInHint") === "true",
      showIpaPronunciation: formData.get("showIpaPronunciation") === "true",
      autoPlayPronunciation: formData.get("autoPlayPronunciation") === "true",
      dailyNewWordsGoal: parseInt(formData.get("dailyNewWordsGoal") as string),
      reviewAlgorithm: formData.get("reviewAlgorithm"),
      forgottenInterval: parseInt(formData.get("forgottenInterval") as string),
      hardInterval: parseInt(formData.get("hardInterval") as string),
      mediumInterval: parseInt(formData.get("mediumInterval") as string),
      goodInterval: parseInt(formData.get("goodInterval") as string),
      easyInterval: parseInt(formData.get("easyInterval") as string),
      dailyReminderEnabled: formData.get("dailyReminderEnabled") === "true",
      notificationTime: formData.get("notificationTime"),
      missedReviewReminderEnabled:
        formData.get("missedReviewReminderEnabled") === "true",
      streakReminderEnabled: formData.get("streakReminderEnabled") === "true",
      wordOfTheDayEnabled: formData.get("wordOfTheDayEnabled") === "true",
      timezone: formData.get("timezone"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    await prisma.userSettings.upsert({
      where: { userId: userId },
      update: validatedFields.data,
      create: {
        userId: userId,
        ...validatedFields.data,
      },
    });
    revalidatePath("/settings"); // Revalidate the settings page to show updated values
    return { success: true, message: "Settings saved successfully." };
  });

export const getUserSettings = async () =>
  authenticationAction(async (userId) => {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: userId },
    });

    if (!settings) {
      return null;
    }

    return settings;
  }, null);

export const updateUserSettingsByField = async (
  userId: string,
  field: keyof UserSettings,
  value: UserSettings[keyof UserSettings],
) =>
  authenticationAction(async (userId) => {
    await prisma.userSettings.update({
      where: { userId: userId },
      data: {
        [field]: value,
      },
    });
    revalidatePath("/settings");
  }, null);
