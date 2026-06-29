// @nexus/web — Root Layout (Task 13.1)
// Server Component (no "use client"). Defines the global <html>/<body> scaffold,
// wires providers (theme, tooltip, future auth/query/analytics/i18n), registers
// design-token fonts, full SEO metadata + viewport, and an a11y skip-link.
// Feature chrome (Header/Footer/AppShell) is composed inside <main> by AppShell.

import { SkipLink } from "@nexus/ui";
import { Inter, Space_Grotesk } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/providers";

import type { Metadata, Viewport } from "next";

import "./globals.css";

// Design-system fonts (docs/04-design-system/Typography.md):
//   Inter = body, Space Grotesk = display. next/font/google preloads + self-hosts
//   the variable WOFF2 files (no network round-trips, no FOIT). The `variable`
//   custom properties map 1:1 onto the CSS custom properties defined in nexus/ui's
//   typography tokens (see typography.css), so Tailwind's --font-body/--font-display
//   and the raw var() usages resolve identically.
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  // Restrict to the weights the design system uses (300–700). The variable axis is
  // continuous, but limiting weights keeps the preloaded file lean.
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const APP_NAME = "Nexus Anime";
const APP_DESCRIPTION =
  "A premium, cinematic anime streaming portal for gaming-crossover and anime fans.";
const APP_URL = "https://nexusanime.app";

// metadata. Every page inherits this; per-route layouts/pages can extend
// it with generateMetadata. The title template appends the page title to the app name.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "anime",
    "streaming",
    "gaming",
    "gaming-crossover",
    "simulcast",
    "catalog",
    "watchlist",
  ],
  authors: [{ name: "Nexus Anime" }],
  creator: "Nexus Anime",
  applicationName: APP_NAME,
  // Inline SVG favicon (no-raster dependency) + PWA manifest icons. The manifest
  // references conventional public/ paths (icon.svg, icon-192x192.png) that later
  // milestones drop in; metadata resolves them opportunistically.
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
    description: APP_DESCRIPTION,
    locale: "en_US",
    url: APP_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: APP_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@nexusanime",
    creator: "@nexusanime",
    title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
    description: APP_DESCRIPTION,
    images: [{ url: "/og-image.png", alt: APP_NAME }],
  },
};

// Viewport + theming hints for the browser. themeColor matches Midnight's surface
// so the browser/chrome status bar blends with the app shell; the `media` variant
// mirrors prefers-color-scheme for browsers that honor it. viewportFit=cover enables
// edge-to-edge drawing on notched devices (safe-area-inset).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
    { media: "(prefers-color-scheme: light)", color: "#0a0a0f" },
  ],
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang for screen readers / translation tools. data-theme is the server-rendered
    // fallback (matches the cookie default) to avoid flash-of-wrong-theme; the
    // client ThemeProvider re-resolves cookie → storage → system and keeps it in sync.
    // suppressHydrationWarning is required because ThemeProvider mutates data-theme
    // after mount — without it Next warns on the legitimate server/client mismatch.
    <html
      lang="en"
      data-theme="midnight"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className={`bg-surface-base text-primary font-body min-h-screen antialiased`}>
        <Providers>
          <SkipLink />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
