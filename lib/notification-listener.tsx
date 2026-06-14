"use client";

import { useLayout } from "@/components/layout/layout-context";
import { useEffect } from "react";
import { pusherClient } from "./pusher/client";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Notification } from "@prisma/client";

const NotificationListener = () => {
  const { notifications, setNotifications } = useLayout();
  const { data: session } = useSession();

  useEffect(() => {
    if (!pusherClient || !session?.user?.id) return;

    const channel = pusherClient.subscribe(`user-${session.user.id}`);

    const handleNewNotification = (data: { notification: Notification }) => {
      setNotifications((prev) => [data.notification, ...(prev || [])]);

      toast.info(data.notification.title, {
        description: data.notification.message,
      });
    };

    channel.bind("new-notification", handleNewNotification);

    return () => {
      channel.unbind("new-notification", handleNewNotification);
      pusherClient?.unsubscribe(`user-${session?.user?.id}`);
    };
  }, [session?.user?.id, setNotifications]);

  return null;
};

export default NotificationListener;
