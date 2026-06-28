// @nexus/ui — EmptyState primitive (compound)
// Reusable empty-data surface per docs/05-ui/Empty-States.md
// Slots: Illustration, Title, Description, Actions, Suggestions
// Variants: empty-state (full panel), inline (compact rail-level retry)

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

/* ---------------- Container ---------------- */

const containerVariants = cva(["mx-auto flex flex-col items-center text-center"], {
  variants: {
    /** Full panel (default) vs compact inline rail variant. */
    layout: {
      panel: [
        "w-full max-w-[400px] rounded-[var(--radius-5)]",
        "border border-border-subtle/40 bg-surface-raised/80 backdrop-blur-md",
        "shadow-2",
        "px-8 py-12 md:px-10 md:py-12",
        "max-md:max-w-[360px] max-md:px-10 max-md:py-10",
        "max-sm:w-[calc(100%-2rem)] max-sm:max-w-[300px] max-sm:px-8 max-sm:py-8",
        "motion-safe:animate-[empty-state-enter_200ms_ease-out]",
      ],
      inline: "w-full gap-2 py-2",
    },
  },
  defaultVariants: {
    layout: "panel",
  },
});

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {}

export function EmptyState({ className, layout, ...props }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      data-layout={layout}
      role="region"
      aria-label="Empty state"
      className={cn(containerVariants({ layout }), className)}
      {...props}
    />
  );
}

EmptyState.displayName = "EmptyState";

/* ---------------- Illustration ---------------- */

export interface EmptyStateIllustrationProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Decorative SVG. Defaults to an abstract geometric mark; pass any SVG children
   * (lucide icon, custom illustration) via <EmptyState.Illustration>content</EmptyState.Illustration>.
   */
  children?: React.ReactNode;
}

const DefaultIllustration = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 96 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="motion-safe:animate-[empty-state-float_3s_ease-in-out_infinite]"
  >
    <circle
      cx="48"
      cy="48"
      r="44"
      stroke="currentColor"
      strokeWidth="1"
      className="text-aether-4/30"
    />
    <circle
      cx="48"
      cy="48"
      r="28"
      stroke="currentColor"
      strokeWidth="1"
      className="text-aether-5/40"
    />
    <path d="M30 54 L48 36 L66 54 Z" fill="currentColor" className="text-aether-5/30" />
    <circle cx="48" cy="28" r="3" fill="currentColor" className="text-aether-4" />
  </svg>
);

export function EmptyStateIllustration({
  className,
  children,
  ...props
}: EmptyStateIllustrationProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      data-slot="empty-state-illustration"
      className={cn(
        "text-aether-5 mb-8 size-24",
        "max-md:size-20",
        "max-sm:mb-6 max-sm:size-16",
        className,
      )}
      {...props}
    >
      {children ?? <DefaultIllustration />}
    </div>
  );
}

EmptyStateIllustration.displayName = "EmptyState.Illustration";

/* ---------------- Title ---------------- */

export interface EmptyStateTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function EmptyStateTitle({ className, ...props }: EmptyStateTitleProps) {
  return (
    <h2
      data-slot="empty-state-title"
      className={cn(
        "text-text-primary font-medium leading-tight",
        "text-xl tracking-tight",
        "max-md:text-xl",
        "max-sm:text-lg",
        className,
      )}
      {...props}
    />
  );
}

EmptyStateTitle.displayName = "EmptyState.Title";

/* ---------------- Description ---------------- */

export interface EmptyStateDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function EmptyStateDescription({ className, ...props }: EmptyStateDescriptionProps) {
  return (
    <p
      id="empty-state-description"
      data-slot="empty-state-description"
      className={cn(
        "text-text-secondary max-w-[300px] text-sm leading-relaxed",
        "mb-6 mt-3",
        "max-sm:mb-5 max-sm:mt-2",
        className,
      )}
      {...props}
    />
  );
}

EmptyStateDescription.displayName = "EmptyState.Description";

/* ---------------- Actions ---------------- */

export interface EmptyStateActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function EmptyStateActions({ className, ...props }: EmptyStateActionsProps) {
  return (
    <div
      data-slot="empty-state-actions"
      className={cn(
        "flex flex-wrap items-center justify-center gap-3",
        "max-sm:w-full max-sm:flex-col",
        className,
      )}
      {...props}
    />
  );
}

EmptyStateActions.displayName = "EmptyState.Actions";

/* ---------------- Suggestions ---------------- */

export interface EmptyStateSuggestionsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function EmptyStateSuggestions({ className, ...props }: EmptyStateSuggestionsProps) {
  return (
    <div
      role="list"
      data-slot="empty-state-suggestions"
      className={cn("mt-4 flex flex-wrap justify-center gap-2", className)}
      {...props}
    />
  );
}

EmptyStateSuggestions.displayName = "EmptyState.Suggestions";

/* ---------------- Inline Variant ---------------- */

export interface EmptyStateInlineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional title override. @default "Couldn't load." */
  title?: string;
  /** Optional retry handler. Renders a primary-style button when provided. */
  onRetry?: () => void;
  /** Retry button label. @default "Retry" */
  retryLabel?: string;
}

/**
 * Compact variant for rail-level failures. Title + optional retry button.
 * No illustration, no animation, no panel chrome.
 */
export function EmptyStateInline({
  className,
  title = "Couldn't load.",
  onRetry,
  retryLabel = "Retry",
  children,
  ...props
}: EmptyStateInlineProps) {
  return (
    <div
      data-slot="empty-state-inline"
      role="region"
      aria-label="Load error"
      className={cn("flex flex-col items-center gap-2 py-2 text-center", className)}
      {...props}
    >
      <span className="text-text-primary text-base font-medium">{title}</span>
      {children ? <p className="text-text-secondary text-sm">{children}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "inline-flex h-8 items-center justify-center rounded-[var(--radius-2)]",
            "bg-action-primary-bg text-text-primary px-3 text-xs font-medium",
            "ease-spring hover:bg-action-primary-hover transition-all duration-200 active:scale-[0.98]",
            "focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
          )}
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

EmptyStateInline.displayName = "EmptyState.Inline";
