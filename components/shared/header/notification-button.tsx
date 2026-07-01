"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Bell, BellRing } from "lucide-react";
import React from "react";
import IconDisplay from "../icon-display";
import Notifications from "../notifications/notifications";
import { useLayout } from "@/components/layout/layout-context";

const NotificationButton = () => {
  const { notifications } = useLayout();

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative inline-flex cursor-pointer">
          <IconDisplay
            icon={unreadCount > 0 ? BellRing : Bell}
            iconColor="text-primary"
            iconSize={18}
            asButton
          />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white border-2 border-white pointer-events-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-fit p-0">
        <Notifications />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationButton;
