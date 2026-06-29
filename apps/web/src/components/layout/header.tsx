"use client";

import { Container, IconButton, cn } from "@nexus/ui";
import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NotificationsPanel } from "@/components/user/notifications-panel";
import { useScrollPosition } from "@/hooks/use-scroll-position";
import { HEADER_NAV_ITEMS } from "@/lib/nav-items";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  onSearchOpen?: () => void;
  children?: React.ReactNode;
}

export function Header({ onMobileMenuToggle, onSearchOpen, children }: HeaderProps) {
  const { isScrolled } = useScrollPosition(10);
  const pathname = usePathname();

  return (
    <header
      id="site-header"
      data-slot="header"
      data-scrolled={isScrolled || undefined}
      className={cn(
        "z-sticky sticky top-0 w-full",
        "border-border-subtle/40 border-b",
        "bg-surface-base/80 backdrop-blur-md",
        "ease-spring transition-[height,background-color,border-color] duration-200",
        isScrolled ? "h-16" : "h-20",
      )}
    >
      <Container size="2xl" className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Left zone: mobile menu + logo */}
        <div className="flex items-center gap-3">
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Open menu"
            className="md:hidden"
            onClick={onMobileMenuToggle}
          >
            <Menu className="size-5" />
          </IconButton>
          <Link
            href="/"
            className="text-text-primary focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base flex items-center gap-2 rounded-[var(--radius-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect width="28" height="28" rx="6" className="fill-action-accent-bg" />
              <path
                d="M8 8L14 20L20 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-action-accent-text"
              />
            </svg>
            <span
              className={cn(
                "font-display text-lg font-bold tracking-tight",
                "ease-spring transition-[opacity,transform] duration-200",
                isScrolled ? "hidden sm:inline" : "inline",
              )}
            >
              Nexus
            </span>
          </Link>
        </div>

        {/* Center-left zone: desktop navigation */}
        <nav aria-label="Main navigation" className="mx-4 hidden items-center gap-1 md:flex">
          {HEADER_NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-[var(--radius-2)] px-3 py-1.5 text-sm transition-colors duration-150",
                  "hover:bg-action-ghost-hover hover:text-text-primary",
                  "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  isActive ? "text-text-primary font-medium" : "text-text-secondary",
                )}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="bg-action-primary-bg absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Center zone: desktop search trigger */}
        <div className="mx-8 hidden max-w-md flex-1 items-center justify-center md:flex">
          <button
            type="button"
            onClick={onSearchOpen}
            className={cn(
              "flex w-full items-center gap-2 rounded-[var(--radius-4)]",
              "bg-surface-raised/60 border-border-subtle/60 border",
              "text-text-placeholder px-3 py-1.5 text-sm",
              "hover:bg-surface-raised hover:border-border-default",
              "focus-visible:border-border-accent focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              "ease-spring transition-colors duration-150",
            )}
            aria-label="Search anime (⌘K)"
          >
            <Search className="size-4" aria-hidden="true" />
            <span className="flex-1 text-left">Search anime...</span>
            <kbd className="border-border-subtle text-text-tertiary hidden items-center gap-1 rounded-[var(--radius-1)] border px-1.5 py-0.5 text-xs lg:inline-flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right zone: notifications + user slot (theme toggle, user menu via children) */}
        <div className="flex items-center gap-1">
          <div className="hidden md:inline-flex">
            <NotificationsPanel />
          </div>
          {children}
          {/* Mobile search icon */}
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Search"
            className="md:hidden"
            onClick={onSearchOpen}
          >
            <Search className="size-5" />
          </IconButton>
        </div>
      </Container>
    </header>
  );
}
