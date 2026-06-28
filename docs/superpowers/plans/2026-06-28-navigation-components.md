# Navigation Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the reusable navigation component library (Breadcrumb, Pagination, NavigationMenu, CommandPalette, SkipLink, Tabs extension) for the Nexus Anime design system. These primitives power application navigation, browsing, discovery, and keyboard-driven interactions across the platform.

**Architecture:** Each component follows the established @nexus/ui pattern: `"use client"`, `React.forwardRef` with explicit `ComponentRef` typing, `data-slot` attributes, `cn()` for className merging, design tokens only (no raw hex), semantic token classes, and barrel re-export via `packages/ui/src/index.ts`. NavigationMenu wraps `@radix-ui/react-navigation-menu` (new dependency). CommandPalette wraps `cmdk` (new dependency) inside the existing `Dialog` primitive. SkipLink is a small keyboard-focus-only link.

**Tech Stack:** Next.js 16, React 19, TypeScript 5 strict, Tailwind CSS v4, shadcn/ui conventions, Radix UI Navigation Menu, cmdk.

## Global Constraints

- Strict TypeScript — no `any`, no `ts-ignore`
- WCAG 2.2 AA — keyboard navigation, screen reader compatible, focus-visible rings, aria attributes (aria-current, aria-disabled, aria-label, aria-orientation, role)
- Design tokens only — no raw hex/rgb values in components; use `var(--nexus-*)` and Tailwind semantic classes
- Responsive — mobile-first; NavigationMenu collapses to a mobile-friendly variant on small screens
- Dark mode via `[data-theme="midnight"]` — tokens already resolve correctly
- Animation via `data-[state=...]` selectors + Tailwind keyframes in `tailwind.css`
- Z-index: `z-dropdown` (100) for menus/dropdowns, `z-overlay` (300) for command palette overlay, `z-modal` (400) for command dialog
- Barrel export in `packages/ui/src/index.ts` for every public component and sub-component
- Files under 400 lines; co-located in `packages/ui/src/components/`
- `"use client"` directive on every client component
- Menubar is already implemented and covers the spec's sub-menu needs; if any navigation-specific menubar patterns are needed, extend `menubar.tsx`. This plan covers Breadcrumb, Pagination, NavigationMenu, CommandPalette, and SkipLink — five new files.

---

### Task 1: Install NavigationMenu + cmdk dependencies

**Files:**

- Modify: `packages/ui/package.json`
- Reinstall: `pnpm-lock.yaml` (via pnpm)

**Interfaces:**

- Consumes: nothing
- Produces: dev dependencies `@radix-ui/react-navigation-menu`, `cmdk`

- [ ] **Step 1: Install packages**

```bash
cd /workspaces/Webanime && pnpm --filter @nexus/ui add -D @radix-ui/react-navigation-menu cmdk
```

Expected: success, package.json updated. cmdk ships its own types; `@radix-ui/react-navigation-menu` v1.1.x.

- [ ] **Step 2: Verify install**

Run: `ls packages/ui/node_modules/@radix-ui/react-navigation-menu packages/ui/node_modules/cmdk`
Expected: both directories present with `package.json`.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/package.json pnpm-lock.yaml
git -C /workspaces/Webanime commit -m "chore(ui): add NavigationMenu + cmdk dependencies"
```

---

### Task 2: Breadcrumb

**Files:**

- Create: `packages/ui/src/components/breadcrumb.tsx`

**Interfaces:**

- Consumes: `cn` from `../lib/cn`, `MoreHorizontal` from `lucide-react`
- Produces: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`

- [ ] **Step 1: Create `breadcrumb.tsx`**

```tsx
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

interface BreadcrumbListProps extends React.OlHTMLAttributes<HTMLOListElement> {
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

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  ),
);
BreadcrumbItem.displayName = "Breadcrumb.Item";

/* ---------------- Link ---------------- */

interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
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

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.SpanHTMLAttributes<HTMLSpanElement>>(
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

const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, children, ...props }, ref) => (
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
  ),
);
BreadcrumbSeparator.displayName = "Breadcrumb.Separator";

/* ---------------- Ellipsis ---------------- */

const BreadcrumbEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.SpanHTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
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
));
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
```

Expected: file created, types compile.

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @nexus/ui exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/breadcrumb.tsx
git -C /workspaces/Webanime commit -m "feat(navigation): add Breadcrumb primitive"
```

---

### Task 3: Pagination

**Files:**

- Create: `packages/ui/src/components/pagination.tsx`

**Interfaces:**

- Consumes: `cn` from `../lib/cn`, `ChevronLeft`, `ChevronRight`, `ChevronsLeft`, `ChevronsRight`, `MoreHorizontal` from `lucide-react`, `Button` and `buttonVariants` from `./button`
- Produces: `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationButton`, `PaginationPrevious`, `PaginationNext`, `PaginationFirst`, `PaginationLast`, `PaginationEllipsis`

- [ ] **Step 1: Create `pagination.tsx`**

```tsx
// @nexus/ui — Pagination primitive (compound)
// Cursor-driven pagination surface. Styled with ghost/outline variants from Button.
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

import { Button, buttonVariants } from "./button";
import { cn } from "../lib/cn";

/* ---------------- Root ---------------- */

export interface PaginationProps extends React.NavHTMLAttributes<HTMLElement> {
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
    const goTo = (p: number) => {
      if (!controlled) setInternal(p);
      onPageChange?.(p);
    };

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
        <PaginationContext.Provider value={{ current, goTo, totalPages }}>
          {children}
        </PaginationContext.Provider>
      </nav>
    );
  },
);
Pagination.displayName = "Pagination";

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

/* ---------------- Content ---------------- */

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.UlHTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-slot="pagination-content"
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "Pagination.Content";

/* ---------------- Item ---------------- */

const PaginationItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} data-slot="pagination-item" className={cn("", className)} {...props} />
  ),
);
PaginationItem.displayName = "Pagination.Item";

/* ---------------- Link ---------------- */

interface PaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
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
          buttonVariants({ variant: active ? "ghost" : "outline", size: "icon" }),
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

interface PaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  page: number;
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
          buttonVariants({ variant: active ? "ghost" : "outline", size: "icon" }),
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

/* ---------------- Previous / Next ---------------- */

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children">
>(({ className, ...props }, ref) => {
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
        buttonVariants({ variant: "outline", size: "icon" }),
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <ChevronLeft className="size-4" />
    </a>
  );
});
PaginationPrevious.displayName = "Pagination.Previous";

const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children">
>(({ className, ...props }, ref) => {
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
        buttonVariants({ variant: "outline", size: "icon" }),
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <ChevronRight className="size-4" />
    </a>
  );
});
PaginationNext.displayName = "Pagination.Next";

/* ---------------- First / Last ---------------- */

const PaginationFirst = React.forwardRef<
  HTMLAnchorElement,
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children">
>(({ className, ...props }, ref) => {
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
        buttonVariants({ variant: "outline", size: "icon" }),
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <ChevronsLeft className="size-4" />
    </a>
  );
});
PaginationFirst.displayName = "Pagination.First";

const PaginationLast = React.forwardRef<
  HTMLAnchorElement,
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children">
>(({ className, ...props }, ref) => {
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
        buttonVariants({ variant: "outline", size: "icon" }),
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      <ChevronsRight className="size-4" />
    </a>
  );
});
PaginationLast.displayName = "Pagination.Last";

/* ---------------- Ellipsis ---------------- */

const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.SpanHTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
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
));
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
```

Expected: file created, types compile.

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @nexus/ui exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/pagination.tsx
git -C /workspaces/Webanime commit -m "feat(navigation): add Pagination primitive"
```

---

### Task 4: NavigationMenu

**Files:**

- Create: `packages/ui/src/components/navigation-menu.tsx`
- Modify: `packages/ui/src/tailwind.css` — add `@keyframes nav-menu-enter` and `nav-menu-exit` (slide-down 150ms spring, fade 100ms)

**Interfaces:**

- Consumes: `cn` from `../lib/cn`, `@radix-ui/react-navigation-menu`, `ChevronDown` from `lucide-react`
- Produces: `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuLink`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuIndicator`, `NavigationMenuViewport`

- [ ] **Step 1: Add `@keyframes nav-menu-enter` and `nav-menu-exit` to `tailwind.css`**

Append to `/workspaces/Webanime/packages/ui/src/tailwind.css` after the dropdown keyframes:

```css
/* Navigation-menu slide-down with fade */
@keyframes nav-menu-enter {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes nav-menu-exit {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
}
```

Expected: file appended.

- [ ] **Step 2: Create `navigation-menu.tsx`**

```tsx
// @nexus/ui — NavigationMenu primitive (compound)
// Wraps @radix-ui/react-navigation-menu. Desktop mega-menu + sub-menu dropdowns.
// W3C Disclosure Pattern; arrow-key nav between items; Enter/Space to activate;
// Escape to close. The viewport is a positioned flyout anchored to the trigger.
// Tokens: surface-raised, border-subtle/40, shadow-2, backdrop-blur-lg, z-dropdown.

"use client";

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/cn";

/* ---------------- Root ---------------- */

export interface NavigationMenuProps extends React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Root
> {}

const NavigationMenu = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Root>,
  NavigationMenuProps
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    data-slot="navigation-menu"
    className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = "NavigationMenu";

/* ---------------- List ---------------- */

const NavigationMenuList = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    data-slot="navigation-menu-list"
    className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.List>
));
NavigationMenuList.displayName = "NavigationMenu.List";

/* ---------------- Item ---------------- */

const NavigationMenuItem = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Item
    ref={ref}
    data-slot="navigation-menu-item"
    className={cn("relative", className)}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.Item>
));
NavigationMenuItem.displayName = "NavigationMenu.Item";

/* ---------------- Trigger ---------------- */

interface NavigationMenuTriggerProps extends React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Trigger
> {}

const NavigationMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Trigger>,
  NavigationMenuTriggerProps
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    data-slot="navigation-menu-trigger"
    className={cn(
      "group inline-flex h-9 w-max items-center justify-center",
      "rounded-[var(--radius-4)] bg-transparent px-3 py-2",
      "text-text-secondary text-sm font-medium",
      "ease-spring transition-colors duration-150",
      "cursor-pointer select-none",
      "hover:bg-action-ghost-hover hover:text-text-primary",
      "focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
      "data-[state=open]:bg-action-ghost-hover data-[state=open]:text-text-primary",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronDown
      aria-hidden="true"
      className="relative top-px ml-1 size-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = "NavigationMenu.Trigger";

/* ---------------- Content ---------------- */

interface NavigationMenuContentProps extends React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Content
> {}

const NavigationMenuContent = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Content>,
  NavigationMenuContentProps
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    data-slot="navigation-menu-content"
    className={cn(
      "absolute left-0 top-0 w-full",
      "data-[motion=from-start]:animate-[nav-menu-enter_150ms_ease-spring]",
      "data-[motion=from-end]:animate-[nav-menu-enter_150ms_ease-spring]",
      "data-[motion=to-start]:animate-[nav-menu-exit_100ms_ease-in]",
      "data-[motion=to-end]:animate-[nav-menu-exit_100ms_ease-in]",
      "rounded-[var(--radius-4)]",
      "bg-surface-overlay border-border-subtle/40 shadow-2 border backdrop-blur-lg",
      "p-4",
      className,
    )}
    {...props}
  >
    {children}
  </NavigationMenuPrimitive.Content>
));
NavigationMenuContent.displayName = "NavigationMenu.Content";

/* ---------------- Link ---------------- */

const NavigationMenuLink = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Link>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Link
    ref={ref}
    data-slot="navigation-menu-link"
    className={cn(
      "block rounded-[var(--radius-2)] px-3 py-2",
      "text-text-secondary text-sm",
      "ease-spring transition-colors duration-150",
      "hover:bg-action-ghost-hover hover:text-text-primary",
      "focus-visible:ring-aether-4/60 focus-visible:outline-none focus-visible:ring-2",
      "[&:not(:hover)]:focus-visible:bg-action-ghost-hover",
      className,
    )}
    {...props}
  />
));
NavigationMenuLink.displayName = "NavigationMenu.Link";

/* ---------------- Indicator ---------------- */

interface NavigationMenuIndicatorProps extends React.ComponentPropsWithoutRef<
  typeof NavigationMenuPrimitive.Indicator
> {}

const NavigationMenuIndicator = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Indicator>,
  NavigationMenuIndicatorProps
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    data-slot="navigation-menu-indicator"
    className={cn(
      "top-full z-[1] flex h-2.5 items-end justify-center overflow-hidden",
      "data-[state=visible]:animate-[nav-menu-enter_150ms_ease-spring]",
      "data-[state=hidden]:animate-[nav-menu-exit_100ms_ease-in]",
      className,
    )}
    {...props}
  >
    <div className="bg-surface-overlay border-border-subtle/40 shadow-2 relative top-[60%] size-2.5 rotate-45 rounded-tl-sm border-l border-t" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = "NavigationMenu.Indicator";

/* ---------------- Viewport ---------------- */

const NavigationMenuViewport = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      ref={ref}
      data-slot="navigation-menu-viewport"
      className={cn(
        "origin-top-center relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-full",
        "overflow-hidden rounded-[var(--radius-4)]",
        "bg-surface-overlay border-border-subtle/40 shadow-2 border backdrop-blur-lg",
        "data-[state=open]:animate-[nav-menu-enter_150ms_ease-spring]",
        "data-[state=closed]:animate-[nav-menu-exit_100ms_ease-in]",
        className,
      )}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = "NavigationMenu.Viewport";

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
```

Expected: file created, types compile.

- [ ] **Step 3: Type-check**

Run: `pnpm --filter @nexus/ui exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/navigation-menu.tsx packages/ui/src/tailwind.css
git -C /workspaces/Webanime commit -m "feat(navigation): add NavigationMenu primitive"
```

---

### Task 5: SkipLink

**Files:**

- Create: `packages/ui/src/components/skip-link.tsx`

**Interfaces:**

- Consumes: `cn` from `../lib/cn`
- Produces: `SkipLink`

Notes: The spec defines a single Skip-to-Content link. It is _one_ component — only visible when focused via keyboard. Target: `#main-content`. Z-index 100. Action-primary-bg background, white text, 14px, padding 12px 16px.

- [ ] **Step 1: Create `skip-link.tsx`**

```tsx
// @nexus/ui — SkipLink (skip-to-content)
// Accessibility-first anchor — hidden until focused via keyboard.
// Targets <main id="main-content">. Action-primary-bg + white text.
// Z-100. Visible only on :focus.

"use client";

import * as React from "react";

import { cn } from "../lib/cn";

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Target selector. @default "#main-content" */
  href?: string;
  /** Link text. @default "Skip to main content" */
  children?: React.ReactNode;
}

export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className,
  ...props
}: SkipLinkProps) {
  return (
    <a
      href={href}
      data-slot="skip-link"
      className={cn(
        "bg-action-primary-bg text-action-primary-text",
        "fixed left-4 top-4 z-[100] inline-flex items-center justify-center",
        "rounded-[var(--radius-4)] px-4 py-3 text-sm font-medium leading-none",
        "shadow-2",
        // Hide visually until keyboard focus
        "pointer-events-none -translate-y-2 opacity-0",
        "ease-spring transition-[opacity,transform] duration-150",
        "focus-visible:pointer-events-auto focus-visible:translate-y-0 focus-visible:opacity-100",
        "focus-visible:ring-aether-4/60 focus-visible:ring-2 focus-visible:ring-offset-0",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export { SkipLink as SkipLink };
```

Expected: file created, types compile.

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @nexus/ui exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/skip-link.tsx
git -C /workspaces/Webanime commit -m "feat(navigation): add SkipLink primitive"
```

---

### Task 6: CommandPalette

**Files:**

- Create: `packages/ui/src/components/command.tsx`
- Modify: `packages/ui/src/tailwind.css` — add `@keyframes command-dialog-enter`, `command-dialog-exit`, `command-fade-in`, `command-fade-out` (same as dialog but slightly faster — 200ms enter, 150ms exit)

**Interfaces:**

- Consumes: `cn` from `../lib/cn`, `Dialog` / `DialogContent` / `DialogHeader` / `DialogBody` from `./dialog`, `Command` from `cmdk`
- Produces: `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandShortcut`, `CommandLoading`, `useCommandSearch` (helper hook)

Notes:

- cmdk is the canonical React port of kbar / ⌘K surfaces. It provides search/filter, grouped items, items-first keyboard nav, empty/loading states, and aria attributes out of the box.
- `CommandDialog` wraps the existing Radix Dialog primitive in cmdk's `Command` root for filtering/search.
- The consumer is responsible for opening/closing the dialog; this component provides the contents.
- The spec requires empty state, loading state, grouped commands, keyboard shortcut display.

- [ ] **Step 1: Add `@keyframes command-*` to `tailwind.css`**

Append after overlay keyframes:

```css
/* Command palette — slightly faster motion than dialog */
@keyframes command-dialog-enter {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
@keyframes command-dialog-exit {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
}
```

Expected: file appended.

- [ ] **Step 2: Create `command.tsx`**

```tsx
// @nexus/ui — Command Palette (⌘K)
// Wraps cmdk (canonical ⌘K component) inside the existing Radix Dialog primitive.
// Provides search/filter, grouped items, empty + loading states, and shortcut
// display. Keyboard: cmdk handles ↑↓ to navigate, Enter to select, Esc to close.
// Activation (⌘K shortcut) is the consumer's responsibility — this file only
// provides the palette contents.

"use client";

import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";

import { Dialog, DialogContent } from "./dialog";
import { cn } from "../lib/cn";

/* ---------------- CommandDialog ---------------- */

interface CommandDialogProps extends DialogProps {}

function CommandDialog({ children, ...props }: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent
        showClose={false}
        size="lg"
        className={cn(
          "max-w-2xl overflow-hidden p-0",
          "data-[state=open]:animate-[command-dialog-enter_200ms_ease-spring]",
          "data-[state=closed]:animate-[command-dialog-exit_150ms_ease-in]",
        )}
        // Prevent Radix Dialog's default onClose triggered by overlay/Esc; cmdk handles Esc.
        onOverlayClick={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          // cmdk closes on empty input via its own Escape; let it through only when input is empty.
          // If there is text, cmdk clears input on Esc (its default); allow that.
          // If input is empty, prevent the Dialog from closing so consumer can control.
          const input = (e.currentTarget as HTMLElement).querySelector<HTMLInputElement>(
            "input[data-slot='command-input']",
          );
          if (!input || input.value === "") {
            e.preventDefault();
          }
        }}
      >
        <CommandPrimitive
          className={cn(
            "[&_[cmdk-group-heading]]:text-text-tertiary",
            "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
            "[&_[cmdk-group]]:px-2 [&_[cmdk-group]]:pt-2",
            "[&_[cmdk-input-wrapper]_svg]:size-5",
            "[&_[cmdk-input]]:h-12",
            "[&_[cmdk-item]]:cursor-pointer [&_[cmdk-item]]:rounded-[var(--radius-2)] [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:size-5",
            "[&_[cmdk-item][data-selected='true']]:bg-action-ghost-hover [&_[cmdk-item][data-selected='true']]:text-text-primary",
            "[&_[cmdk-item][data-disabled='true']]:pointer-events-none [&_[cmdk-item][data-disabled='true']]:opacity-50",
          )}
        >
          {children}
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Input ---------------- */

interface CommandInputProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {}

const CommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ className, ...props }, ref) => (
  <div className="border-border-subtle flex items-center border-b px-3" cmdk-input-wrapper="">
    <CommandPrimitive.Input
      ref={ref}
      data-slot="command-input"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      aria-autocomplete="list"
      role="combobox"
      aria-expanded="true"
      className={cn(
        "flex h-11 w-full bg-transparent py-3 text-sm outline-none",
        "text-text-primary placeholder:text-text-tertiary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = "Command.Input";

/* ---------------- List ---------------- */

const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    data-slot="command-list"
    className={cn("max-h-80 overflow-y-auto overscroll-contain px-2 py-2", className)}
    {...props}
  />
));
CommandList.displayName = "Command.List";

/* ---------------- Empty ---------------- */

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    data-slot="command-empty"
    className="text-text-secondary py-6 text-center text-sm"
    {...props}
  />
));
CommandEmpty.displayName = "Command.Empty";

/* ---------------- Group ---------------- */

const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    data-slot="command-group"
    className={cn("overflow-hidden", className)}
    {...props}
  />
));
CommandGroup.displayName = "Command.Group";

/* ---------------- Separator ---------------- */

const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    data-slot="command-separator"
    className={cn("bg-border-subtle -mx-2 h-px", className)}
    {...props}
  />
));
CommandSeparator.displayName = "Command.Separator";

/* ---------------- Item ---------------- */

const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    data-slot="command-item"
    className={cn(
      "relative flex select-none items-center gap-2 rounded-[var(--radius-2)] px-2 py-3 text-sm",
      "text-text-secondary cursor-pointer",
      "aria-selected:bg-action-ghost-hover aria-selected:text-text-primary",
      "data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = "Command.Item";

/* ---------------- Shortcut ---------------- */

interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

function CommandShortcut({ className, ...props }: CommandShortcutProps) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-text-tertiary ml-auto inline-flex items-center gap-0.5 font-mono text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}
CommandShortcut.displayName = "Command.Shortcut";

/* ---------------- Loading ---------------- */

interface CommandLoadingProps extends React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Loading
> {}

const CommandLoading = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Loading>,
  CommandLoadingProps
>((props, ref) => <CommandPrimitive.Loading ref={ref} data-slot="command-loading" {...props} />);
CommandLoading.displayName = "Command.Loading";

export {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  CommandLoading,
};
// Re-export cmdk's Command root as our default for consumers that build their own container.
export { CommandPrimitive };
```

Expected: file created, types compile.

- [ ] **Step 3: Type-check**

Run: `pnpm --filter @nexus/ui exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/command.tsx packages/ui/src/tailwind.css
git -C /workspaces/Webanime commit -m "feat(navigation): add CommandPalette primitive"
```

---

### Task 7: Barrel exports + final verification

**Files:**

- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: the six components/tasks above
- Produces: barrel re-exports for all navigation primitives

- [ ] **Step 1: Append navigation barrel exports to `index.ts`**

Add at the end of `packages/ui/src/index.ts` after the Spinner export:

```ts
// Navigation
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./components/breadcrumb";
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
} from "./components/pagination";
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from "./components/navigation-menu";
export { SkipLink } from "./components/skip-link";
export {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  CommandLoading,
} from "./components/command";
```

Expected: file edited, types compile.

- [ ] **Step 2: Run full typecheck**

Run: `pnpm --filter @nexus/ui exec tsc --noEmit`
Expected: no errors across the @nexus/ui package.

- [ ] **Step 3: Run cross-package typecheck**

Run: `pnpm typecheck`
Expected: no errors across all packages.

- [ ] **Step 4: Run linter**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 5: Try a build**

Run: `pnpm build`
Expected: all packages + apps build without errors.

- [ ] **Step 6: Self-review**

Re-read the five new files for:

- Any `any` introduced (TS constraint)
- Correct barrel exports
- Design tokens (no raw hex)
- Screen reader attributes (`aria-current`, `aria-disabled`, `aria-label`, `role`)
- Responsive behavior
- Keyboard support via Radix / cmdk primitives being correctly wrapped
- Files under 400 lines

Fix any issues found before committing.

- [ ] **Step 7: Commit barrel**

```bash
git add packages/ui/src/index.ts
git -C /workspaces/Webanime commit -m "feat(navigation): barrel-export navigation primitives"
```

- [ ] **Step 8: Final Conventional Commit**

```bash
git add .
git -C /workspaces/Webanime commit -m "feat(navigation): implement navigation components"
```

(If there are partial commits from earlier tasks, squash by amending or skipping this step. The final deliverable is a single Conventional Commit as required.)

---

## After Implementation Checklist

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] All 6 navigation files created; sizes under 400 lines
- [ ] `packages/ui/package.json` lists `@radix-ui/react-navigation-menu` and `cmdk`
- [ ] Barrel in `packages/ui/src/index.ts` exports all navigation primitives (+ summary comment)
- [ ] Breadcrumb: `aria-current="page"` on BreadcrumbPage, `role="presentation"` on separators
- [ ] Pagination: controlled + uncontrolled; First/Previous/Next/Last/Ellipsis; disabled states with `aria-disabled`
- [NavigationMenu](https://github.com/nicepkg/issue/issues/4): viewport animation via keyframes; tokens for surface/blur/shadow
- [SkipLink](https://github.com/nicepkg/issue/issues/5): off-screen until focused, z-100, action-primary-bg
- [CommandPalette](https://github.com/nicepkg/issues/6): cmdk role="combobox", aria-autocomplete, grouped items, empty + loading states, shortcut display
- [tailwind.css](https://github.com/nicepkg/css/7): `@keyframes nav-menu-enter/exit`, `command-dialog-enter/exit` added

## Files Changed (summary)

- **Modify**: `packages/ui/package.json` (Task 1)
- **Modify**: `packages/ui/src/tailwind.css` (Tasks 4, 6)
- **Modify**: `packages/ui/src/index.ts` (Task 7)
- **Create**: `packages/ui/src/components/breadcrumb.tsx` (Task 2)
- **Create**: `packages/ui/src/components/pagination.tsx` (Task 3)
- **Create**: `packages/ui/src/components/navigation-menu.tsx` (Task 4)
- [Create](https://github.com/nicepkg/create/8): `packages/ui/src/components/skip-link.tsx` (Task 5)
- [Create](https://github.com/nicepkg/create/9): `packages/ui/src/components/command.tsx` (Task 6)
