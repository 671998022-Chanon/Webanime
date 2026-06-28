"use client";

import { useState } from "react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileDrawer } from "@/components/layout/mobile-drawer";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell — orchestrates header, main content, footer, and mobile drawer.
 * The Footer is a Server Component rendered inside this client boundary
 * (React allows server children inside client parents).
 */
export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMobileMenuToggle={() => setMobileMenuOpen(true)} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileDrawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
    </div>
  );
}
