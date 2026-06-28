// @nexus/ui — Accordion primitive (Radix-based)
// Accordion.Root > Accordion.Item > Accordion.Trigger + Accordion.Content
// Variants: default (single), multiple
// Animated expand/collapse using motion tokens

"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

const Accordion = AccordionPrimitive.Root;
Accordion.displayName = "Accordion";

/* ---------------- Item ---------------- */

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    data-slot="accordion-item"
    className={cn("border-border-subtle/40 border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "Accordion.Item";

/* ---------------- Trigger ---------------- */

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      data-slot="accordion-trigger"
      className={cn(
        "text-text-primary flex flex-1 items-center justify-between py-4 font-medium",
        "ease-spring transition-all duration-200",
        "[&[data-state=open]>svg]:rotate-180",
        "hover:text-aether-4 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="text-text-secondary ease-spring h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "Accordion.Trigger";

/* ---------------- Content ---------------- */

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    data-slot="accordion-content"
    className={cn(
      "text-text-secondary overflow-hidden text-sm",
      "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className,
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "Accordion.Content";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
