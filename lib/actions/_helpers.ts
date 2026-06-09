import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { UserSettings } from "@prisma/client";
import { cache } from "react";

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
  const session = await auth();

  if (!session?.user?.id) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error("UNAUTHORIZED");
  }

  return fn(session.user.id);
}

/**
 * A specialized wrapper for actions that require both user identity and their custom settings.
 * It reuses the authentication logic and provides memoized settings.
 */
export async function settingsAction<T>(
  fn: (userId: string, settings: UserSettings) => Promise<T>,
  fallback?: T,
): Promise<T> {
  return authenticationAction(async (userId) => {
    const settings = await getCachedUserSettings(userId);

    if (!settings) {
      throw new Error("USER_SETTINGS_NOT_FOUND");
    }

    return fn(userId, settings);
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
