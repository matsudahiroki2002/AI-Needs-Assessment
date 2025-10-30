import { projects as seededProjects } from "./mockData";
import { Project } from "./types";

export const INITIAL_PROJECTS: Project[] = seededProjects;

export const PROJECT_IDS = INITIAL_PROJECTS.map((project) => project.id);

export const getProjectLabel = (projectId: string) => {
  const match = INITIAL_PROJECTS.find((project) => project.id === projectId);
  return match?.name ?? projectId;
};
