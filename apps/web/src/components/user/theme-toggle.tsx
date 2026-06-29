"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  IconButton,
  Badge,
  useTheme,
  THEME_OPTIONS,
  cn,
} from "@nexus/ui";
import { Check, Moon, Monitor, Sun } from "lucide-react";

/** Icon per theme option — keeps the trigger and items visually consistent. */
const OPTION_ICON: Record<(typeof THEME_OPTIONS)[number]["value"], React.ReactNode> = {
  light: <Sun className="size-4" />,
  midnight: <Moon className="size-4" />,
  system: <Monitor className="size-4" />,
};

/**
 * Theme switcher — a dropdown of Light / Dark / System.
 *
 * Only "midnight" and "system" are actionable (see docs/04-design-system/Theme.md: Dawn is
 * "not designed, not implemented"). "Light" renders disabled with a "Coming soon" badge and is
 * not a valid persisted value, so selecting it is a no-op. The active option shows a check mark.
 * Persists via the existing ThemeProvider (cookie + localStorage + data-theme on <html>).
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // The check mark reflects the *selected* preference. When following the OS, "system" is the
  // active choice even though the resolved theme is still "midnight" in v1.
  const activeValue = theme;

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <IconButton variant="ghost" size="sm" aria-label="Change theme">
          {activeValue === "system" ? <Monitor className="size-4" /> : <Moon className="size-4" />}
        </IconButton>
      </DropdownTrigger>

      <DropdownContent align="end" sideOffset={8} className="w-44">
        <DropdownLabel>Theme</DropdownLabel>
        {THEME_OPTIONS.map((option: (typeof THEME_OPTIONS)[number]) => {
          const isActive = option.value === activeValue;
          const disabled = option.comingSoon;

          return (
            <DropdownItem
              key={option.value}
              icon={OPTION_ICON[option.value]}
              disabled={disabled}
              onClick={() => {
                // Only real themes are assignable; "light" is a placeholder no-op.
                if (!disabled) setTheme(option.value as "midnight" | "system");
              }}
              className={cn(disabled && "opacity-60")}
            >
              <span className="flex-1">{option.label}</span>
              {option.comingSoon ? (
                <Badge variant="info" size="sm">
                  Soon
                </Badge>
              ) : isActive ? (
                <Check className="text-action-primary-bg size-4" aria-hidden="true" />
              ) : null}
            </DropdownItem>
          );
        })}
      </DropdownContent>
    </Dropdown>
  );
}
