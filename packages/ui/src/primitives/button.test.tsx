import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("should render children when given label text", () => {
    render(<Button>Watch now</Button>);
    expect(screen.getByRole("button", { name: "Watch now" })).toBeInTheDocument();
  });

  it("should apply primary variant classes by default", () => {
    render(<Button>Primary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-resonance");
  });

  it("should set aria-disabled when loading", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("should render destructive variant classes", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");
  });
});
