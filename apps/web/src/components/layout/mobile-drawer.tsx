"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  Separator,
  IconButton,
  cn,
} from "@nexus/ui";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, SECONDARY_ITEMS } from "@/lib/nav-items";

interface MobileDrawerProps {
  /** Whether the drawer is open. */
  open: boolean;
  /** Callback when open state changes. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Mobile navigation drawer — slides from right on small screens.
 * Uses @nexus/ui Drawer (Radix Dialog) with direction="right".
 * Active route is highlighted. Closes on link navigation.
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
        </DrawerHeader>

        <DrawerBody className="px-2">
          {/* Primary navigation */}
          <nav aria-label="Primary navigation">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius-3)] px-3 py-2.5",
                        "ease-spring text-sm font-medium transition-colors duration-150",
                        "hover:bg-action-ghost-hover",
                        "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        isActive
                          ? "bg-action-ghost-hover text-text-primary"
                          : "text-text-secondary hover:text-text-primary",
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Separator orientation="horizontal" className="my-4" />

          {/* Secondary navigation */}
          <nav aria-label="Account navigation">
            <ul className="flex flex-col gap-1">
              {SECONDARY_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius-3)] px-3 py-2.5",
                        "ease-spring text-sm font-medium transition-colors duration-150",
                        "hover:bg-action-ghost-hover",
                        "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                        isActive
                          ? "bg-action-ghost-hover text-text-primary"
                          : "text-text-secondary hover:text-text-primary",
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
