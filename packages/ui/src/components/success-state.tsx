// @nexus/ui — SuccessState primitive
// Lightweight success confirmation surface: icon + title + optional description.
// Use for form submissions, save confirmations, and other positive outcomes.

import { cva, type VariantProps } from "class-variance-authority";
import { CircleCheck } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

const successStateVariants = cva(
  ["flex flex-col items-center gap-2 text-center", "rounded-[var(--radius-4)]", "px-4 py-4"],
  {
    variants: {
      size: {
        sm: "py-4 text-sm",
        md: "py-6 text-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SuccessStateProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof successStateVariants> {}

export function SuccessState({ className, size, ...props }: SuccessStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="success-state"
      data-size={size}
      className={cn(successStateVariants({ size }), className)}
      {...props}
    />
  );
}

SuccessState.displayName = "SuccessState";

/* ---------------- Title ---------------- */

export interface SuccessStateTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function SuccessStateTitle({ className, ...props }: SuccessStateTitleProps) {
  return (
    <p
      data-slot="success-state-title"
      className={cn("text-success text-sm font-medium", className)}
      {...props}
    />
  );
}

SuccessStateTitle.displayName = "SuccessState.Title";

/* ---------------- Description ---------------- */

export interface SuccessStateDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function SuccessStateDescription({ className, ...props }: SuccessStateDescriptionProps) {
  return (
    <p
      data-slot="success-state-description"
      className={cn("text-text-secondary text-xs leading-relaxed", className)}
      {...props}
    />
  );
}

SuccessStateDescription.displayName = "SuccessState.Description";

/* ---------------- Icon ---------------- */

export interface SuccessStateIconProps extends React.SVGAttributes<SVGSVGElement> {}

export function SuccessStateIcon({ className, ...props }: SuccessStateIconProps) {
  return (
    <CircleCheck
      aria-hidden="true"
      data-slot="success-state-icon"
      className={cn("text-success size-6", className)}
      {...props}
    />
  );
}

SuccessStateIcon.displayName = "SuccessState.Icon";
