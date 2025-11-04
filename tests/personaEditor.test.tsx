import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PersonaEditor } from "../src/components/personas/PersonaEditor";

describe("PersonaEditor", () => {
  it("renders primary persona editor controls", () => {
    render(<PersonaEditor />);

    expect(screen.getByRole("heading", { name: "ペルソナ作成" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ペルソナを登録" })).toBeInTheDocument();
  });
});
