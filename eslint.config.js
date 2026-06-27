// ESLint 9 flat config for the monorepo root.
//
// The root exists so that `eslint .` (run by `pnpm lint` / turbo from the repo
// root) resolves a config. Its job is narrow: lint repository-wide files
// (root dotfiles, configs, tooling). Application and package sources under
// `apps/*` and `packages/*` each own their own eslint.config.js and are linted
// by turbo in isolation.
//
// The leading `ignores`-only object is a GLOBAL ignore in ESLint flat config:
// it applies across the entire config array, so the shared config's global
// (no `files` filter) typed-rule objects never match files under apps/* or
// packages/* — which is what we want, since those trees lint themselves and
// would otherwise pull build artifacts (apps/web/.next) through the root
// tsconfig project.
//
// We import the shared config by relative path because the root package is not
// part of the pnpm workspace's consumer resolution for workspace packages.
import nexusConfig from "./packages/config-eslint/index.js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "apps/**",
      "packages/**",
      "node_modules/**",
      "dist/**",
      ".next/**",
      ".turbo/**",
      "coverage/**",
      "**/*.d.ts",
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
  },
  ...nexusConfig,
);
