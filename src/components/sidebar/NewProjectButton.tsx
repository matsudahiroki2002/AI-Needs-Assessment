"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/apiClient";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";

type NewProjectButtonProps = {
  className?: string;
};

export const NewProjectButton = ({ className }: NewProjectButtonProps) => {
  const router = useRouter();
  const setToast = useUIStore((state) => state.setToast);
  const { addProject, setProject } = useProjectStore();

  const handleCreate = async () => {
    const name = window.prompt("新しいプロジェクト名を入力してください", "新規プロジェクト");
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const project = await api.createProject({ name: trimmed });
      addProject(project);
      setProject(project.id);
      router.push(`/${project.id}/dashboard`);
      setToast({ message: `${trimmed} を作成しました`, tone: "success" });
    } catch (error) {
      console.error(error);
      setToast({ message: "プロジェクトの作成に失敗しました", tone: "error" });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      icon={<Plus className="h-4 w-4" aria-hidden="true" />}
      onClick={handleCreate}
      className={cn("justify-start", className)}
    >
      新規プロジェクト作成
    </Button>
  );
};
