"use client";

import { getNotifications } from "@/lib/actions/notification.actions";
import { getUserSettings } from "@/lib/actions/user.actions";
import { Notification, UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useMemo, useState } from "react";

type LayoutMode = "list" | "grid";

type LayoutContextValue = {
  mode: LayoutMode;
  setMode: (mode: LayoutMode) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  settings: UserSettings | null;
  isLoadingSettings: boolean;
  notifications: Notification[] | null;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[] | null>>;
  isLoadingNotifications: boolean;
};

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<LayoutMode>("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | null>(
    null,
  );

  const { data: userSettings, isLoading: isLoadingUserSettings } = useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const settings = await getUserSettings();
      return settings;
    },
  });

  // get notifications
  const { isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const notifications = await getNotifications();
      setNotifications(notifications);
      return notifications;
    },
  });

  const value = useMemo(
    () => ({
      mode,
      setMode,
      sidebarOpen,
      setSidebarOpen,
      settings: userSettings || null,
      isLoadingSettings: isLoadingUserSettings,
      notifications: notifications || null,
      setNotifications,
      isLoadingNotifications: isLoadingNotifications,
    }),
    [
      mode,
      sidebarOpen,
      userSettings,
      isLoadingUserSettings,
      notifications,
      isLoadingNotifications,
      setNotifications,
    ],
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
};

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
