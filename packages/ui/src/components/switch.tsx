// @nexus/ui — Switch primitive
// Wraps @radix-ui/react-switch. Supports label, checked, disabled.
// WCAG: 44×44px touch target via padding on the wrapper label.

"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "../lib/cn";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  /** Label rendered to the right of the switch. */
  label?: string;
}

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, label, id, ...props }, ref) => {
  const inputId = id ?? React.useId();

  return (
    <label
      htmlFor={inputId}
      data-slot="switch"
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-2",
        "text-text-primary text-sm",
        props.disabled && "cursor-not-allowed opacity-50",
        "min-h-11 min-w-11",
        className,
      )}
    >
      <SwitchPrimitives.Root
        ref={ref}
        id={inputId}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 items-center rounded-[var(--radius-full)]",
          "border border-transparent",
          "bg-void-6",
          "ease-spring transition-colors duration-200",
          "data-[state=checked]:bg-action-primary-bg",
          "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        )}
        {...props}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "block h-4 w-4 rounded-[var(--radius-full)]",
            "bg-surface-raised shadow-1",
            "ease-spring transition-transform duration-200",
            "translate-x-0.5",
            "data-[state=checked]:translate-x-[18px]",
          )}
        />
      </SwitchPrimitives.Root>
      {label ? <span>{label}</span> : null}
    </label>
  );
});
Switch.displayName = "Switch";
