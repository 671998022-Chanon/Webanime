"use client";

import Link from "next/link";
import { useState } from "react";

import { cn } from "../lib/cn";
import { Button } from "../primitives/button";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/pricing", label: "Pricing" },
] as const;

export interface TopNavProps {
  user?: { name?: string | null } | null;
  className?: string;
}

export function TopNav({ user, className }: TopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border-subtle bg-void-base/90 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-nav max-w-container items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-wide text-resonance">
          Nexus Anime
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-sm text-text-secondary transition-colors duration-ui hover:text-resonance"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link href="/nexus">
              <Button variant="secondary" size="sm">
                Nexus Hub
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-text-primary hover:bg-void-elevated md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => {
            setMobileOpen((open) => !open);
          }}
        >
          <span className="sr-only">{mobileOpen ? "Close" : "Menu"}</span>
          <svg
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-border-subtle bg-void-elevated px-4 py-4 md:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block font-body text-sm text-text-secondary hover:text-resonance"
                  onClick={() => {
                    setMobileOpen(false);
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="flex flex-col gap-2 pt-2">
              {user ? (
                <Link href="/nexus" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Nexus Hub
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
