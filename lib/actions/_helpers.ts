import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { UserSettings } from "@prisma/client";
import { cache } from "react";
import z from "zod";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

/**
 * Memoizes the database query for user settings for the duration of a single request.
 * This prevents redundant DB hits if multiple functions within one action need settings.
 */
export const getCachedUserSettings = cache(async (userId: string) => {
  return await prisma.userSettings.findUnique({ where: { userId } });
});

export async function authenticationAction<T>(
  fn: (userId: string) => Promise<T>,
  fallback?: T,
): Promise<T> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      if (fallback !== undefined) {
        return fallback;
      }
      throw new Error("UNAUTHORIZED");
    }

    return await fn(session.user.id);
  } catch (error) {
    console.error("Action error:", error);
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error("Something went wrong!");
  }
}

/**
 * A specialized wrapper for actions that require both user identity and their custom settings.
 * It reuses the authentication logic and provides memoized settings.
 */
export async function settingsAction<T>(
  fn: (userId: string, settings: UserSettings) => Promise<T>,
  fallback?: T,
): Promise<T> {
  return await authenticationAction(async (userId) => {
    const settings = await getCachedUserSettings(userId);

    if (!settings) {
      throw new Error("USER_SETTINGS_NOT_FOUND");
    }

    return await fn(userId, settings);
  }, fallback);
}

export async function authenticateCronJobs(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
}

export const catchAsyncAuthAction = async <T>(
  fn: () => Promise<T>,
): Promise<T | { success: false; message: string }> => {
  try {
    return await fn();
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
            message: error.cause?.err?.message || "An error occurred during authentication",
          };
      }
    }

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
