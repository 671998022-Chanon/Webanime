// @nexus/ui — Tabs primitive (compound)
// Wraps @radix-ui/react-tabs. Vertical and horizontal orientation.
// Keyboard navigation is provided by Radix (←→↑↓ to switch, Home/End).

"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "../lib/cn";

export const Tabs = TabsPrimitive.Root;

/* ---------------- List ---------------- */

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  /** Visual variant. @default "default" */
  variant?: "default" | "pills";
}

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "inline-flex shrink-0 items-center",
        variant === "default"
          ? "border-border-subtle gap-1 border-b"
          : "bg-void-2 gap-1 rounded-[var(--radius-4)] p-1",
        className,
      )}
      {...props}
    />
  );
});
TabsList.displayName = "Tabs.List";

/* ---------------- Trigger ---------------- */

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5",
        "text-text-secondary select-none text-sm font-medium",
        "ease-spring transition-colors duration-200",
        "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "data-[state=active]:text-text-primary",
        "data-[state=active]:border-action-primary-bg data-[state=active]:border-b-2",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = "Tabs.Trigger";

/* ---------------- Content ---------------- */

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.Content
      ref={ref}
      data-slot="tabs-content"
      className={cn("outline-none focus-visible:ring-0", className)}
      {...props}
    />
  );
});
TabsContent.displayName = "Tabs.Content";
