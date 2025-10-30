"use client";

import { ReactNode, useEffect } from "react";

import { useProjectStore } from "@/store/projectStore";

type ProjectRouteInitializerProps = {
  projectId: string;
  children: ReactNode;
};

export const ProjectRouteInitializer = ({ projectId, children }: ProjectRouteInitializerProps) => {
  const { currentProject, setProject } = useProjectStore();

  useEffect(() => {
    if (!projectId) return;
    if (currentProject !== projectId) {
      setProject(projectId);
    }
  }, [currentProject, projectId, setProject]);

  return <>{children}</>;
};
