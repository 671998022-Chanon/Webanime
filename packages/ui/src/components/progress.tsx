// @nexus/ui — Progress primitive
// Wraps @radix-ui/react-progress for determinate progress bars.
// Variants: default, success, warning, error, info
// Sizes: sm, md (default)
// Renders role="progressbar" with aria-valuenow/min/max for screen readers.

"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const progressVariants = cva(
  [
    "relative w-full overflow-hidden rounded-[var(--radius-full)]",
    "bg-surface-overlay border border-border-subtle/40",
  ],
  {
    variants: {
      size: {
        sm: "h-1.5",
        md: "h-2.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const indicatorVariants = cva(
  ["h-full flex-1 rounded-[var(--radius-full)] transition-[width] duration-300 ease-spring"],
  {
    variants: {
      variant: {
        default: "bg-action-primary-bg",
        success: "bg-success",
        warning: "bg-warning",
        error: "bg-error",
        info: "bg-aether-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type ProgressProps = Omit<
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
  "min" | "max" | "value"
> &
  VariantProps<typeof progressVariants> &
  VariantProps<typeof indicatorVariants> & {
    /** Current value (0–100 by default). */
    value?: number;
    /** Minimum value. @default 0 */
    min?: number;
    /** Maximum value. @default 100 */
    max?: number;
    /** Show percentage label inline (typically for file uploads). @default false */
    showLabel?: boolean;
  };

export const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, min = 0, max = 100, size, variant, showLabel, ...props }, ref) => {
  const clamped = Math.min(Math.max(value ?? 0, min), max);
  const percent = Math.round(((clamped - min) / (max - min)) * 100);

  return (
    <div className="flex w-full items-center gap-2">
      <ProgressPrimitive.Root
        ref={ref}
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-valuetext={`${percent}% complete`}
        data-slot="progress"
        data-size={size}
        data-variant={variant}
        className={cn(progressVariants({ size }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(indicatorVariants({ variant }), className)}
          style={{ width: `${percent}%` }}
        />
      </ProgressPrimitive.Root>
      {showLabel ? (
        <span
          aria-hidden="true"
          className="text-text-secondary shrink-0 text-xs font-medium tabular-nums"
        >
          {percent}%
        </span>
      ) : null}
    </div>
  );
});
Progress.displayName = "Progress";
