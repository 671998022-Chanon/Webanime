"use client";

import { IconButton, Separator, cn } from "@nexus/ui";
import { WithTooltip } from "@nexus/ui";
import {
  Home,
  Compass,
  Clock,
  Heart,
  BookmarkPlus,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/** Navigation item consumed by the sidebar */
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** Primary navigation items */
const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: Compass },
  { href: "/continue-watching", label: "Continue Watching", icon: Clock },
  { href: "/watchlist", label: "Watchlist", icon: Heart },
  { href: "/bookmarks", label: "Bookmarks", icon: BookmarkPlus },
];

/** Secondary navigation items (bottom) */
const SECONDARY_ITEMS: NavItem[] = [{ href: "/settings", label: "Settings", icon: Settings }];

interface SidebarProps {
  /** Controlled collapsed state. If omitted, sidebar manages its own state. */
  collapsed?: boolean;
  /** Callback when collapsed state changes. */
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Desktop sidebar — 240px expanded, 64px collapsed. Fixed left, full height
 * below header. Glassmorphic surface. Collapsed mode shows icon-only with
 * tooltip labels. Expanded mode shows icon + label text.
 */
export function Sidebar({ collapsed: controlledCollapsed, onCollapsedChange }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;

  function toggleCollapsed() {
    const next = !collapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }

  const width = collapsed ? "w-16" : "w-60"; // 64px vs 240px

  return (
    <aside
      id="site-sidebar"
      data-slot="sidebar"
      data-collapsed={collapsed || undefined}
      className={cn(
        "z-base hidden flex-col md:flex",
        "fixed bottom-0 left-0 top-0",
        width,
        "border-border-subtle/40 border-r",
        "bg-surface-sunken/80 backdrop-blur-sm",
        "ease-spring transition-[width] duration-200",
        "pt-20" /* offset for header height (80px) + 0px gap */,
      )}
    >
      {/* Primary nav */}
      <nav aria-label="Primary navigation" className="flex-1 px-2 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink item={item} collapsed={collapsed} />
            </li>
          ))}
        </ul>
      </nav>

      <Separator orientation="horizontal" className="mx-3" />

      {/* Secondary nav (bottom) */}
      <nav aria-label="Account navigation" className="px-2 py-4">
        <ul className="flex flex-col gap-1">
          {SECONDARY_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink item={item} collapsed={collapsed} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse/expand toggle */}
      <div className="px-2 pb-4">
        <WithTooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
          <IconButton
            variant="ghost"
            size="sm"
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

/** Individual nav link — collapses to icon-only or expands with label */
function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-3)]",
        "text-text-secondary text-sm font-medium",
        "ease-spring transition-colors duration-150",
        "hover:bg-action-ghost-hover hover:text-text-primary",
        "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <WithTooltip content={item.label} side="right">
        {link}
      </WithTooltip>
    );
  }

  return link;
}
