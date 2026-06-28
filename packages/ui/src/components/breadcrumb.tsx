// @nexus/ui — Breadcrumb primitive (compound)
// Lightweight, accessible breadcrumb trail. No external dependency.
// Follows https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
// Separator is a `/` glyph in text-secondary. Current page is plain text.
// Ellipsis variant truncates middle items when overflowing — usage is
// opt-in via the `truncate` prop combined with manual slicing by the caller.

"use client";

import { Slot } from "@radix-ui/react-slot";
import { MoreHorizontal } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

/* ---------------- Root ---------------- */

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  /** Visual separator between items. @default "/" */
  separator?: React.ReactNode;
  /** When true, items truncate with ellipsis on overflow. @default false */
  truncate?: boolean;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ separator = "/", truncate = false, className, children, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      data-slot="breadcrumb"
      className={cn("relative flex flex-wrap items-center", className)}
      {...props}
    >
      <BreadcrumbList truncate={truncate}>{children}</BreadcrumbList>
      <BreadcrumbSeparator aria-hidden="true" className="sr-only">
        {separator}
      </BreadcrumbSeparator>
    </nav>
  ),
);
Breadcrumb.displayName = "Breadcrumb";

/* ---------------- List ---------------- */

interface BreadcrumbListProps extends React.DetailedHTMLProps<
  React.OlHTMLAttributes<HTMLOListElement>,
  HTMLOListElement
> {
  truncate?: boolean;
}

const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ truncate = false, className, children, ...props }, ref) => (
    <ol
      ref={ref}
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm",
        truncate && "overflow-hidden text-ellipsis whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {children}
    </ol>
  ),
);
BreadcrumbList.displayName = "Breadcrumb.List";

/* ---------------- Item ---------------- */

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-slot="breadcrumb-item"
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "Breadcrumb.Item";

/* ---------------- Link ---------------- */

interface BreadcrumbLinkProps extends React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> {
  asChild?: boolean;
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ asChild = false, className, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return (
      <Comp
        ref={ref}
        data-slot="breadcrumb-link"
        className={cn(
          "text-text-secondary ease-spring rounded-[var(--radius-1)] py-0.5 transition-colors duration-150",
          "hover:text-text-primary",
          "focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
BreadcrumbLink.displayName = "Breadcrumb.Link";

/* ---------------- Page (current) ---------------- */

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="breadcrumb-page"
      aria-current="page"
      role="link"
      aria-disabled="true"
      className={cn("text-text-primary font-normal", className)}
      {...props}
    />
  ),
);
BreadcrumbPage.displayName = "Breadcrumb.Page";

/* ---------------- Separator ---------------- */

const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>
>(({ className, children, ...props }, ref) => (
  <li
    ref={ref}
    data-slot="breadcrumb-separator"
    role="presentation"
    aria-hidden="true"
    className={cn("text-text-tertiary flex select-none items-center", className)}
    {...props}
  >
    {children ?? "/"}
  </li>
));
BreadcrumbSeparator.displayName = "Breadcrumb.Separator";

/* ---------------- Ellipsis ---------------- */

const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" aria-hidden="true" />
      <span className="sr-only">More</span>
    </span>
  ),
);
BreadcrumbEllipsis.displayName = "Breadcrumb.Ellipsis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
