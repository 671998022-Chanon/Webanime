// @nexus/ui — HoverCard primitive (compound)
// Wraps @radix-ui/react-hover-card. Opens on hover/focus; non-modal.
// Escape closes; focus is NOT trapped (non-modal).

"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as React from "react";

import { cn } from "../lib/cn";

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

/* ---------------- Content ---------------- */

export interface HoverCardContentProps extends React.ComponentPropsWithoutRef<
  typeof HoverCardPrimitive.Content
> {}

export const HoverCardContent = React.forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(({ className, align = "center", sideOffset = 6, children, ...props }, ref) => {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        data-slot="hover-card-content"
        className={cn(
          "z-dropdown w-72 overflow-hidden rounded-[var(--radius-4)]",
          "bg-surface-overlay border-border-subtle/40 shadow-2 border p-4",
          "text-text-primary text-sm",
          "data-[state=open]:animate-[dropdown-enter_150ms_ease-out]",
          "data-[state=closed]:animate-[dropdown-exit_150ms_ease-in]",
          className,
        )}
        {...props}
      >
        {children}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  );
});
HoverCardContent.displayName = "HoverCard.Content";
