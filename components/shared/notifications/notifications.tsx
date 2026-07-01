"use client";

import { useLayout } from "@/components/layout/layout-context";
import React from "react";
import { cn } from "@/lib/utils";
import { Check, Trash2, Bell, BellOff } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/actions/notification.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Notifications = () => {
  const { notifications, isLoadingNotifications } = useLayout();
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  if (isLoadingNotifications) {
    return (
      <div className="w-80 p-4 flex justify-center items-center">
        <p className="text-sm text-muted-foreground">
          Loading notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 flex flex-col bg-white rounded-md shadow-md border overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          <h3 className="font-bold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-blue-600 hover:text-blue-700 p-0"
            onClick={() => markAllAsReadMutation.mutate()}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
        {!notifications || notifications.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <BellOff size={32} strokeWidth={1.5} />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer relative group",
                  !notification.isRead && "bg-blue-50/50",
                )}
                onClick={() =>
                  !notification.isRead &&
                  markAsReadMutation.mutate(notification.id)
                }
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  )}
                </div>
                {notification.actionUrl && (
                  <Link
                    href={notification.actionUrl}
                    className="absolute inset-0 z-0"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
