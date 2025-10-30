/**
 * @file Lightweight tests validating the mock API client behaviour.
 * @remarks These tests ensure the UI can rely on consistent shapes even before real API integration.
 */
import { describe, expect, it } from "vitest";

import { api } from "./apiClient";
import { ideas as mockIdeas } from "./mockData";

describe("apiClient mock", () => {
  it("lists seeded ideas", async () => {
    const ideas = await api.listIdeas();
    expect(ideas.length).toBeGreaterThan(0);
    expect(ideas[0]).toHaveProperty("title");
  });

  it("creates an idea and returns it in subsequent listings", async () => {
    const created = await api.createIdea({
      title: "テスト案",
      target: "テストセグメント",
      pain: "課題の説明",
      solution: "解決策の説明",
      price: 3000,
      channel: "SNS広告",
      onboarding: "テストオンボ",
      projectId: "projectA",
      version: "Z"
    });

    expect(created.id).toContain("idea-");

    const ideas = await api.listIdeas();
    const found = ideas.find((idea) => idea.id === created.id);
    expect(found).toBeDefined();
  });

  it("returns scores matching existing ideas", async () => {
    const ids = mockIdeas.map((idea) => idea.id);
    const scores = await api.getScores(ids);
    expect(scores).toHaveLength(ids.length);
    expect(scores[0]).toHaveProperty("psf");
  });

  it("creates a new project", async () => {
    const project = await api.createProject({ name: "新規テストプロジェクト" });
    expect(project.id).toContain("project");

    const projects = await api.listProjects();
    const found = projects.find((item) => item.id === project.id);
    expect(found).toBeDefined();
  });
});
