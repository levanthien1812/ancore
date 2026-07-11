"use server";

import { signIn, signOut } from "@/auth";
import {
  onboardingFormSchema,
  signInFormSchema,
  signUpFormSchema,
  forgotPasswordFormSchema,
  userSettingsSchema,
  resetPasswordFormSchema,
  verifyEmailFormSchema,
  userProfileSchema,
} from "../validators/user.validators";
import { prisma } from "@/db/prisma";
import { compare, hashSync } from "bcrypt-ts-edge";
import { revalidatePath } from "next/cache";
import { User, UserLevel, UserSettings } from "@prisma/client";
import { authenticationAction, catchAsyncAuthAction } from "./_helpers";
import { resend } from "../resend";
import { emailVerificationTemplate } from "../email-templates/email-verification";
import { redirect } from "next/navigation";
import {
  generateResetPasswordToken,
  generateVerificationToken,
} from "../utils/generate-token";
import { resetPasswordTemplate } from "../email-templates/reset-password-template";
import { createHash } from "crypto";
import { add } from "date-fns";
import { INITIAL_USER_SETTINGS } from "../constants/initial-values";
import { UserProfile } from "../type";

export const signInWithCredentials = async (
  prevState: unknown,
  formData: FormData,
) =>
  catchAsyncAuthAction(async () => {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", { ...user, redirectTo: "/" });

    return {
      success: true,
      message: "Sign in successful",
    };
  });

export const signOutUser = async () => {
  await signOut({ redirectTo: "/sign-in" });
};

export const signUpWithCredentials = async (
  prevState: unknown,
  formData: FormData,
) =>
  catchAsyncAuthAction(async () => {
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

    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashSync(user.password),
      },
    });

    const verificationToken = generateVerificationToken();

    const createdEmailToken = await prisma.verifyEmailToken.create({
      data: {
        token: verificationToken.hash,
        userId: createdUser.id,
        expiresAt: add(new Date(), {
          minutes: Number(process.env.EMAIL_TOKEN_EXPIRES_IN || 60),
        }),
      },
    });

    try {
      await sendEmailVerification(createdUser, verificationToken.token);
    } catch (error) {
      console.error(error);

      await prisma.verifyEmailToken.delete({
        where: { id: createdEmailToken.id },
      });

      return {
        success: false,
        message: "Failed to send verification email. Please try again later.",
      };
    }

    redirect(`/verify-email?email=${createdUser.email}`);
  });

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

export const forgotPassword = async (prevState: unknown, formData: FormData) =>
  catchAsyncAuthAction(async () => {
    const user = forgotPasswordFormSchema.parse({
      email: formData.get("email"),
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      return {
        success: false,
        message: "User doesn't exist!",
      };
    }

    const resetToken = generateResetPasswordToken();

    const createdResetToken = await prisma.resetPasswordToken.create({
      data: {
        userId: existingUser.id,
        token: resetToken.hash,
        expiresAt: add(new Date(), {
          minutes: Number(process.env.RESET_TOKEN_EXPIRES_IN || 5),
        }),
      },
    });

    try {
      await sendResetPasswordEmail(existingUser, resetToken.token);
    } catch (error) {
      console.error(error);

      await prisma.resetPasswordToken.delete({
        where: { id: createdResetToken.id },
      });

      return {
        success: false,
        message: "Failed to send reset password email. Please try again later.",
      };
    }

    return {
      success: true,
      message:
        "If an account with that email exists, we've sent you a password reset link.",
    };
  });

export const resendVerificationEmail = async (formData: FormData) => {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      success: false,
      message: "Email is required",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!existingUser) {
    return {
      success: false,
      message: "User not found",
    };
  }
  console.log(existingUser);

  if (existingUser.emailVerified) {
    return {
      success: false,
      message: "Email already verified",
    };
  }

  const verificationToken = generateVerificationToken();

  const createdEmailToken = await prisma.verifyEmailToken.create({
    data: {
      token: verificationToken.hash,
      userId: existingUser.id,
      expiresAt: add(new Date(), {
        minutes: Number(process.env.EMAIL_TOKEN_EXPIRES_IN || 60),
      }),
    },
  });

  try {
    await sendEmailVerification(existingUser, verificationToken.token);
  } catch (error) {
    console.error(error);

    await prisma.verifyEmailToken.delete({
      where: { id: createdEmailToken.id },
    });

    return {
      success: false,
      message: "Failed to send verification email. Please try again later.",
    };
  }

  return {
    success: true,
    message: "Verification email sent successfully",
  };
};

export const verifyEmail = async (prevState: unknown, formData: FormData) =>
  catchAsyncAuthAction(async () => {
    const { email, token } = verifyEmailFormSchema.parse({
      email: formData.get("email"),
      token: formData.get("token"),
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!existingUser) {
      return {
        success: false,
        message: "User not found",
      };
    }
    if (existingUser.emailVerified) {
      return {
        success: false,
        message: "Email already verified",
      };
    }

    const verificationToken = await prisma.verifyEmailToken.findUnique({
      where: {
        token: createHash("sha256").update(token).digest("hex"),
      },
    });

    if (!verificationToken) {
      return {
        success: false,
        message: "Invalid or expired verification token",
      };
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: true,
      },
    });

    await createInitialSetting(existingUser.id);

    await prisma.verifyEmailToken.delete({
      where: { id: verificationToken.id },
    });

    return {
      success: true,
      message: "Email verified successfully",
    };
  });

export const resetPassword = async (prevState: unknown, formData: FormData) =>
  catchAsyncAuthAction(async () => {
    const { password, token } = resetPasswordFormSchema.parse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      token: formData.get("token"),
    });

    const existingToken = await prisma.resetPasswordToken.findUnique({
      where: {
        token: createHash("sha256").update(token).digest("hex"),
      },
    });

    if (!existingToken || existingToken.expiresAt < new Date()) {
      return {
        success: false,
        message: "Invalid or expired reset token",
      };
    }

    await prisma.user.update({
      where: { id: existingToken.userId },
      data: {
        password: hashSync(password),
      },
    });

    return {
      success: true,
      message:
        "Password reset successfully. You can now sign in with your new password.",
    };
  });

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

export const createInitialSetting = async (userId: string) => {
  const exist = await prisma.userSettings.findUnique({
    where: { userId: userId },
  });
  if (exist) {
    return { success: false, message: "Settings already exist." };
  }
  await prisma.userSettings.create({
    data: {
      userId: userId,
      ...INITIAL_USER_SETTINGS,
    },
  });
  return { success: true, message: "Settings created." };
};

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
      quizWordLevels: formData.getAll("quizWordLevels"),
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

export const sendEmailVerification = async (user: User, token: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `Ancore <${process.env.RESEND_FROM_EMAIL}>`,
      to: user.email,
      subject: `Verify your email address, ${user.name || "Learner"}!`,
      html: emailVerificationTemplate({
        userName: user.name || "Learner",
        email: user.email,
        token: token,
      }),
    });

    if (error) {
      console.error(`Resend API error for ${user.email}:`, error);
      throw new Error(`Resend API error for ${user.email}`);
    } else if (data) {
      console.log(`Email sent to ${user.email}:`, data.id);
    }
  } catch (err) {
    console.error(err);
    throw new Error(
      `Network error sending email verification to ${user.email}:`,
    );
  }
};

export const sendResetPasswordEmail = async (user: User, token: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `Ancore <${process.env.RESEND_FROM_EMAIL}>`,
      to: user.email,
      subject: "Reset your password",
      html: resetPasswordTemplate({
        userName: user.name || "Learner",
        email: user.email,
        resetPasswordUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`,
        tokenExpiresIn: Number(process.env.RESET_TOKEN_EXPIRES_IN || 5),
      }),
    });

    if (error) {
      console.error(`Resend API error for ${user.email}:`, error);
      throw new Error(`Resend API error for ${user.email}`);
    } else if (data) {
      console.log(`Email sent to ${user.email}:`, data.id);
    }
  } catch (err) {
    throw new Error(
      `Network error sending reset password email to ${user.email}:`,
    );
  }
};

export const saveProfile = async (prevState: unknown, formData: FormData) =>
  authenticationAction(async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const profile = {
      name: formData.get("name"),
      image: formData.get("image"),
      email: formData.get("email"),
      level: formData.get("level"),
      topics: formData.get("topics"),
      nativeLanguage: formData.get("nativeLanguage"),
      dailyGoal: parseInt(formData.get("dailyGoal") as string),
      password: formData.get("password"),
      newPassword: formData.get("newPassword"),
      confirmNewPassword: formData.get("confirmNewPassword"),
    };

    const validatedFields = userProfileSchema.safeParse(profile);
    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { password, newPassword, confirmNewPassword, ...rest } =
      validatedFields.data;

    if (newPassword) {
      if (!password) {
        return {
          success: false,
          message: "Please enter current password.",
        };
      }
      const isPasswordValid = await checkCurrentPassword(password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid current password.",
        };
      }

      if (newPassword !== confirmNewPassword) {
        return {
          success: false,
          message: "Passwords do not match.",
        };
      }
    }

    const isEmailChanged = rest.email !== user.email;

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...rest,
        emailVerified: isEmailChanged ? false : user.emailVerified,
        ...(newPassword ? { password: hashSync(newPassword) } : {}),
      },
    });
    revalidatePath("/profile");
    return { success: true, message: "Profile saved successfully." };
  });

export const getUser = async () =>
  authenticationAction(async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  });

export const checkCurrentPassword = async (password: string) =>
  authenticationAction(async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid =
      user.password && (await compare(password, user.password));

    return { isPasswordValid };
  });
