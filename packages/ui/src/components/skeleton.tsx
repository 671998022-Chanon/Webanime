// @nexus/ui — Skeleton primitive
// Presets: text (default), circular, rectangular
// Shimmer animation respects prefers-reduced-motion.

import * as React from "react";

import { cn } from "../lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="Skeleton"
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "bg-void-6 relative overflow-hidden rounded-[var(--radius-2)]",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-[linear-gradient(90deg,transparent,oklch(1_0_0_/_0.06),transparent)]",
        "before:animate-[skeleton-shimmer_2s_ease-in-out_infinite]",
        "motion-reduce:before:translate-x-0 motion-reduce:before:animate-none",
        className,
      )}
      {...props}
    />
  );
}

/** Preset: one or more text lines. */
export function SkeletonText({
  lines = 3,
  className,
  ...props
}: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-3/4" : "w-full")} />
      ))}
    </div>
  );
}

/** Preset: circular avatar placeholder. */
export function SkeletonAvatar({
  size = 40,
  className,
  ...props
}: SkeletonProps & { size?: number }) {
  return (
    <Skeleton
      style={{ width: size, height: size }}
      className={cn("rounded-[var(--radius-full)]", className)}
      {...props}
    />
  );
}

/** Preset: rectangular image/card placeholder. */
export function SkeletonRect({
  aspectRatio = "16/9",
  className,
  ...props
}: SkeletonProps & { aspectRatio?: string }) {
  return <Skeleton style={{ aspectRatio }} className={cn("w-full", className)} {...props} />;
}
