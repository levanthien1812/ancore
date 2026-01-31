"use server";

import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import {
  onboardingFormSchema,
  signInFormSchema,
  signUpFormSchema,
  forgotPasswordFormSchema,
  resetPasswordFormSchema,
} from "../validators/user.validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts-edge";
import z from "zod";
import { revalidatePath } from "next/cache";
import { UserLevel } from "@prisma/client";

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData,
) {
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
      console.log(error.type);
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
}

export async function signOutUser() {
  await signOut({ redirectTo: "/sign-in" });
}

export async function signUpWithCredentials(
  prevState: unknown,
  formData: FormData,
) {
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
}

export async function updateUserOnboarding(
  prevState: unknown,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Authentication required.", errors: {} };
  }

  const validatedFields = onboardingFormSchema.safeParse({
    level: formData.get("level"),
    topics: formData.get("topics"),
    dailyGoal: parseInt(formData.get("dailyGoal") as string),
  });

  console.log(validatedFields);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...validatedFields.data,
        level: validatedFields.data.level as UserLevel,
        onboarded: true,
      },
    });
    revalidatePath("/");
    return { success: true, message: "Welcome!", errors: {} };
  } catch (error) {
    return { success: false, message: "Database error.", errors: {} };
  }
}

export async function forgotPassword(prevState: unknown, formData: FormData) {
  try {
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0].message,
      };
    }

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function resetPassword(prevState: unknown, formData: FormData) {
  try {
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0].message,
      };
    }

    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
