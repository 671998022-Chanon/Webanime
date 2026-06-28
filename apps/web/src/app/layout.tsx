/* eslint-disable import/no-unresolved -- workspace link @nexus/ui resolves at build time */
import { SkipLink } from "@nexus/ui";

import type { Metadata, Viewport } from "next";

import { Providers } from "@/providers";
import { Header } from "@/components/layout/header";

import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Anime",
  description: "A premium, cinematic anime streaming portal for gaming-crossover and anime fans.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="midnight" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>
          <SkipLink />
          <Header />
          <main id="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
