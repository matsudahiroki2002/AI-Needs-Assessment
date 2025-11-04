"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { NewProjectButton } from "@/components/sidebar/NewProjectButton";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/apiClient";
import { useUIStore } from "@/lib/store";
import { useProjectStore } from "@/store/projectStore";

export const ProjectSelector = () => {
  const router = useRouter();
  const pathname = usePathname();
  const setToast = useUIStore((state) => state.setToast);
  const { currentProject, setProject, projects, initialized, setProjects, projectLabel } =
    useProjectStore();

  useEffect(() => {
    if (initialized) return;
    const controller = new AbortController();
    api
      .listProjects(controller.signal)
      .then((list) => {
        setProjects(list);
      })
      .catch((error) => {
        console.error(error);
        setToast({ message: "プロジェクトの取得に失敗しました", tone: "error" });
      });
    return () => controller.abort();
  }, [initialized, setProjects, setToast]);

  const handleChange = (value: string) => {
    setProject(value);

    const segments = pathname.split("/").filter(Boolean);
    const nextSegments = [...segments];
    if (nextSegments.length === 0) {
      router.push(`/${value}/dashboard`);
      return;
    }
    nextSegments[0] = value;
    router.push(`/${nextSegments.join("/")}`);
  };

  const activeProjectName = projectLabel(currentProject);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-3 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          プロジェクト
        </span>
        <span className="text-xs text-muted-foreground/80">{activeProjectName}</span>
      </div>
      <NewProjectButton className="h-10 w-full justify-center text-xs" />
      <Select
        value={currentProject}
        onChange={(event) => handleChange(event.target.value)}
        aria-label="プロジェクトを選択"
      >
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </Select>
    </section>
  );
};
