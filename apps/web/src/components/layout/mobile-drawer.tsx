"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  Separator,
  Typography,
  cn,
} from "@nexus/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_GROUPS, isNavItemActive, type NavGroup, type NavItem } from "@/lib/nav-items";

interface MobileDrawerProps {
  /** Whether the drawer is open. */
  open: boolean;
  /** Callback when open state changes. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Mobile navigation drawer — slides from the right on small screens.
 * Uses @nexus/ui Drawer (Radix Dialog): focus trap, Esc-to-close, outside-click
 * close, and body scroll lock are all provided by the primitive.
 *
 * Mirrors the desktop sidebar's grouped structure (Discover / Library / Community)
 * by reusing NAV_GROUPS + isNavItemActive, so both surfaces stay in sync.
 */
export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const pathname = usePathname();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        direction="right"
        className="bg-surface-overlay border-border-subtle/40 backdrop-blur-lg"
      >
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle className="font-display text-text-primary text-lg font-semibold">
            Menu
          </DrawerTitle>
          {/* Close button is rendered by the DrawerContent primitive (top-right). */}
        </DrawerHeader>

        {/* Scrollable body so long nav lists stay reachable on short viewports. */}
        <DrawerBody className="px-2 pb-[env(safe-area-inset-bottom)]">
          <nav aria-label="Primary navigation">
            <ul className="flex flex-col gap-4">
              {NAV_GROUPS.map((group, groupIndex) => (
                <li key={group.id}>
                  {/* Visual separator between groups (not before the first). */}
                  {groupIndex > 0 && <Separator orientation="horizontal" className="mb-4" />}
                  <DrawerGroup
                    group={group}
                    pathname={pathname}
                    onSelect={() => onOpenChange(false)}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

/** A navigation group header + its links (mirrors SidebarGroup's group contract). */
function DrawerGroup({
  group,
  pathname,
  onSelect,
}: {
  group: NavGroup;
  pathname: string;
  onSelect: () => void;
}) {
  return (
    <>
      <Typography
        element="h2"
        id={`mobile-group-${group.id}-header`}
        size="xs"
        weight="semibold"
        tracking="wide"
        className="text-text-tertiary mb-2 px-3 uppercase"
      >
        {group.label}
      </Typography>
      <ul className="flex flex-col gap-1" aria-labelledby={`mobile-group-${group.id}-header`}>
        {group.items.map((item) => (
          <li key={item.href}>
            <DrawerNavLink
              item={item}
              active={isNavItemActive(item.href, pathname)}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

/** A single nav link — matches the desktop SidebarNavLink's expanded style. */
function DrawerNavLink({
  item,
  active,
  onSelect,
}: {
  item: NavItem;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-3)] px-3 py-2.5",
        "text-sm font-medium",
        "ease-spring transition-colors duration-150",
        "hover:bg-action-ghost-hover hover:text-text-primary",
        "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        active ? "bg-action-ghost-hover text-text-primary" : "text-text-secondary",
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
