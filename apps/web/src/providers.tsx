"use client";

import { ThemeProvider, Toaster, TooltipProvider } from "@nexus/ui";
import * as React from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Centralized client-side provider tree. Mounted once by the root layout, which
 * stays a Server Component above this boundary. Order matters:
 *
 *   ThemeProvider  → resolves cookie → localStorage → OS → "midnight" (sets data-theme)
 *   Toaster        → Radix ToastProvider + ToastViewport; descendant <ToastRoot> renders here
 *   TooltipProvider→ Radix tooltip delay (200ms) for WithTooltip / TooltipRoot
 *
 * Each provider is modular and independently removable. Future providers mount in
 * the marked slots below — see "Extension points". No external services are
 * initialized here; this file composes context only.
 *
 * Extension points (inject when the feature lands — no-ops until then):
 *   - AuthProvider:        Auth.js v5 <SessionProvider> wrapping {children}.
 *   - QueryProvider:       TanStack Query <QueryClientProvider> (client island).
 *   - AnalyticsProvider:   Vercel Analytics / segment wrapper (client island).
 *   - I18nProvider:        next-intl <NextIntlClientProvider> (client island).
 *   - FeatureFlagProvider: @nexus/cache-backed flag context (client island).
 *
 * Modal note: Radix Dialog is *controlled* — state lives in the consumer, not a
 * global provider — so there is no <DialogProvider> to mount. Dialog.Root in each
 * modal is the correct boundary. See packages/ui/src/components/dialog.tsx.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
