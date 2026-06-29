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

## [v0.3.0-application-shell] — 2026-06-29

Application Shell release. The full navigation + layout shell is green across `turbo run lint`, `turbo run typecheck`, `turbo run build` and is ready for Homepage development (Step 14).

### Added

- **Import resolution for `@nexus/web` lint:** installed `eslint-import-resolver-typescript` and wired `import/resolver` (typescript + node) in `apps/web/eslint.config.js` so `import/no-unresolved` can resolve both the `@/` tsconfig path alias and the `@nexus/ui` workspace package. Previously the rule flagged every workspace/alias import as missing (the shared config enabled the rule but shipped no resolver).
- **`tsconfig.lint.json`** for `@nexus/web`: extends the build tsconfig and adds `packages/ui/src/**` to `include` so the type-checked lint rules (`no-unsafe-*`, `no-misused-promises`) can resolve types that originate in the UI package. The build's `tsc` still uses `tsconfig.json`.
- **`@nexus/ui` path mapping** in `apps/web/tsconfig.json` (`@nexus/ui` → `packages/ui/src/index.ts`) so the typescript-eslint parser honors the workspace import for non-relative resolution.
- **SearchBar Cmd+K binding stabilized:** the global keydown handler now reads open-state through a ref (`isOpenRef`) and lists `setIsOpen` in its dependency array, fixing the `react-hooks/exhaustive-deps` warning and avoiding re-binding the listener on every toggle.
- **Footer version bumped** to `v0.3.0 · Application Shell · 2026.06.29`.

### Removed

- **`apps/web/src/components/ui/button.tsx`** (and the now-empty `components/ui/` dir): an unused re-export shim. `Button` is imported directly from `@nexus/ui` everywhere; the shim was leftover shadcn scaffolding and triggered `react-refresh/only-export-components`.

### Fixed

- **Lint debt in `@nexus/web` (validation-discovered):**
  - `loading-skeleton.tsx`, `search-overlay.tsx`: consolidated duplicate `@nexus/ui` imports (`import/no-duplicates`).
  - `global-error.tsx`: dropped the unused `error` destructured param (kept in the Next.js signature type).
  - `search-overlay.tsx`: removed the unused `Search` import.
  - 7 files: `eslint --fix` corrected `import/order` grouping and alphabetization.
  - `search-anime-card.tsx`: added targeted `eslint-disable-next-line` for two `score.toFixed(1)` false positives — the `no-unsafe-*` rule can't resolve `CommandItem`'s forwardRef-derived props (cmdk types) in its lint-time TS program, while `tsc` resolves `score` as `number` (verified via the compiler API). Context comment included; see `tsconfig.lint.json`.

### Known limitations

- `@nexus/ui` itself still ships 14 warn-level `no-unsafe-*` findings (cn.ts / tailwind-merge typing); these are warnings, not errors, and are outside the shell scope. They do not block lint/typecheck/build.
- `nav-items.ts` surfaces 19 warn-level `no-unsafe-assignment` findings for lucide icon components assigned to the `icon: React.ComponentType<{className?: string}>` field. These are benign (the icons are valid components) and are a warn-level lint-program type-resolution limitation, not a type error — `tsc` typechecks the file cleanly.
- The two `no-unsafe-call`/`no-unsafe-member-access` disables in `search-anime-card.tsx` are the only inline lint suppressions added; both are verified false positives with explanatory comments.
- No Storybook; no unit tests; a11y and interaction testing is manual (tracked for M4).
- Footer social links remain placeholders (`href="#"`) until social accounts are established.

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
- ~~`eslint-import-resolver-typescript` is not installed~~ — **resolved in v0.3.0.** The resolver is now a `@nexus/web` devDependency and wired into `apps/web/eslint.config.js`, so `import/no-unresolved` validates both `@/` aliases and `@nexus/*` workspace imports during lint.
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

[Unreleased]: https://github.com/OWNER/nexus-anime/compare/v0.3.0-application-shell...HEAD
[v0.3.0-application-shell]: https://github.com/OWNER/nexus-anime/releases/tag/v0.3.0-application-shell
[v0.2.0-ui-library]: https://github.com/OWNER/nexus-anime/releases/tag/v0.2.0-ui-library
[v0.1.0-foundation]: https://github.com/OWNER/nexus-anime/releases/tag/v0.1.0-foundation
[0.1.0]: https://github.com/OWNER/nexus-anime/releases/tag/v0.1.0
