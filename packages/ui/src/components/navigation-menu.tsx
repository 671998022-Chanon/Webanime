// @nexus/ui — NavigationMenu primitive (compound)
// Wraps @radix-ui/react-navigation-menu. Browse mega-menu panel.
// See docs/05-ui/Navigation.md §3.
// Arrow keys (↑↓ to switch triggers, Enter/Space to activate, Esc to close).
// Animation via data-[motion] hooks + @keyframes in tailwind.css.

"use client";

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

/* ---------------- Root ---------------- */

export interface NavigationMenuProps extends React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Root
> {}

export const NavigationMenu = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Root>,
  NavigationMenuProps
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    data-slot="navigation-menu"
    className={cn("relative flex max-w-max items-center", className)}
    {...props}
  >
    {children}
    {/* Viewport must be a direct child of Root so Radix registers it
        via its own context. Positioning happens through CSS below. */}
    <NavigationMenuViewportImpl />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = "NavigationMenu";

/* ---------------- List ---------------- */

export interface NavigationMenuListProps extends React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.List
> {}

export const NavigationMenuList = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.List>,
  NavigationMenuListProps
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    data-slot="navigation-menu-list"
    className={cn("flex flex-1 list-none items-center justify-center gap-1", className)}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.List>
));
NavigationMenuList.displayName = "NavigationMenu.List";

/* ---------------- Item ---------------- */

export interface NavigationMenuItemProps extends React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Item
> {}

export const NavigationMenuItem = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Item>,
  NavigationMenuItemProps
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Item
    ref={ref}
    data-slot="navigation-menu-item"
    className={cn("relative", className)}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.Item>
));
NavigationMenuItem.displayName = "NavigationMenuItem";

/* ---------------- Link ---------------- */

export interface NavigationMenuLinkProps extends React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Link
> {}

export const NavigationMenuLink = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Link>,
  NavigationMenuLinkProps
>(({ className, children, active = false, ...props }, ref) => (
  <NavigationMenuPrimitive.Link
    ref={ref}
    active={active}
    data-slot="navigation-menu-link"
    className={cn(
      "flex items-center gap-2 rounded-[var(--radius-2)] px-3 py-2",
      "text-text-secondary text-sm font-medium",
      "ease-spring transition-colors duration-150",
      "hover:bg-action-ghost-hover hover:text-text-primary",
      active && "text-primary",
      className,
    )}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.Link>
));
NavigationMenuLink.displayName = "NavigationMenu.Link";

/* ---------------- Trigger ---------------- */

export interface NavigationMenuTriggerProps extends React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Trigger
> {
  /** Whether to render a chevron indicator. @default true */
  chevron?: boolean;
}

const ChevronIndicator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "text-text-tertiary size-4 shrink-0",
        "ease-spring transition-transform duration-200 group-data-[state=open]:rotate-180",
        className,
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </span>
  ),
);
ChevronIndicator.displayName = "NavigationMenu.ChevronIndicator";

export const NavigationMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Trigger>,
  NavigationMenuTriggerProps
>(({ className, children, chevron = true, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    data-slot="navigation-menu-trigger"
    className={cn(
      "group inline-flex items-center justify-center gap-1 rounded-[var(--radius-2)] px-3 py-2",
      "text-text-secondary text-sm font-medium",
      "ease-spring transition-colors duration-150",
      "hover:text-text-primary",
      "focus-visible:ring-action-primary/40 focus-visible:outline-none focus-visible:ring-2",
      "data-[state=open]:text-text-primary data-[state=open]:bg-action-ghost-hover",
      className,
    )}
    {...props}
  >
    {children}
    {chevron ? <ChevronIndicator /> : null}
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = "NavigationMenu.Trigger";

/* ---------------- Content ---------------- */

export interface NavigationMenuContentProps extends React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Content
> {
  /**
   * Direction hook for enter animations (cmdk-style). Accepted by animation
   * utilities via `data-[motion=from-start|from-end|from-center]`.
   * @default "from-center"
   */
  motion?: "from-start" | "from-end" | "from-center";
}

export const NavigationMenuContent = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Content>,
  NavigationMenuContentProps
>(({ className, motion = "from-center", children, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    data-slot="navigation-menu-content"
    data-motion={motion}
    className={cn(
      "absolute left-0 top-full origin-top",
      "z-dropdown w-auto min-w-64 overflow-hidden rounded-[var(--radius-4)]",
      "bg-surface-overlay border-border-subtle/40 shadow-2 border p-4 backdrop-blur-lg",
      "data-[motion=from-start]:animate-[nav-menu-enter_150ms_ease-out]",
      "data-[motion=from-end]:animate-[nav-menu-enter_150ms_ease-out]",
      "data-[motion=from-center]:animate-[nav-menu-enter_150ms_ease-out]",
      "data-[state=closed]:animate-[nav-menu-exit_100ms_ease-in]",
      className,
    )}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.Content>
));
NavigationMenuContent.displayName = "NavigationMenu.Content";

/* ---------------- Indicator ---------------- */

export interface NavigationMenuIndicatorProps extends React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Indicator
> {}

/** Arrow-shaped indicator that points to the trigger below. Radix positions
 *  it from the active trigger's bounding box. Render inside the root next
 *  to the list. */
export const NavigationMenuIndicator = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Indicator>,
  NavigationMenuIndicatorProps
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    data-slot="navigation-menu-indicator"
    forceMount
    className={cn(
      "z-dropdown absolute top-full flex h-2 items-end justify-center overflow-hidden",
      "bg-surface-overlay border-border-subtle/40 shadow-2 border-x border-t",
      "data-[state=visible]:animate-[nav-menu-enter_150ms_ease-out]",
      "data-[state=hidden]:animate-[nav-menu-exit_100ms_ease-in]",
      className,
    )}
    {...props}
  >
    <div className="bg-surface-overlay relative top-px size-2 rotate-45 rounded-tl" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = "NavigationMenu.Indicator";

/* ---------------- Viewport ---------------- */

interface NavigationMenuViewportImplProps extends React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Viewport
> {}

/** Internal viewport — rendered inside NavigationMenu root so Radix can
 *  position content via its own context. Not exported directly; use
 *  NavigationMenu and let it render the viewport. */
const NavigationMenuViewportImpl = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Viewport>,
  NavigationMenuViewportImplProps
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Viewport
    ref={ref}
    data-slot="navigation-menu-viewport"
    className={cn(
      "absolute left-0 top-full w-full min-w-64 overflow-hidden",
      "data-[state=open]:animate-[nav-menu-enter_150ms_ease-out]",
      "data-[state=closed]:animate-[nav-menu-exit_100ms_ease-in]",
      className,
    )}
    {...props}
  />
));
NavigationMenuViewportImpl.displayName = "NavigationMenu.Viewport";

/** Public Viewport export for the rare case a consumer needs a separate one
 *  (e.g. inside a header dropdown positioned relative to header, not root).
 *  Prefer letting NavigationMenu render its own viewport. */
export const NavigationMenuViewport = NavigationMenuViewportImpl;
