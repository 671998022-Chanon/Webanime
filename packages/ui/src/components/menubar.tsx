// @nexus/ui — Menubar primitive (compound)
// Wraps @radix-ui/react-menubar. Horizontal app menubar with sub-menus.
// Arrow-key navigation between items; Enter/Space to activate; Escape to close.

"use client";

import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

export const Menubar = MenubarPrimitive.Root;
// Explicit type required to avoid leaking Radix's internal context type into the public API.
export const MenubarMenu: typeof MenubarPrimitive.Menu = MenubarPrimitive.Menu;
export const MenubarGroup = MenubarPrimitive.Group;
export const MenubarPortal = MenubarPrimitive.Portal;
export const MenubarSub = MenubarPrimitive.Sub;
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

/* ---------------- Trigger ---------------- */

export interface MenubarTriggerProps extends React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.Trigger
> {}

export const MenubarTrigger = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Trigger>,
  MenubarTriggerProps
>(({ className, children, ...props }, ref) => {
  return (
    <MenubarPrimitive.Trigger
      ref={ref}
      data-slot="menubar-trigger"
      className={cn(
        "flex cursor-pointer select-none items-center rounded-[var(--radius-2)] px-3 py-1.5",
        "text-text-primary text-sm font-medium",
        "ease-spring transition-colors duration-150",
        "focus-visible:bg-action-ghost-hover focus-visible:outline-none",
        "data-[state=open]:bg-action-ghost-hover",
        className,
      )}
      {...props}
    >
      {children}
    </MenubarPrimitive.Trigger>
  );
});
MenubarTrigger.displayName = "Menubar.Trigger";

/* ---------------- Content ---------------- */

export interface MenubarContentProps extends React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.Content
> {}

export const MenubarContent = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Content>,
  MenubarContentProps
>(({ className, align = "start", sideOffset = 6, children, ...props }, ref) => {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        data-slot="menubar-content"
        className={cn(
          "z-dropdown min-w-48 overflow-hidden rounded-[var(--radius-4)]",
          "bg-surface-overlay border-border-subtle/40 shadow-2 border p-1",
          "data-[state=open]:animate-[dropdown-enter_150ms_ease-out]",
          "data-[state=closed]:animate-[dropdown-exit_150ms_ease-in]",
          className,
        )}
        {...props}
      >
        {children}
      </MenubarPrimitive.Content>
    </MenubarPrimitive.Portal>
  );
});
MenubarContent.displayName = "Menubar.Content";

/* ---------------- Sub-content ---------------- */

export interface MenubarSubContentProps extends React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.SubContent
> {}

export const MenubarSubContent = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.SubContent>,
  MenubarSubContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.SubContent
        ref={ref}
        data-slot="menubar-sub-content"
        className={cn(
          "z-dropdown min-w-48 overflow-hidden rounded-[var(--radius-4)]",
          "bg-surface-overlay border-border-subtle/40 shadow-2 border p-1",
          "data-[state=open]:animate-[dropdown-enter_150ms_ease-out]",
          "data-[state=closed]:animate-[dropdown-exit_150ms_ease-in]",
          className,
        )}
        {...props}
      >
        {children}
      </MenubarPrimitive.SubContent>
    </MenubarPrimitive.Portal>
  );
});
MenubarSubContent.displayName = "Menubar.SubContent";

/* ---------------- Sub-trigger ---------------- */

export interface MenubarSubTriggerProps extends React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.SubTrigger
> {
  icon?: React.ReactNode;
  shortcut?: string;
  inset?: boolean;
}

export const MenubarSubTrigger = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.SubTrigger>,
  MenubarSubTriggerProps
>(({ className, icon, shortcut, inset = false, children, ...props }, ref) => {
  return (
    <MenubarPrimitive.SubTrigger
      ref={ref}
      data-slot="menubar-sub-trigger"
      data-inset={inset || undefined}
      className={cn(
        "group relative flex items-center gap-2 rounded-[var(--radius-2)] px-2.5 py-2.5",
        "text-text-primary cursor-pointer select-none text-sm",
        "ease-spring transition-colors duration-150",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[state=open]:bg-action-ghost-hover data-[state=open]:text-text-primary",
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span aria-hidden="true" className="text-text-tertiary group-hover:text-text-secondary">
          {icon}
        </span>
      ) : null}
      <span className="flex-1">{children}</span>
      {shortcut ? (
        <span className="text-text-tertiary text-xs">{shortcut}</span>
      ) : (
        <ChevronRight className="text-text-tertiary size-4" />
      )}
    </MenubarPrimitive.SubTrigger>
  );
});
MenubarSubTrigger.displayName = "Menubar.SubTrigger";

/* ---------------- Item ---------------- */

export interface MenubarItemProps extends React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.Item
> {
  icon?: React.ReactNode;
  shortcut?: string;
  inset?: boolean;
  destructive?: boolean;
}

export const MenubarItem = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Item>,
  MenubarItemProps
>(({ className, icon, shortcut, inset = false, destructive = false, children, ...props }, ref) => {
  return (
    <MenubarPrimitive.Item
      ref={ref}
      data-slot="menubar-item"
      data-inset={inset || undefined}
      data-destructive={destructive || undefined}
      className={cn(
        "group relative flex items-center gap-2 rounded-[var(--radius-2)] px-2.5 py-2.5",
        "text-text-primary cursor-pointer select-none text-sm",
        "ease-spring transition-colors duration-150",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "focus-visible:bg-action-ghost-hover focus-visible:text-text-primary focus-visible:outline-none",
        inset && "pl-8",
        destructive && "text-error focus-visible:text-error",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span aria-hidden="true" className="text-text-tertiary group-hover:text-text-secondary">
          {icon}
        </span>
      ) : null}
      <span className="flex-1">{children}</span>
      {shortcut ? <span className="text-text-tertiary text-xs">{shortcut}</span> : null}
    </MenubarPrimitive.Item>
  );
});
MenubarItem.displayName = "Menubar.Item";

/* ---------------- CheckboxItem ---------------- */

export interface MenubarCheckboxItemProps extends React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.CheckboxItem
> {}

export const MenubarCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.CheckboxItem>,
  MenubarCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => {
  return (
    <MenubarPrimitive.CheckboxItem
      ref={ref}
      data-slot="menubar-checkbox-item"
      checked={checked}
      className={cn(
        "group relative flex items-center gap-2 rounded-[var(--radius-2)] py-2.5 pl-8 pr-2.5",
        "text-text-primary cursor-pointer select-none text-sm",
        "ease-spring transition-colors duration-150",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "focus-visible:bg-action-ghost-hover focus-visible:text-text-primary focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute left-2.5 inline-flex size-4 items-center justify-center"
      >
        <MenubarPrimitive.ItemIndicator>
          <Check className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
});
MenubarCheckboxItem.displayName = "Menubar.CheckboxItem";

/* ---------------- RadioItem ---------------- */

export interface MenubarRadioItemProps extends React.ComponentPropsWithoutRef<
  typeof MenubarPrimitive.RadioItem
> {}

export const MenubarRadioItem = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.RadioItem>,
  MenubarRadioItemProps
>(({ className, children, ...props }, ref) => {
  return (
    <MenubarPrimitive.RadioItem
      ref={ref}
      data-slot="menubar-radio-item"
      className={cn(
        "group relative flex items-center gap-2 rounded-[var(--radius-2)] py-2.5 pl-8 pr-2.5",
        "text-text-primary cursor-pointer select-none text-sm",
        "ease-spring transition-colors duration-150",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "focus-visible:bg-action-ghost-hover focus-visible:text-text-primary focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute left-2.5 inline-flex size-4 items-center justify-center"
      >
        <MenubarPrimitive.ItemIndicator>
          <Circle className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
});
MenubarRadioItem.displayName = "Menubar.RadioItem";

/* ---------------- Separator ---------------- */

export const MenubarSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    data-slot="menubar-separator"
    className={cn("bg-border-subtle my-1 h-px", className)}
    {...props}
  />
));
MenubarSeparator.displayName = "Menubar.Separator";

/* ---------------- Label ---------------- */

export const MenubarLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    data-slot="menubar-label"
    className={cn("text-text-tertiary px-2.5 py-1.5 text-xs font-medium", className)}
    {...props}
  />
));
MenubarLabel.displayName = "Menubar.Label";

/* ---------------- Shortcut ---------------- */

export interface MenubarShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function MenubarShortcut({ className, ...props }: MenubarShortcutProps) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn("text-text-tertiary text-xs", className)}
      {...props}
    />
  );
}
MenubarShortcut.displayName = "Menubar.Shortcut";
