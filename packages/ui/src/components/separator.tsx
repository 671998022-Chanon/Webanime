// @nexus/ui — Separator primitive
// Horizontal or vertical divider. Uses border-subtle token.
// Purely presentational — role="separator" for screen readers.

import * as React from "react";

import { cn } from "../lib/cn";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the separator. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Visual thickness in pixels. @default 1 */
  thickness?: 1 | 2;
}

export function Separator({
  orientation = "horizontal",
  thickness = 1,
  className,
  ...props
}: SeparatorProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      data-slot="separator"
      data-orientation={orientation}
      className={cn(
        "bg-border-subtle shrink-0",
        isVertical ? "h-full w-px" : "h-px w-full",
        className,
      )}
      style={{
        ...(thickness !== 1
          ? isVertical
            ? { width: thickness }
            : { height: thickness }
          : undefined),
      }}
      {...props}
    />
  );
}
