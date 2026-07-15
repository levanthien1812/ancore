import { create } from "zustand";

type LayoutMode = "list" | "grid";

type LayoutStore = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (value: boolean) => void;
  mode: LayoutMode;
  setMode: (mode: LayoutMode) => void;
};

export const useLayoutStore = create<LayoutStore>((set) => ({
  sidebarOpen: false,

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  setSidebar: (value: boolean) =>
    set({
      sidebarOpen: value,
    }),

  mode: "grid",
  setMode: (mode: LayoutMode) =>
    set({
      mode,
    }),
}));
