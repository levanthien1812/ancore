"use server";

import { prisma } from "@/db/prisma";
import { authenticationAction, settingsAction } from "./_helpers";
import { pusherServer } from "../pusher/server";

/**
 * Creates a new notification for the current user.
 */
export const createNotification = async (data: {
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
}) =>
  settingsAction(async (userId, settings) => {
    const notification = await prisma.notification.create({
      data: {
        ...data,
        userId,
      },
    });

    if (notification) {
      await pusherServer.trigger(`user-${userId}`, `new-notification`, {
        notification,
      });
    }

    // revalidatePath("/"); // Revalidate to update notification badges/lists
    return { success: true, data: notification };
  });

export const getNotifications = async () =>
  authenticationAction(async (userId) => {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return notifications;
  });

export const deleteNotification = async (notificationId: string) =>
  authenticationAction(async (userId) => {
    await prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  });

export const markNotificationAsRead = async (notificationId: string) =>
  authenticationAction(async (userId) => {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  });

export const markAllNotificationsAsRead = async () =>
  authenticationAction(async (userId) => {
    await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  });
