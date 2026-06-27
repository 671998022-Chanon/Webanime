// @nexus/ui — IconButton primitive
// Square button for icon-only actions. Enforces accessible labelling.
// Variants and sizes mirror Button. Uses the same CVA class set.

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";
import { Spinner } from "./spinner";

export const iconButtonVariants = cva(
  /* base */
  [
    "inline-flex shrink-0 items-center justify-center",
    "select-none whitespace-nowrap rounded-[var(--radius-4)]",
    "text-sm font-medium leading-none",
    "transition-[background-color,border-color,box-shadow,transform] duration-200 ease-spring",
    "outline-none border border-transparent",
    "cursor-pointer",
    "focus-visible:ring-2 focus-visible:ring-aether-4/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
    "active:scale-[0.98]",
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-action-primary-bg text-action-primary-text shadow-1 hover:bg-action-primary-hover active:bg-action-primary-pressed",
        secondary:
          "bg-action-secondary-bg text-action-secondary-text border-border-subtle hover:bg-action-secondary-hover",
        ghost:
          "bg-transparent text-text-secondary hover:bg-action-ghost-hover hover:text-text-primary",
        destructive:
          "bg-error-muted text-error border-error/50 hover:bg-error hover:text-text-primary",
        accent:
          "bg-action-accent-bg text-action-accent-text shadow-1 hover:brightness-110 active:brightness-95",
        link: "bg-transparent text-aether-6 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 w-8 [&_svg:not([class*='size-'])]:size-3",
        md: "h-9 w-9 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-11 w-11 [&_svg:not([class*='size-'])]:size-5",
        xl: "h-12 w-12 [&_svg:not([class*='size-'])]:size-5",
      },
      loading: {
        true: "cursor-wait",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
      loading: false,
    },
  },
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
  /** Render as child element (e.g. Slot for asChild). */
  asChild?: boolean;
  /** Show spinner and disable interaction. */
  loading?: boolean;
  /** Accessible label for screen readers. Required — icon buttons have no visible text. */
  "aria-label": string;
}

export function IconButton({
  className,
  variant,
  size,
  loading = false,
  disabled,
  asChild = false,
  children,
  ...props
}: IconButtonProps) {
  const isDisabled = disabled || loading;
  const sharedProps = {
    "aria-disabled": isDisabled || undefined,
    "aria-busy": loading || undefined,
    "data-slot": "icon-button",
    "data-variant": variant,
    "data-size": size,
    className: cn(iconButtonVariants({ variant, size, loading }), className),
    disabled: isDisabled,
  };

  if (asChild) {
    return (
      <Slot {...sharedProps} {...(props as React.ComponentPropsWithoutRef<typeof Slot>)}>
        {loading ? <Spinner className="animate-spin" /> : children}
      </Slot>
    );
  }

  return (
    <button {...sharedProps} {...props}>
      {loading ? <Spinner className="animate-spin" /> : children}
    </button>
  );
}
