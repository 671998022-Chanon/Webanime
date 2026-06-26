# Contributing to Nexus Anime

Thanks for your interest in contributing. Please read through this guide before submitting a pull request.

## Workflow

1. **Fork or branch from `main`.** Branch naming follows `<type>/<milestone>-<short-slug>` — see [Repository Design](../docs/REPOSITORY-DESIGN.md#6-branch-naming-convention).
2. **Open a pull request** using the PR template. Fill in the motivation, testing steps, and screenshots for UI changes.
3. **CI must pass.** The required checks are: `lint`, `typecheck`, `test`, `build`, `format:check`.
4. **Obtain at least one review.** Resolve all conversations before merging.
5. **Squash & merge.** Your branch will be deleted post-merge.

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/). The PR title should use one of:

- `feat:` — new feature (drives a MINOR version bump)
- `fix:` — bug fix (drives a PATCH version bump)
- `docs:` — documentation only
- `chore:` — maintenance, tooling, dependencies
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `BREAKING CHANGE` in the body — drives a MAJOR version bump

## Local setup

```bash
pnpm install
cp .env.example apps/web/.env.local
pnpm docker:up     # optional, for local Postgres/Redis/Mailpit
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Repository conventions

Branch strategy, versioning, folder structure, and process rules are defined in [`docs/REPOSITORY-DESIGN.md`](../docs/REPOSITORY-DESIGN.md). Read it before creating branches, PRs, or issues.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Reporting security issues

Please **do not** open public issues for security bugs. See [SECURITY.md](SECURITY.md).
