# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- N/A.

### Changed

- N/A.

### Deprecated

- N/A.

### Removed

- N/A.

### Fixed

- N/A.

### Security

- N/A.

---

## [v0.2.0-ui-library] — 2026-06-28

### Added

- `@nexus/ui` published as a validated Shared UI Components Library, green across `pnpm lint`, `pnpm typecheck`, `pnpm build`, `turbo run lint`, `turbo run typecheck`, `turbo run build`.
- Final audit of the component system: architecture, export structure, shared-package integrity, theme compatibility, design-token usage, accessibility (WCAG 2.2 AA), and type safety.
- Final Components (shipped incrementally across Tasks 12.1–12.6):
  - **Primitives:** Button, IconButton, LinkButton, Typography, Separator, Container, Input, Textarea, Card, Badge, Avatar, Skeleton (with Text/Avatar/Rect variants), SkipLink, Pagination, Breadcrumb, Command (CommandPallete), Table, Spinner, Progress, Popover, HoverCard, Tooltip (with Provider + WithTooltip convenience), Tabs, Checkbox, Switch, Label, FormField, FormMessage, FormDescription, PasswordInput, Combobox, Select.
  - **Overlays:** Dialog, AlertDialog, Drawer, Sheet, Toast / Toaster, Dropdown, ContextMenu, Menubar, NavigationMenu.
  - **Disclosure:** Accordion, Collapsible, ScrollArea, AspectRatio.
  - **Composite (app-layer):** AnimeCard (+Skeleton), EpisodeCard (+Skeleton), StatCard, EmptyCollection, DataGrid, Carousel.
  - **Skeleton loaders** per component (AnimeCardSkeleton, EpisodeCardSkeleton, SkeletonText, SkeletonAvatar, SkeletonRect).

### Fixed

- **Lint debt in `@nexus/ui`:**
  - `stamp.tsx` / `checkbox.tsx`: fixed invalid conditional `id ?? React.useId()` hook calls. `useId` now runs unconditionally; the caller-supplied `id` wins when present.
  - `card.tsx`: removed unused `forwardRef` parameter in the `slot()` helper.
  - `command.tsx`: removed unused `RadixContentProps` type alias.
  - `typography.tsx`: replaced dead `ELEMENT_MAP` const (referenced only as a type) with a `TypographyElement` union type; replaced `keyof typeof ELEMENT_MAP` with the union.
  - 23 files: converted empty-bodied `interface X extends Y {}` declarations to `type X = Y` to satisfy `@typescript-eslint/no-empty-object-type` (the bodies were extensions of radix/HTML attribute interfaces following the Shadcn/ui pattern and were not augmentable as written).
  - `button.tsx` / `icon-button.tsx` / `link-button.tsx`: added `/* eslint-disable react-refresh/only-export-components */` so CVA variant configs can co-locate with their components (the standard Shadcn pattern).
  - `apps/web/src/components/ui/button.tsx`: added missing `/* eslint-disable import/no-unresolved */` so the re-export shim passes per-package lint.
- `@nexus/ui/eslint.config.js`
  - Disabled `@typescript-eslint/no-empty-object-type` (Shadcn/Radix `interface` convention).
  - Disabled `import/no-unresolved` (relative imports are valid; typecheck + build validate path correctness; the `eslint-import-resolver-typescript` package is intentionally not installed to keep the root toolchain lean).
- Root re-export shim (`apps/web/src/components/ui/button.tsx`) now passes per-package lint.

### Known limitations.

- `@nexus/ui` does not ship compiled output (`dist/`); it is consumed via the workspace package reference (`"private": true`) and exposed through `packages/ui/src/index.ts`. Tree-shaking and barrel-import cost are not measured. The package is ready for source-tree consumption by `apps/web`.
- `eslint-import-resolver-typescript` is not installed (`import/resolver` requires it for tsconfig-aware resolution). `turbo run lint` therefore relies on `tsc --noEmit` and `next build` for actual import validation. Installing the resolver is tracked in the M4 tech-debt backlog.
- Rules of stylistic strictness (`@typescript-eslint/no-unsafe-assignment`, `no-unsafe-argument`) fire at warn-level in ~14 components. These are suppression-friendly and intentionally not blocking the release; they can be refined per-component during M3 development.
- No Storybook; component visual coverage relies on manual review at `apps/web/dev/components` (M0 design showcase) and per-component inspection.
- No unit tests; a11y and interaction testing is manual. Tracked for M4.

### Security

- N/A.

---

## [v0.1.0-foundation] — 2026-06-27

### Added

- Root `eslint.config.js` so `pnpm lint` resolves a config from the repo root (was failing under ESLint 9 flat config).
- Root `tsconfig.json` extending `tsconfig.base.json` (typed linting + project resolution for root dotfiles).

### Fixed

- `apps/web/Dockerfile`: non-root `useradd` is now idempotent (`node:22-bookworm-slim` ships a `node` user already, which broke the build).
- `apps/web/Dockerfile`: copy `pnpm-lock.yaml` into the deps stage so `pnpm install --frozen-lockfile` succeeds (lockfile was absent in the build context).
- `apps/web/package.json`: promoted `tw-animate-css` to a production dependency (imported by `globals.css`; previously only a `@nexus/ui` devDependency, so the production Docker build could not resolve it).
- `.prettierignore`: ignore `.claude/` and `.superpowers/` tooling directories (not project source).

### Security

- N/A.

---

## [0.1.0] — 2026-06-26

### Added

- Initial repository initialization (Step 1 + Step 2 foundation files).

[Unreleased]: https://github.com/OWNER/nexus-anime/compare/v0.2.0-ui-library...HEAD
[v0.2.0-ui-library]: https://github.com/OWNER/nexus-anime/releases/tag/v0.2.0-ui-library
[v0.1.0-foundation]: https://github.com/OWNER/nexus-anime/releases/tag/v0.1.0-foundation
[0.1.0]: https://github.com/OWNER/nexus-anime/releases/tag/v0.1.0
