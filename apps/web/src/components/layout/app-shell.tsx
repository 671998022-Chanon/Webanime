"use client";

import { useState } from "react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { SearchBar } from "@/components/search/search-bar";
import { ThemeToggle } from "@/components/user/theme-toggle";
import { UserMenu } from "@/components/user/user-menu";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onMobileMenuToggle={() => setMobileMenuOpen(true)}
        onSearchOpen={() => setSearchOpen(true)}
      >
        <ThemeToggle />
        <UserMenu />
      </Header>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileDrawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      <SearchBar open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
