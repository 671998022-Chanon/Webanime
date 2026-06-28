// @nexus/ui — LoadingOverlay primitive
// Full-screen or container-level loading backdrop. Centers a Spinner with optional
// status text and progress indicator. Tokens sourced from @nexus/ui.
// Wrap regions that are actively loading data; preserve accessible naming via props.

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";
import { Progress } from "./progress";
import { Spinner } from "./spinner";

const overlayVariants = cva(
  [
    "z-overlay flex flex-col items-center justify-center gap-4",
    "backdrop-blur-md",
    "transition-opacity duration-200 ease-spring",
  ],
  {
    variants: {
      /** Whether the overlay covers the viewport or its positioned parent. */
      scope: {
        viewport: "fixed inset-0",
        region: "absolute inset-0",
      },
      /** Surface treatment behind the spinner. */
      tone: {
        default: "bg-surface-base/70",
        raised: "bg-surface-raised/80",
      },
    },
    defaultVariants: {
      scope: "viewport",
      tone: "default",
    },
  },
);

export interface LoadingOverlayProps extends VariantProps<typeof overlayVariants> {
  /** Accessible label announced to screen readers. @default "Loading" */
  label?: string;
  /** Show a determinate progress bar. Pass a value 0–100. */
  progress?: number;
  /** Optional status text shown below the spinner (e.g. "Loading your library…"). */
  status?: string;
  className?: string;
}

export function LoadingOverlay({
  label = "Loading",
  progress,
  status,
  scope,
  tone,
  className,
}: LoadingOverlayProps) {
  const hasProgress = typeof progress === "number" && progress >= 0;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      data-slot="loading-overlay"
      className={cn(overlayVariants({ scope, tone }), className)}
    >
      <Spinner size={32} label={label} />
      {status ? <p className="text-text-secondary text-sm">{status}</p> : null}
      {hasProgress ? (
        <div className="w-full max-w-xs">
          <Progress value={progress} size="sm" />
        </div>
      ) : null}
    </div>
  );
}
