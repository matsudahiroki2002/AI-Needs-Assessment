"use client";

import { create } from "zustand";

import { INITIAL_PROJECTS, getProjectLabel } from "@/lib/projects";
import { Project } from "@/lib/types";

export interface ProjectState {
  projects: Project[];
  currentProject: string;
  initialized: boolean;
  setProject: (projectId: string) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  projectLabel: (projectId: string) => string;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: INITIAL_PROJECTS,
  currentProject: INITIAL_PROJECTS[0]?.id ?? "projectA",
  initialized: false,
  setProject: (projectId) => set({ currentProject: projectId }),
  setProjects: (projects) =>
    set((state) => ({
      projects,
      initialized: true,
      currentProject: projects.find((p) => p.id === state.currentProject)?.id ?? projects[0]?.id ?? state.currentProject
    })),
  addProject: (project) =>
    set((state) => {
      const exists = state.projects.some((item) => item.id === project.id);
      const projects = exists ? state.projects : [...state.projects, project];
      return {
        projects,
        currentProject: project.id,
        initialized: true
      };
    }),
  projectLabel: (projectId) => {
    const state = get();
    return state.projects.find((project) => project.id === projectId)?.name ?? getProjectLabel(projectId);
  }
}));
