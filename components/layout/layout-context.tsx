"use client";

import { getNotifications } from "@/lib/actions/notification.actions";
import { getUser } from "@/lib/actions/user.actions";
import { Notification, User, UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useMemo, useState } from "react";

type LayoutMode = "list" | "grid";

type LayoutContextValue = {
  mode: LayoutMode;
  setMode: (mode: LayoutMode) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: User | null;
  settings: UserSettings | null;
  isLoadingUser: boolean;
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

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["get-user"],
    queryFn: async () => {
      const user = await getUser();
      return user;
    },
    initialData: null,
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
      user: user,
      settings: user?.settings || null,
      isLoadingUser: isLoadingUser,
      notifications: notifications || null,
      setNotifications,
      isLoadingNotifications: isLoadingNotifications,
    }),
    [
      mode,
      sidebarOpen,
      user,
      isLoadingUser,
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
