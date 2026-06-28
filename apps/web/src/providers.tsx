"use client";

import { ThemeProvider, TooltipProvider } from "@nexus/ui";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-side provider tree. ThemeProvider resolves cookie → localStorage → OS
 * preference → "midnight" default. TooltipProvider enables Radix tooltip delays
 * for all WithTooltip / TooltipRoot usages. This file is a "use client" boundary
 * so Server Components remain the default above it.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
