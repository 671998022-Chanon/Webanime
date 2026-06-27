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

[Unreleased]: https://github.com/OWNER/nexus-anime/compare/v0.1.0-foundation...HEAD
[v0.1.0-foundation]: https://github.com/OWNER/nexus-anime/releases/tag/v0.1.0-foundation
[0.1.0]: https://github.com/OWNER/nexus-anime/releases/tag/v0.1.0
