/**
 * @file Zustand store for managing registered persona profiles used in user research simulations.
 * @remarks Keeps FastAPI integration consolidated so components stay agnostic to the transport layer.
 */
"use client";

import { create } from "zustand";

import { api } from "@/lib/apiClient";

import type { PersonaProfile } from "@/lib/types";

export type PersonaFormInput = Omit<PersonaProfile, "id" | "createdAt" | "updatedAt">;

interface PersonaState {
  personas: PersonaProfile[];
  loading: boolean;
  error?: string;
  fetchPersonas: (signal?: AbortSignal) => Promise<void>;
  addPersona: (persona: PersonaProfile) => void;
  createPersona: (payload: PersonaFormInput) => Promise<PersonaProfile | undefined>;
  resetError: () => void;
}

export const usePersonaStore = create<PersonaState>((set, get) => ({
  personas: [],
  loading: false,
  error: undefined,
  async fetchPersonas(signal) {
    set({ loading: true, error: undefined });
    try {
      const personas = await api.listPersonaProfiles(signal);
      set({ personas, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false, error: error instanceof Error ? error.message : "Failed to fetch personas" });
    }
  },
  addPersona(persona) {
    set((state) => ({
      personas: [...state.personas, persona]
    }));
  },
  async createPersona(payload) {
    try {
      const persona = await api.createPersonaProfile(payload);
      const existing = get().personas.find((item) => item.id === persona.id);
      set((state) => ({
        personas: existing
          ? state.personas.map((item) => (item.id === persona.id ? persona : item))
          : [...state.personas, persona],
        error: undefined
      }));
      return persona;
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to create persona";
      set({ error: message });
      return undefined;
    }
  },
  resetError() {
    set({ error: undefined });
  }
}));
