// @nexus/ui — Tooltip primitive
// Wraps @radix-ui/react-tooltip. Top, bottom, left, right placements.
// Delay before show; triggered on focus and hover.

"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "../lib/cn";

export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export interface TooltipContentProps extends React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> {}

export const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 6, children, ...props }, ref) => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        data-slot="tooltip-content"
        className={cn(
          "z-dropdown max-w-xs px-3 py-2",
          "bg-surface-overlay border-border-subtle/40 shadow-2 rounded-[var(--radius-4)] border",
          "text-text-primary text-xs",
          "animate-[tooltip-enter_150ms_ease-out]",
          className,
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});
TooltipContent.displayName = "Tooltip.Content";

/** Convenience wrapper: composes Provider + Root + Trigger + Content. */
export interface WithTooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  delayDuration?: number;
}

export function WithTooltip({
  content,
  children,
  side = "top",
  delayDuration = 200,
}: WithTooltipProps) {
  return (
    <TooltipProvider>
      <TooltipRoot delayDuration={delayDuration}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}
