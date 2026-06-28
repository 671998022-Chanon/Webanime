// @nexus/ui — FormMessage primitive
// Inline status text beneath a field. Renders only when children are provided,
// so callers can always mount it without conditional layout shifts.
//
// Variants map to design tokens:
//   destructive  → text-error        role="alert"
//   success      → text-success      role="status"
//   info         → text-info         role="status"
//   helper       → text-tertiary    role=undefined

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/cn";

const messageVariants = cva("text-xs leading-none", {
  variants: {
    variant: {
      destructive: "text-error",
      success: "text-success",
      info: "text-info",
      helper: "text-text-tertiary",
    },
  },
  defaultVariants: {
    variant: "helper",
  },
});

const roleByVariant = {
  destructive: "alert",
  success: "status",
  info: "status",
  helper: undefined,
} as const;

export interface FormMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof messageVariants> {}

export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, variant, children, ...props }, ref) => {
    if (!children) return null;

    const role = variant ? roleByVariant[variant] : undefined;

    return (
      <p
        ref={ref}
        role={role}
        aria-live={role === "alert" ? "assertive" : role === "status" ? "polite" : undefined}
        className={cn(messageVariants({ variant }), className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);
FormMessage.displayName = "FormMessage";
