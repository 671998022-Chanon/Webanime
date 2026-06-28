// @nexus/ui — FormDescription primitive
// Long-form hint text beneath a field (e.g. password rules, format hints).
// Not a status message — FormMessage is for status.

import * as React from "react";

import { cn } from "../lib/cn";

export interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;

    return (
      <p
        ref={ref}
        className={cn("text-text-tertiary text-xs leading-relaxed", className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);
FormDescription.displayName = "FormDescription";
