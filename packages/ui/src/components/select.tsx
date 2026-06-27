// @nexus/ui — Select primitive
// Wraps @radix-ui/react-select. Single-select with search on the trigger.
// Native fallback on mobile is left to the consumer (Radix does not do this);
// this component exposes a consistent API for both desktop and mobile.

"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;
export const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    data-slot="select-trigger"
    className={cn(
      "inline-flex w-full items-center justify-between gap-2 rounded-[var(--radius-4)]",
      "bg-void-2 border-border-default border px-3 py-2",
      "text-text-primary text-sm",
      "ease-spring transition-[border-color,box-shadow] duration-200",
      "hover:border-border-strong",
      "focus-visible:border-border-accent focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
      "data-[placeholder]:text-text-placeholder",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="text-text-tertiary size-4" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "Select.Trigger";

export function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn("flex items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronUp className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

export function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn("flex items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronDown className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export interface SelectContentProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Content
> {}

export const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      data-slot="select-content"
      position={position}
      className={cn(
        "z-dropdown w-full overflow-hidden rounded-[var(--radius-4)]",
        "bg-surface-overlay border-border-subtle/40 shadow-2 border",
        "data-[state=open]:animate-[dropdown-enter_150ms_ease-out]",
        "data-[state=closed]:animate-[dropdown-exit_150ms_ease-in]",
        position === "popper" && "max-h-64",
        className,
      )}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" && "h-[var(--radix-select-trigger-height)] w-full",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "Select.Content";

export interface SelectItemProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Item
> {}

export const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn(
      "relative flex w-full items-center gap-2 rounded-[var(--radius-2)] px-2.5 py-2",
      "text-text-primary cursor-pointer select-none text-sm",
      "ease-spring transition-colors duration-150",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "data-[state=checked]:bg-aether-4/15 data-[state=checked]:text-aether-6",
      "focus-visible:bg-action-ghost-hover focus-visible:outline-none",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="ml-auto">
      <Check className="size-4" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "Select.Item";

export const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn("text-text-tertiary px-2.5 py-1.5 text-xs font-medium", className)}
    {...props}
  />
));
SelectLabel.displayName = "Select.Label";

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn("bg-border-subtle -mx-1 my-1 h-px", className)}
    {...props}
  />
));
SelectSeparator.displayName = "Select.Separator";
