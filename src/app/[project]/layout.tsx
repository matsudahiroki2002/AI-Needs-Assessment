import { ReactNode } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { ProjectRouteInitializer } from "@/components/providers/ProjectRouteInitializer";
import { PROJECT_IDS } from "@/lib/projects";

type ProjectLayoutProps = {
  children: ReactNode;
  params: { project: string };
};

export function generateStaticParams() {
  return PROJECT_IDS.map((project) => ({ project }));
}

export const dynamicParams = true;

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  return (
    <ProjectRouteInitializer projectId={params.project}>
      <PageShell>{children}</PageShell>
    </ProjectRouteInitializer>
  );
}
