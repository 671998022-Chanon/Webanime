// @nexus/ui — Dropdown primitive (compound)
// Wraps @radix-ui/react-dropdown-menu. Keyboard navigation, sub-menus, and
// icon slots are supported.

"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as React from "react";

import { cn } from "../lib/cn";

export const Dropdown = DropdownMenuPrimitive.Root;
export const DropdownTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownGroup = DropdownMenuPrimitive.Group;
export const DropdownPortal = DropdownMenuPrimitive.Portal;
export const DropdownSub = DropdownMenuPrimitive.Sub;

/* ---------------- Content ---------------- */

export interface DropdownContentProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
> {}

export const DropdownContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  DropdownContentProps
>(({ className, sideOffset = 6, children, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        data-slot="dropdown-content"
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
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownContent.displayName = "Dropdown.Content";

/* ---------------- Item ---------------- */

export interface DropdownItemProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
> {
  /** Render an icon before the children. */
  icon?: React.ReactNode;
  /** Render a shortcut hint after the children. */
  shortcut?: string;
  /** Use the destructive variant (red text). */
  destructive?: boolean;
}

export const DropdownItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  DropdownItemProps
>(({ className, icon, shortcut, destructive = false, children, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot="dropdown-item"
      data-destructive={destructive || undefined}
      className={cn(
        "group relative flex items-center gap-2 rounded-[var(--radius-2)] px-2.5 py-2.5",
        "text-text-primary cursor-pointer select-none text-sm",
        "ease-spring transition-colors duration-150",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "focus-visible:bg-action-ghost-hover focus-visible:text-text-primary focus-visible:outline-none",
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
    </DropdownMenuPrimitive.Item>
  );
});
DropdownItem.displayName = "Dropdown.Item";

/* ---------------- Divider ---------------- */

export const DropdownDivider = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    data-slot="dropdown-divider"
    className={cn("bg-border-subtle my-1 h-px", className)}
    {...props}
  />
));
DropdownDivider.displayName = "Dropdown.Divider";

/* ---------------- Label ---------------- */

export const DropdownLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    data-slot="dropdown-label"
    className={cn("text-text-tertiary px-2.5 py-1.5 text-xs font-medium", className)}
    {...props}
  />
));
DropdownLabel.displayName = "Dropdown.Label";
