// @nexus/ui — ErrorState primitive
// Inline error surface used by boundaries and section-level failures.
// Compact: icon + title + description + optional retry CTA.
// Composes with the existing Alert for accessible role="alert" semantics.

import { cva, type VariantProps } from "class-variance-authority";
import { CircleX, RotateCw } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

const errorStateVariants = cva(
  ["flex flex-col items-center gap-2 text-center", "rounded-[var(--radius-4)]", "px-4 py-6"],
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

export interface ErrorStateProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof errorStateVariants> {
  /** Title. @default "Couldn't load this section." */
  title?: string;
  /** Description shown below the title. */
  description?: string;
  /** Retry handler renders a primary button when provided. */
  onRetry?: () => void;
  /** Retry button label. @default "Try again" */
  retryLabel?: string;
  /** Whether the error role is "alert" (assertive) or static. @default false */
  assertive?: boolean;
}

export function ErrorState({
  className,
  title = "Couldn't load this section.",
  description = "Something went wrong fetching your data. Check your connection and try again.",
  onRetry,
  retryLabel = "Try again",
  assertive = false,
  size,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role={assertive ? "alert" : "status"}
      aria-live={assertive ? "assertive" : "polite"}
      data-slot="error-state"
      data-size={size}
      className={cn(errorStateVariants({ size }), className)}
      {...props}
    >
      <CircleX aria-hidden="true" className="text-error size-6" />
      <ErrorStateTitle>{title}</ErrorStateTitle>
      <ErrorStateDescription>{description}</ErrorStateDescription>
      <ErrorStateAction onClick={onRetry}>{retryLabel}</ErrorStateAction>
    </div>
  );
}

ErrorState.displayName = "ErrorState";

/* ---------------- Title ---------------- */

export interface ErrorStateTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ErrorStateTitle({ className, ...props }: ErrorStateTitleProps) {
  return (
    <p
      data-slot="error-state-title"
      className={cn("text-text-primary text-sm font-medium", className)}
      {...props}
    />
  );
}

ErrorStateTitle.displayName = "ErrorState.Title";

/* ---------------- Description ---------------- */

export interface ErrorStateDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ErrorStateDescription({ className, ...props }: ErrorStateDescriptionProps) {
  return (
    <p
      data-slot="error-state-description"
      className={cn("text-text-secondary text-xs leading-relaxed", className)}
      {...props}
    />
  );
}

ErrorStateDescription.displayName = "ErrorState.Description";

/* ---------------- Action ---------------- */

export interface ErrorStateActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function ErrorStateAction({ className, children, ...props }: ErrorStateActionProps) {
  return (
    <button
      type="button"
      data-slot="error-state-action"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-2)]",
        "bg-error-muted/30 text-error px-3 text-xs font-medium",
        "ease-spring hover:bg-error-muted/50 transition-all duration-200 active:scale-[0.98]",
        "focus-visible:ring-error/60 focus-visible:outline-none focus-visible:ring-2",
        className,
      )}
      {...props}
    >
      <RotateCw aria-hidden="true" className="size-3.5" />
      {children}
    </button>
  );
}

ErrorStateAction.displayName = "ErrorState.Action";
