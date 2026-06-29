# Global Header Design (Task 13.3)

**Date:** 2026-06-29
**Status:** Approved
**Task:** 13.3 — Global Header
**Depends on:** Task 13.2 (Application Shell) — complete

## Summary

Add desktop navigation links to the existing sticky glassmorphic header. The nav zone sits between the logo (left) and actions (right), rendering 5 placeholder links: Home, Trending, Latest, Genres, Schedule. No mega-menus or dropdowns — simple links only.

## Scope

### In scope

- `HEADER_NAV_ITEMS` constant in `nav-items.ts`
- Navigation zone in `header.tsx` (desktop only, 5 links)
- Active state via `usePathname()`
- Accessibility (aria-label, focus-visible, semantic nav)
- Theme compatibility via semantic design tokens

### Out of scope

- Search dialog
- Notification panel
- User authentication / session-aware header
- Mobile drawer navigation
- Sidebar
- Mega-menu / dropdown for any nav item
- Footer changes

## Architecture

The header remains a single `"use client"` component. A center navigation zone is inserted between the existing logo zone (left) and actions zone (right).

### File changes

1. **`apps/web/src/lib/nav-items.ts`** — Add `HEADER_NAV_ITEMS` constant
2. **`apps/web/src/components/layout/header.tsx`** — Add nav zone, import `HEADER_NAV_ITEMS`, import `usePathname`

No new files. No changes to `app-shell.tsx`, `NavigationMenu` compound component, `mobile-drawer.tsx`, `sidebar.tsx`, or search components.

## Data model

```ts
// nav-items.ts addition
export const HEADER_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/trending", label: "Trending" },
  { href: "/latest", label: "Latest" },
  { href: "/genres", label: "Genres" },
  { href: "/schedule", label: "Schedule" },
] as const;
```

## Layout

### Desktop (md+)

```
| [Menu] [Logo Nexus] | [Home] [Trending] [Latest] [Genres] [Schedule] | [Search ⌘K] [Bell] [Theme] [User] |
```

### Mobile (< md)

```
| [Menu] [Logo Nexus] | [Search] [Bell] [Theme] [User] |
```

Nav links are `hidden` on mobile — they appear in the existing MobileDrawer.

## Component detail

### Navigation zone

- Container: `<nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">`
- Each link: `<Link>` with base classes:
  - `text-text-secondary` (inactive)
  - `hover:text-text-primary hover:bg-action-ghost-hover`
  - `transition-colors duration-150`
  - `px-3 py-1.5 rounded-[var(--radius-2)]`
- Active state: `text-text-primary` + `border-b-2 border-action-primary-bg` + `font-medium`
- Focus-visible: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-4/60`
- Active detection: `usePathname()` from `next/navigation`, exact match on `/`, prefix match on others

### Accessibility

- `<nav aria-label="Main navigation">` wrapping the links
- Each link is a semantic `<Link>` (renders as `<a>`)
- Focus-visible ring matches existing header pattern
- Keyboard tab order follows visual layout order

### Theme compatibility

- All colors use semantic design tokens (`text-text-secondary`, `text-text-primary`, `border-action-primary-bg`, `bg-action-ghost-hover`)
- Glassmorphism uses existing tokens (`bg-surface-base/80`, `backdrop-blur-md`)
- No hardcoded colors

## Risks

- **Hydration:** `usePathname()` is client-only and should match server — no hydration mismatch risk since the header is `"use client"` and the nav is hidden on initial SSR render when pathname is unavailable. The links render regardless; only the active class differs, which is a visual-only client-side enhancement.
- **Nav items drift:** `HEADER_NAV_ITEMS` is separate from `NAV_ITEMS` (sidebar) by design. When auth/session-awareness is added (M3+), these sets may converge. Document the split.
