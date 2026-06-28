// @nexus/ui — SkipLink primitive
// Accessibility-first "skip to main content" link (WCAG 2.2 AA, WCAG 2.4.1).
// Renders off-screen and slides into view only on keyboard focus so sighted
// mouse users never see it, while keyboard and screen-reader users can bypass
// repeated navigation on tab. Targets <main id="main-content"> by default.

import * as React from "react";

import { cn } from "../lib/cn";

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** ID of the main content landmark to jump to. Defaults to "#main-content". */
  href?: string;
  /** Accessible label announced by screen readers. */
  ariaLabel?: string;
  /** Visible copy. Defaults to "Skip to main content". */
  children?: React.ReactNode;
}

export const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  (
    {
      className,
      href = "#main-content",
      ariaLabel = "Skip to main content",
      children = "Skip to main content",
      ...props
    },
    ref,
  ) => {
    return (
      <a
        ref={ref}
        href={href}
        aria-label={ariaLabel}
        data-slot="skip-link"
        className={cn(
          // Off-screen by default; slides in on focus-visible.
          "fixed left-2 top-2 z-[100]",
          "rounded-[var(--radius-4)]",
          "bg-action-primary-bg text-action-primary-text",
          "whitespace-nowrap px-4 py-3 text-sm font-medium leading-none",
          "outline-none",
          // Hidden until focused: invisible + non-interactive + shifted up.
          "pointer-events-none -translate-y-2 opacity-0",
          // Slide-in animation on keyboard focus only.
          "focus-visible:pointer-events-auto focus-visible:translate-y-0 focus-visible:opacity-100",
          // Focus ring for sighted keyboard users (redundant with slide-in but defensive).
          "focus-visible:ring-aether-4/60 focus-visible:ring-offset-surface-base focus-visible:ring-2 focus-visible:ring-offset-2",
          // Smooth slide in/out.
          "ease-spring transition-[opacity,transform] duration-200",
          className,
        )}
        {...props}
      >
        {children}
      </a>
    );
  },
);

SkipLink.displayName = "SkipLink";
