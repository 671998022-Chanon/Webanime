"use client";

import {
  IconButton,
  ScrollArea,
  ScrollAreaViewport,
  Separator,
  Typography,
  WithTooltip,
  cn,
} from "@nexus/ui";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  NAV_GROUPS,
  SIDEBAR_FOOTER,
  isNavItemActive,
  type NavGroup,
  type NavItem,
} from "@/lib/nav-items";

interface SidebarProps {
  /** Controlled collapsed state. If omitted, sidebar manages its own state. */
  collapsed?: boolean;
  /** Callback when collapsed state changes. */
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Desktop sidebar — 240px expanded, 64px collapsed. Fixed left, full height
 * below the header. Glassmorphic surface (Standard variant: raised/70 +
 * backdrop-blur-md + border + shadow-1). Renders grouped navigation with
 * active-state highlighting and a pinned collapse toggle.
 *
 * Hidden on mobile (< md); mobile navigation is provided by the MobileDrawer.
 */
export function Sidebar({ collapsed: controlledCollapsed, onCollapsedChange }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const pathname = usePathname();

  function toggleCollapsed() {
    const next = !collapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }

  return (
    <aside
      id="site-sidebar"
      data-slot="sidebar"
      data-collapsed={collapsed || undefined}
      aria-label="Sidebar navigation"
      className={cn(
        "z-base hidden flex-col md:flex",
        "fixed bottom-0 left-0 top-0",
        collapsed ? "w-16" : "w-60",
        "border-border-subtle/15 border-r",
        "bg-surface-raised/70 shadow-1 backdrop-blur-md",
        "ease-spring transition-[width] duration-200",
        "pt-20" /* offset for the 80px header */,
      )}
    >
      {/* Scrollable navigation groups — footer + toggle stay pinned below */}
      <ScrollArea className="flex-1">
        <ScrollAreaViewport className="px-2 py-4">
          <nav aria-label="Primary navigation">
            <ul className="flex flex-col gap-4">
              {NAV_GROUPS.map((group) => (
                <li key={group.id}>
                  <SidebarGroup group={group} collapsed={collapsed} pathname={pathname} />
                </li>
              ))}
            </ul>
          </nav>
        </ScrollAreaViewport>
      </ScrollArea>

      <Separator orientation="horizontal" className="mx-3" />

      {/* Footer group + collapse toggle (pinned to the bottom) */}
      <div className="px-2 py-4">
        <nav aria-label="Account navigation">
          <ul className="flex flex-col gap-1">
            {SIDEBAR_FOOTER.map((item) => (
              <li key={item.href}>
                <SidebarNavLink
                  item={item}
                  collapsed={collapsed}
                  active={isNavItemActive(item.href, pathname)}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="px-2 pb-4">
        <WithTooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
          <IconButton
            variant="ghost"
            size="sm"
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleCollapsed}
            className="w-full"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </IconButton>
        </WithTooltip>
      </div>
    </aside>
  );
}

/** A navigation group: optional header (expanded only) + its links. */
function SidebarGroup({
  group,
  collapsed,
  pathname,
}: {
  group: NavGroup;
  collapsed: boolean;
  pathname: string;
}) {
  return (
    <>
      {!collapsed && (
        <Typography
          element="h2"
          id={`group-${group.id}-header`}
          size="xs"
          weight="semibold"
          tracking="wide"
          className="text-text-tertiary mb-1 px-3 uppercase"
        >
          {group.label}
        </Typography>
      )}
      <ul
        className="flex flex-col gap-1"
        aria-labelledby={!collapsed ? `group-${group.id}-header` : undefined}
      >
        {group.items.map((item) => (
          <li key={item.href}>
            <SidebarNavLink
              item={item}
              collapsed={collapsed}
              active={isNavItemActive(item.href, pathname)}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

/** A single nav link — icon-only (with tooltip) when collapsed, icon + label when expanded. */
function SidebarNavLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-3)]",
        "text-sm font-medium",
        "ease-spring transition-colors duration-150",
        "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
        active
          ? "border-aether-4 bg-action-primary-bg/10 text-text-primary border-l-2"
          : "text-text-secondary hover:bg-action-ghost-hover hover:text-text-primary border-l-2 border-transparent",
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  // In collapsed mode the label is hidden — expose it via a tooltip so the link
  // stays identifiable (WCAG 1.4.13: tooltip is dismissable + persistent).
  if (collapsed) {
    return (
      <WithTooltip content={item.label} side="right">
        {link}
      </WithTooltip>
    );
  }

  return link;
}
