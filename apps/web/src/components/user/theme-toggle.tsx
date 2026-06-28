"use client";

import { IconButton, useTheme } from "@nexus/ui";
import { Moon, Monitor } from "lucide-react";

/**
 * Theme toggle — cycles between midnight and system theme.
 * Currently only "midnight" and "system" are valid theme values.
 * The resolved theme is always "midnight" in v1, but the toggle
 * lets users choose whether to follow OS preference or force dark.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function cycleTheme() {
    if (theme === "midnight") {
      setTheme("system");
    } else {
      setTheme("midnight");
    }
  }

  const label = theme === "system" ? "Following system theme" : "Dark theme active";

  return (
    <IconButton variant="ghost" size="sm" aria-label={label} onClick={cycleTheme}>
      {theme === "system" ? <Monitor className="size-4" /> : <Moon className="size-4" />}
    </IconButton>
  );
}
