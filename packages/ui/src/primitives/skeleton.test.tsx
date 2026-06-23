import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("should render with card variant classes", () => {
    const { container } = render(<Skeleton variant="card" />);
    expect(container.firstChild).toHaveClass("aspect-poster");
  });

  it("should disable shimmer animation when reduced motion is preferred", () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.firstChild).toHaveClass("motion-reduce:animate-none");
  });
});
