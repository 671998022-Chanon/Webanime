// ESLint 9 flat config for @nexus/web.
//
// Composes the shared monorepo rules from @nexus/eslint-config with the
// type-checked layer that needs the local tsconfig project info. The shared
// config is intentionally parser-agnostic; web is the only package that ships
// JSX today, so the TS parser + project resolution lives here rather than in
// the shared package.
import nexusConfig from "@nexus/eslint-config";
import tseslint from "typescript-eslint";

export default tseslint.config(...nexusConfig, {
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    parserOptions: {
      // Use the lint-specific tsconfig (tsconfig.lint.json) which also folds
      // in packages/ui's source so the type-checked rules can resolve types
      // that originate there. The build's `tsc` still uses tsconfig.json.
      project: ["./tsconfig.lint.json"],
    },
  },
  // Without a resolver, import/no-unresolved treats the `@/` tsconfig path
  // alias and the `@nexus/ui` workspace package as missing modules (the
  // shared config enables the rule but is parser-agnostic). Wire both here:
  // typescript reads tsconfig paths + node extends resolution to the pnpm
  // workspace symlink, so `@/...` and `@nexus/*` both resolve.
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.lint.json",
      },
      node: {
        extensions: [".ts", ".tsx"],
      },
    },
  },
});
