import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-void-elevated text-text-primary border border-border-subtle",
        resonance: "bg-resonance/15 text-resonance border border-resonance/30",
        gold: "bg-rift-gold/15 text-rift-gold border border-rift-gold/30 shadow-glow-gold",
        outline: "border border-border-subtle text-text-secondary bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} role="status" {...props} />;
}

export { badgeVariants };
