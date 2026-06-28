// @nexus/ui — ContextMenu primitive (compound)
// Wraps @radix-ui/react-context-menu. Opens on right-click (or context menu trigger).
// Keyboard navigation, sub-menus, and icon slots supported.

"use client";

import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import * as React from "react";

import { cn } from "../lib/cn";

export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuGroup = ContextMenuPrimitive.Group;
export const ContextMenuPortal = ContextMenuPrimitive.Portal;
export const ContextMenuSub = ContextMenuPrimitive.Sub;

/* ---------------- Content ---------------- */

export interface ContextMenuContentProps extends React.ComponentPropsWithoutRef<
  typeof ContextMenuPrimitive.Content
> {}

export const ContextMenuContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Content>,
  ContextMenuContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={ref}
        data-slot="context-menu-content"
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
      </ContextMenuPrimitive.Content>
    </ContextMenuPrimitive.Portal>
  );
});
ContextMenuContent.displayName = "ContextMenu.Content";

/* ---------------- Sub-content ---------------- */

export interface ContextMenuSubContentProps extends React.ComponentPropsWithoutRef<
  typeof ContextMenuPrimitive.SubContent
> {}

export const ContextMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubContent>,
  ContextMenuSubContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent
        ref={ref}
        data-slot="context-menu-sub-content"
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
      </ContextMenuPrimitive.SubContent>
    </ContextMenuPrimitive.Portal>
  );
});
ContextMenuSubContent.displayName = "ContextMenu.SubContent";

/* ---------------- Sub-trigger ---------------- */

export interface ContextMenuSubTriggerProps extends React.ComponentPropsWithoutRef<
  typeof ContextMenuPrimitive.SubTrigger
> {
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
}

export const ContextMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubTrigger>,
  ContextMenuSubTriggerProps
>(({ className, icon, shortcut, destructive = false, children, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.SubTrigger
      ref={ref}
      data-slot="context-menu-sub-trigger"
      data-destructive={destructive || undefined}
      className={cn(
        "group relative flex items-center gap-2 rounded-[var(--radius-2)] px-2.5 py-2.5",
        "text-text-primary cursor-pointer select-none text-sm",
        "ease-spring transition-colors duration-150",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[state=open]:bg-action-ghost-hover data-[state=open]:text-text-primary",
        destructive && "text-error",
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
    </ContextMenuPrimitive.SubTrigger>
  );
});
ContextMenuSubTrigger.displayName = "ContextMenu.SubTrigger";

/* ---------------- Item ---------------- */

export interface ContextMenuItemProps extends React.ComponentPropsWithoutRef<
  typeof ContextMenuPrimitive.Item
> {
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
}

export const ContextMenuItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Item>,
  ContextMenuItemProps
>(({ className, icon, shortcut, destructive = false, children, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.Item
      ref={ref}
      data-slot="context-menu-item"
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
    </ContextMenuPrimitive.Item>
  );
});
ContextMenuItem.displayName = "ContextMenu.Item";

/* ---------------- Separator ---------------- */

export const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    data-slot="context-menu-separator"
    className={cn("bg-border-subtle my-1 h-px", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = "ContextMenu.Separator";

/* ---------------- Label ---------------- */

export const ContextMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    data-slot="context-menu-label"
    className={cn("text-text-tertiary px-2.5 py-1.5 text-xs font-medium", className)}
    {...props}
  />
));
ContextMenuLabel.displayName = "ContextMenu.Label";
