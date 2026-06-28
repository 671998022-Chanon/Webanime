// @nexus/ui — Badge primitive
// Variants: default, success, warning, error, info
// Sizes: sm, md (default)

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

export const badgeVariants = cva(
  [
    "inline-flex items-center gap-1 rounded-[var(--radius-full)]",
    "font-medium leading-none whitespace-nowrap select-none",
    "border",
    "transition-colors duration-200 ease-spring",
  ],
  {
    variants: {
      variant: {
        default: "bg-void-3 text-text-secondary border-border-subtle",
        success: "bg-success-muted/30 text-success border-success/40",
        warning: "bg-warning-muted/30 text-warning border-warning/40",
        error: "bg-error-muted/30 text-error border-error/40",
        info: "bg-aether-4/15 text-aether-6 border-aether-4/30",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[10px]",
        md: "px-2 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}
