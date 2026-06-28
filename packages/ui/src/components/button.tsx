/* eslint-disable react-refresh/only-export-components */ // buttonVariants (CVA) co-located by convention
// @nexus/ui — Button primitive
// Variants: primary, secondary, ghost, destructive, accent, link
// Sizes: sm, md (default), lg, xl
// States: rest, hover, focus-visible, active, disabled, loading

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

import { Spinner } from "./spinner";

export const buttonVariants = cva(
  /* base — applies to every variant/size */
  [
    "inline-flex shrink-0 items-center justify-center gap-2",
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
        sm: "h-8 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        md: "h-9 px-3 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-11 px-4 text-base [&_svg:not([class*='size-'])]:size-5",
        xl: "h-12 px-5 text-base [&_svg:not([class*='size-'])]:size-5",
        icon: "h-9 w-9 p-0 [&_svg:not([class*='size-'])]:size-4",
      },
      loading: {
        true: "cursor-wait",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      loading: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Render as child element (e.g. Slot for asChild). */
  asChild?: boolean;
  /** Show spinner and disable interaction. */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const sharedProps = {
    "aria-disabled": isDisabled || undefined,
    "aria-busy": loading || undefined,
    "data-slot": "button",
    "data-variant": variant,
    "data-size": size,
    className: cn(buttonVariants({ variant, size, loading }), className),
    disabled: isDisabled,
  };

  if (asChild) {
    return (
      <Slot {...sharedProps} {...props}>
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
