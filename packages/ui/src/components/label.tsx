// @nexus/ui — Label
// Hand-rolled <label> wrapper. Radix's @radix-ui/react-label pulls in
// transitive peers (password-toggle-field, one-time-password-field) that break
// Next 16 SSR with React 19, so we style the native element directly.

import * as React from "react";

import { cn } from "../lib/cn";

const labelVariants = {
  default: "text-text-primary",
  error: "text-error",
} as const;

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Visual variant driven by the surrounding field state. @default "default" */
  variant?: keyof typeof labelVariants;
  /** Render as <span> instead of <label> (e.g., for aria-labelledby patterns). */
  as?: "label" | "span";
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant = "default", as: Tag = "label", ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none",
        "cursor-pointer select-none",
        labelVariants[variant],
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = "Label";
