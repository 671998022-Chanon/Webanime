// @nexus/ui — Pagination primitive (compound)
// Cursor-driven pagination surface. Styled with ghost/secondary variants from Button.
// Supports controlled (page + onPageChange) and uncontrolled (defaultPage) usage.
// First/Last via PaginationFirst/PaginationLast. Ellipsis via PaginationEllipsis.
// Keyboard: Tab through interactive items; items are real <a> (PaginationLink) or <button>.

"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

import { buttonVariants } from "./button";

/* ---------------- Context ---------------- */

interface PaginationContextValue {
  current: number;
  goTo: (page: number) => void;
  totalPages?: number;
}

const PaginationContext = React.createContext<PaginationContextValue | null>(null);

function usePagination() {
  const ctx = React.useContext(PaginationContext);
  if (!ctx) throw new Error("Pagination compound components must be used within <Pagination>");
  return ctx;
}

/* ---------------- Root ---------------- */

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  /** Total number of pages. Required for useful aria-label. */
  totalPages?: number;
  /** Controlled current page (1-indexed). */
  page?: number;
  /** Uncontrolled default page (1-indexed). @default 1 */
  defaultPage?: number;
  /** Called with new page number (1-indexed) on navigation. */
  onPageChange?: (page: number) => void;
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ totalPages, page, defaultPage = 1, onPageChange, className, children, ...props }, ref) => {
    const [internal, setInternal] = React.useState(defaultPage);
    const controlled = page !== undefined;
    const current = controlled ? page : internal;
    const goTo = React.useCallback(
      (p: number) => {
        if (!controlled) setInternal(p);
        onPageChange?.(p);
      },
      [controlled, onPageChange],
    );

    const contextValue = React.useMemo(
      () => ({ current, goTo, totalPages }),
      [current, goTo, totalPages],
    );

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Pagination"
        data-slot="pagination"
        data-page={current}
        data-total-pages={totalPages}
        className={cn("mx-auto flex w-full justify-center", className)}
        {...props}
      >
        <PaginationContext.Provider value={contextValue}>{children}</PaginationContext.Provider>
      </nav>
    );
  },
);
Pagination.displayName = "Pagination";

/* ---------------- Content ---------------- */

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-slot="pagination-content"
    className={cn("flex flex-row flex-wrap items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "Pagination.Content";

/* ---------------- Item ---------------- */

const PaginationItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} data-slot="pagination-item" className={cn("", className)} {...props} />
  ),
);
PaginationItem.displayName = "Pagination.Item";

/* ---------------- Link ---------------- */

export interface PaginationLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  /** Page number this link navigates to. */
  page: number;
  /** Active styling for current page. */
  isActive?: boolean;
}

const PaginationLink = React.forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ className, page, isActive = false, children, ...props }, ref) => {
    const { current, goTo } = usePagination();
    const active = isActive || current === page;
    return (
      <a
        ref={ref}
        href={`?page=${page}`}
        aria-current={active ? "page" : undefined}
        aria-label={active ? `Current page, page ${page}` : `Go to page ${page}`}
        onClick={(e) => {
          e.preventDefault();
          goTo(page);
        }}
        data-slot="pagination-link"
        data-active={active || undefined}
        className={cn(
          buttonVariants({ variant: active ? "ghost" : "secondary", size: "icon" }),
          "cursor-pointer",
          active && "bg-action-ghost-hover text-text-primary",
          className,
        )}
        {...props}
      >
        {typeof children === "undefined" ? page : children}
      </a>
    );
  },
);
PaginationLink.displayName = "Pagination.Link";

/* ---------------- Button (form action alternative) ---------------- */

export interface PaginationButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  /** Page number this button navigates to. */
  page: number;
  /** Active styling for current page. */
  isActive?: boolean;
}

const PaginationButton = React.forwardRef<HTMLButtonElement, PaginationButtonProps>(
  ({ className, page, isActive = false, children, ...props }, ref) => {
    const { current, goTo } = usePagination();
    const active = isActive || current === page;
    return (
      <button
        ref={ref}
        type="button"
        aria-current={active ? "page" : undefined}
        aria-label={active ? `Current page, page ${page}` : `Go to page ${page}`}
        onClick={() => goTo(page)}
        data-slot="pagination-button"
        data-active={active || undefined}
        className={cn(
          buttonVariants({ variant: active ? "ghost" : "secondary", size: "icon" }),
          "cursor-pointer",
          active && "bg-action-ghost-hover text-text-primary",
          className,
        )}
        {...props}
      >
        {typeof children === "undefined" ? page : children}
      </button>
    );
  },
);
PaginationButton.displayName = "Pagination.Button";

/* ---------------- Previous ---------------- */

export interface PaginationPreviousProps extends React.HTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}

const PaginationPrevious = React.forwardRef<HTMLAnchorElement, PaginationPreviousProps>(
  ({ className, children, ...props }, ref) => {
    const { current, goTo } = usePagination();
    const disabled = current <= 1;
    return (
      <a
        ref={ref}
        href={disabled ? undefined : `?page=${current - 1}`}
        aria-disabled={disabled || undefined}
        aria-label="Go to previous page"
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) goTo(current - 1);
        }}
        data-slot="pagination-previous"
        className={cn(
          buttonVariants({ variant: "secondary", size: "icon" }),
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        {...props}
      >
        {children ?? <ChevronLeft className="size-4" />}
      </a>
    );
  },
);
PaginationPrevious.displayName = "Pagination.Previous";

/* ---------------- Next ---------------- */

export interface PaginationNextProps extends React.HTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}

const PaginationNext = React.forwardRef<HTMLAnchorElement, PaginationNextProps>(
  ({ className, children, ...props }, ref) => {
    const { current, goTo, totalPages } = usePagination();
    const disabled = totalPages ? current >= totalPages : false;
    return (
      <a
        ref={ref}
        href={disabled ? undefined : `?page=${current + 1}`}
        aria-disabled={disabled || undefined}
        aria-label="Go to next page"
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) goTo(current + 1);
        }}
        data-slot="pagination-next"
        className={cn(
          buttonVariants({ variant: "secondary", size: "icon" }),
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        {...props}
      >
        {children ?? <ChevronRight className="size-4" />}
      </a>
    );
  },
);
PaginationNext.displayName = "Pagination.Next";

/* ---------------- First ---------------- */

export interface PaginationFirstProps extends React.HTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}

const PaginationFirst = React.forwardRef<HTMLAnchorElement, PaginationFirstProps>(
  ({ className, children, ...props }, ref) => {
    const { current, goTo } = usePagination();
    const disabled = current <= 1;
    return (
      <a
        ref={ref}
        href={disabled ? undefined : "?page=1"}
        aria-disabled={disabled || undefined}
        aria-label="Go to first page"
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) goTo(1);
        }}
        data-slot="pagination-first"
        className={cn(
          buttonVariants({ variant: "secondary", size: "icon" }),
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        {...props}
      >
        {children ?? <ChevronsLeft className="size-4" />}
      </a>
    );
  },
);
PaginationFirst.displayName = "Pagination.First";

/* ---------------- Last ---------------- */

export interface PaginationLastProps extends React.HTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
}

const PaginationLast = React.forwardRef<HTMLAnchorElement, PaginationLastProps>(
  ({ className, children, ...props }, ref) => {
    const { current, goTo, totalPages } = usePagination();
    const disabled = totalPages ? current >= totalPages : false;
    return (
      <a
        ref={ref}
        href={disabled ? undefined : `?page=${totalPages ?? 1}`}
        aria-disabled={disabled || undefined}
        aria-label="Go to last page"
        onClick={(e) => {
          e.preventDefault();
          if (!disabled && totalPages) goTo(totalPages);
        }}
        data-slot="pagination-last"
        className={cn(
          buttonVariants({ variant: "secondary", size: "icon" }),
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        {...props}
      >
        {children ?? <ChevronsRight className="size-4" />}
      </a>
    );
  },
);
PaginationLast.displayName = "Pagination.Last";

/* ---------------- Ellipsis ---------------- */

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="pagination-ellipsis"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  ),
);
PaginationEllipsis.displayName = "Pagination.Ellipsis";

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationButton,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
};
