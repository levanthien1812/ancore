"use client";

import { getUserSettings } from "@/lib/actions/user.actions";
import { UserSettings } from "@prisma/client";
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
};

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<LayoutMode>("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const settings = await getUserSettings();
      console.log("userSettings", settings);
      return settings;
    },
  });

  const value = useMemo(
    () => ({
      mode,
      setMode,
      sidebarOpen,
      setSidebarOpen,
      settings: userSettings || null,
      isLoadingSettings: isLoading,
    }),
    [mode, sidebarOpen, userSettings, isLoading],
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
