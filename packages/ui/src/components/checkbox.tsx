// @nexus/ui — Checkbox primitive
// Wraps @radix-ui/react-checkbox. Supports checked, indeterminate, disabled, label.
// WCAG: 44×44px touch target via padding on the wrapper label.

"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> {
  /** Label rendered to the right of the checkbox. */
  label?: string;
}

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, id, ...props }, ref) => {
  const inputId = id ?? React.useId();

  return (
    <label
      htmlFor={inputId}
      data-slot="checkbox"
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-2",
        "text-text-primary text-sm",
        "group",
        props.disabled && "cursor-not-allowed opacity-50",
        "min-h-11 min-w-11 items-center", // 44px touch target
        className,
      )}
    >
      <CheckboxPrimitive.Root
        ref={ref}
        id={inputId}
        className={cn(
          "h-4 w-4 shrink-0 rounded-[var(--radius-1)]",
          "border-border-default bg-void-2 border",
          "ease-spring transition-colors duration-200",
          "data-[state=checked]:bg-action-primary-bg data-[state=checked]:border-action-primary-bg",
          "data-[state=indeterminate]:bg-action-primary-bg data-[state=indeterminate]:border-action-primary-bg",
          "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="text-action-primary-text flex items-center justify-center">
          {props.checked === "indeterminate" ? (
            <Minus className="size-3" />
          ) : (
            <Check className="size-3" />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label ? <span>{label}</span> : null}
    </label>
  );
});
Checkbox.displayName = "Checkbox";
