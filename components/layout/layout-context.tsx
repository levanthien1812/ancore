"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type LayoutMode = "list" | "grid";

type LayoutContextValue = {
  mode: LayoutMode;
  setMode: (mode: LayoutMode) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<LayoutMode>("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const value = useMemo(
    () => ({ mode, setMode, sidebarOpen, setSidebarOpen }),
    [mode, sidebarOpen],
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
