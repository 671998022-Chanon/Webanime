// @nexus/ui — LinkButton primitive
// Polymorphic button that renders as an <a> element.
// Shares Button's visual variant system but replaces disabled/loading
// with aria-disabled + data-disabled (links cannot be natively disabled).

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

export const linkButtonVariants = cva(
  /* base — identical to Button */
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
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkButtonVariants> {
  /** Render as child element (e.g. Slot for asChild). */
  asChild?: boolean;
  /** Visually and semantically disable the link. */
  disabled?: boolean;
}

export function LinkButton({
  className,
  variant,
  size,
  disabled = false,
  asChild = false,
  children,
  ...props
}: LinkButtonProps) {
  const sharedProps = {
    "aria-disabled": disabled || undefined,
    "data-disabled": disabled || undefined,
    "data-slot": "link-button",
    "data-variant": variant,
    "data-size": size,
    className: cn(
      linkButtonVariants({ variant, size }),
      disabled && "pointer-events-none opacity-50",
      className,
    ),
    tabIndex: disabled ? -1 : props.tabIndex,
  };

  if (asChild) {
    return (
      <Slot {...sharedProps} {...(props as React.ComponentPropsWithoutRef<typeof Slot>)}>
        {children}
      </Slot>
    );
  }

  return (
    <a {...sharedProps} {...props}>
      {children}
    </a>
  );
}
