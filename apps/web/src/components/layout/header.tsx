"use client";

import { Container, IconButton, Separator, cn } from "@nexus/ui";
import { Menu, Search, Bell } from "lucide-react";
import Link from "next/link";

import { useScrollPosition } from "@/hooks/use-scroll-position";

/**
 * Global header — sticky, glassmorphic, 80px → 64px on scroll.
 * Renders on every page. Contains logo, search trigger, notification bell,
 * and mobile menu trigger. Desktop search and user menu are composed by
 * the parent layout (they slot into the header's right zone).
 *
 * Props:
 * - onMobileMenuToggle: callback to open mobile drawer
 * - children: slot for search bar and user menu (right zone)
 */
interface HeaderProps {
  onMobileMenuToggle?: () => void;
  children?: React.ReactNode;
}

export function Header({ onMobileMenuToggle, children }: HeaderProps) {
  const { isScrolled } = useScrollPosition(10);

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
            {/* Logo mark — abstract "N" shape in aether accent */}
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

        {/* Center zone: desktop search trigger (md+) */}
        <div className="mx-8 hidden max-w-md flex-1 items-center justify-center md:flex">
          {/*
            Search trigger is a placeholder slot — the real SearchBar component
            from Task 7 will render here via children on desktop.
          */}
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-[var(--radius-4)]",
              "bg-surface-raised/60 border-border-subtle/60 border",
              "text-text-placeholder px-3 py-1.5 text-sm",
              "hover:bg-surface-raised hover:border-border-default",
              "focus-visible:border-border-accent focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              "ease-spring transition-colors duration-150",
            )}
            aria-label="Search anime"
          >
            <Search className="size-4" aria-hidden="true" />
            <span className="flex-1 text-left">Search anime...</span>
            <kbd className="border-border-subtle text-text-tertiary hidden items-center gap-1 rounded-[var(--radius-1)] border px-1.5 py-0.5 text-xs lg:inline-flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right zone: notifications + user slot */}
        <div className="flex items-center gap-1">
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Notifications"
            className="hidden md:inline-flex"
          >
            <Bell className="size-5" />
          </IconButton>
          {children}
          {/* Mobile search icon — visible only on small screens */}
          <IconButton variant="ghost" size="sm" aria-label="Search" className="md:hidden">
            <Search className="size-5" />
          </IconButton>
        </div>
      </Container>
    </header>
  );
}
