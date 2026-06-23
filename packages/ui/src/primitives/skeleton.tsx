import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card" | "hero";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: "h-4 w-full rounded",
    card: "aspect-poster w-full rounded-lg",
    hero: "aspect-hero w-full rounded-xl",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-void-elevated motion-reduce:animate-none",
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-text-primary/5 before:to-transparent motion-reduce:before:animate-none",
        variantClasses[variant],
        className,
      )}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}
