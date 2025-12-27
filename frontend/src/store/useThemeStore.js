import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("friendnest-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("friendnest-theme", theme);
    set({ theme });
  },
}));
