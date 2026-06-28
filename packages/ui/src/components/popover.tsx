// @nexus/ui — Popover primitive (compound)
// Wraps @radix-ui/react-popover. Anchored floating content; non-modal by default.
// Focus moves into content on open; Escape closes and returns focus to trigger.

"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { cn } from "../lib/cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

/* ---------------- Content ---------------- */

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> {}

export const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, align = "center", sideOffset = 6, children, ...props }, ref) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        data-slot="popover-content"
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
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = "Popover.Content";
