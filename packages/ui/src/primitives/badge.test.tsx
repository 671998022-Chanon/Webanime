import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("should render badge text", () => {
    render(<Badge>Resonance</Badge>);
    expect(screen.getByText("Resonance")).toBeInTheDocument();
  });

  it("should apply resonance variant classes", () => {
    render(<Badge variant="resonance">New</Badge>);
    expect(screen.getByText("New")).toHaveClass("text-resonance");
  });
});
