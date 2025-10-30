/**
 * @file Zustand store responsible for lightweight UI state management.
 * @remarks Keep server-derived data out of this store to simplify migration to dedicated data-fetching solutions.
 */
import { create } from "zustand";

export type UIState = {
  selectedIdeaId?: string;
  filters: { segment?: string; search?: string };
  loading: boolean;
  toast?: { message: string; tone: "success" | "error" | "info" } | null;
  setSelectedIdeaId: (id?: string) => void;
  setFilters: (filters: Partial<UIState["filters"]>) => void;
  setLoading: (value: boolean) => void;
  setToast: (toast: UIState["toast"]) => void;
};

export const useUIStore = create<UIState>((set) => ({
  selectedIdeaId: undefined,
  filters: {},
  loading: false,
  toast: null,
  setSelectedIdeaId: (id) => set({ selectedIdeaId: id }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setLoading: (value) => set({ loading: value }),
  setToast: (toast) => set({ toast })
}));
