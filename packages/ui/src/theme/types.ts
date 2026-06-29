// @nexus/ui — Theme types and constants
// Values and resolution order from docs/04-design-system/Theme.md

export const THEME_COOKIE_NAME = "nexus-theme";
export const THEME_STORAGE_KEY = "nexus-theme";

// Reserved for future themes (Dawn, Aurora). Only "midnight" ships in v1.
export type Theme = "midnight" | "system";
export type ResolvedTheme = "midnight";

export interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

/**
 * Selectable theme options surfaced in the theme switcher UI.
 *
 * "light" is a placeholder for the future Dawn theme (see docs/04-design-system/Theme.md —
 * Dawn is "not designed, not implemented"). It is rendered disabled with a "Coming soon" hint
 * and is NOT a valid persisted {@link Theme} value, so selecting it is a no-op. The only
 * actionable values remain "midnight" and "system".
 */
export type ThemeOption = "light" | "midnight" | "system";

export interface ThemeOptionMeta {
  value: ThemeOption;
  /** Short label shown in the switcher. */
  label: string;
  /** Longer hint for screen readers / tooltips. */
  description: string;
  /** Marks placeholder options that cannot yet be selected. */
  comingSoon?: boolean;
}

/** Data-driven metadata for the theme switcher dropdown. Order = display order. */
export const THEME_OPTIONS: readonly ThemeOptionMeta[] = [
  {
    value: "light",
    label: "Light",
    description: "Light theme (Dawn) — coming soon",
    comingSoon: true,
  },
  {
    value: "midnight",
    label: "Dark",
    description: "Dark theme (Midnight) — the default cinematic theme",
  },
  {
    value: "system",
    label: "System",
    description: "Follow your operating system preference",
  },
] as const;
