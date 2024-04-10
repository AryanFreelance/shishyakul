import { create } from "zustand";

export const attendanceStore = create((set) => ({
  date: "",
  updateDate: (newDate) => set({ date: newDate }),
}));
