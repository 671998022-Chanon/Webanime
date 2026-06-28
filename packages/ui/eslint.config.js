import nexusConfig from "@nexus/eslint-config";
import tseslint from "typescript-eslint";

// Flat config for @nexus/ui. Re-exports the shared monorepo config and adds
// type-checked project resolution so @typescript-eslint typed rules can
// resolve the local tsconfig.json.
export default tseslint.config(...nexusConfig, {
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    parserOptions: {
      project: true,
    },
  },
  rules: {
    // Shadcn/ui pattern: `interface X extends React.ComponentPropsWithoutRef<…> {}`
    // is the documented Radix convention; interfaces are preferable to `type`
    // aliases here because they are augmentable by downstream consumers.
    "@typescript-eslint/no-empty-object-type": "off",
    // Suppressed: the shared config sets `import/no-unresolved: error` but
    // `eslint-import-resolver-typescript` is not installed in this repo, so
    // valid relative imports inside component files are flagged. Typecheck +
    // build validate that resolvable paths are correct.
    "import/no-unresolved": "off",
  },
});
