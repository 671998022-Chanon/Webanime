// @nexus/ui — Collapsible primitive (Radix-based)
// Collapsible.Root > Collapsible.Trigger + Collapsible.Content
// Generic — no chevron icon, no styling. Pure behavior wrapper.

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as React from "react";

import { cn } from "../lib/cn";

const Collapsible = CollapsiblePrimitive.Root;
Collapsible.displayName = "Collapsible";

const CollapsibleTrigger = CollapsiblePrimitive.Trigger;
CollapsibleTrigger.displayName = "Collapsible.Trigger";

const CollapsibleContent = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    data-slot="collapsible-content"
    className={cn(
      "overflow-hidden",
      "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
      className,
    )}
    {...props}
  />
));
CollapsibleContent.displayName = "Collapsible.Content";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
