"use client";

import { useState } from "react";

import { Header } from "@/components/layout/header";
import { MobileDrawer } from "@/components/layout/mobile-drawer";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell — orchestrates the header (with mobile menu toggle) and the
 * mobile drawer. This is a client component because it manages the drawer
 * open/close state. Rendered inside the root layout's Providers tree.
 */
export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Header onMobileMenuToggle={() => setMobileMenuOpen(true)} />
      <main id="main-content">{children}</main>
      <MobileDrawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
    </>
  );
}
