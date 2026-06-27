// @nexus/ui — Container primitive
// Responsive max-width wrapper. Centers content and applies horizontal padding.
// Max-width values mirror the grid breakpoints from docs/04-design-system/Responsive-System.md.

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "../lib/cn";

const MAX_WIDTH_MAP = {
  sm: "max-w-screen-sm", // 640px
  md: "max-w-screen-md", // 768px
  lg: "max-w-screen-lg", // 1024px
  xl: "max-w-screen-xl", // 1280px
  "2xl": "max-w-screen-2xl", // 1536px
  full: "max-w-full",
} as const;

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum width breakpoint. @default "xl" */
  size?: keyof typeof MAX_WIDTH_MAP;
  /** Horizontal padding override. @default "px-4 md:px-6" */
  padding?: string;
  /** Use Slot to merge props onto a child element. */
  asChild?: boolean;
}

export function Container({
  size = "xl",
  padding = "px-4 md:px-6",
  className,
  asChild = false,
  children,
  ...props
}: ContainerProps) {
  const classes = cn("mx-auto w-full", MAX_WIDTH_MAP[size], padding, className);

  if (asChild) {
    return (
      <Slot className={classes} {...(props as React.ComponentPropsWithoutRef<typeof Slot>)}>
        {children}
      </Slot>
    );
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
