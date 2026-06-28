"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";

/**
 * Authenticated layout — adds desktop sidebar to the left of content.
 * This route group is for pages that require the sidebar navigation
 * (Home, Browse, Watchlist, etc.). The sidebar is hidden on mobile;
 * mobile navigation is provided by the MobileDrawer.
 *
 * Client component: tracks sidebar collapse state so the content offset
 * tracks the sidebar's actual width (240px expanded, 64px collapsed).
 */
export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      {/* Main content offset — tracks sidebar width on md+ */}
      <div
        className={
          sidebarCollapsed
            ? "flex-1 transition-all duration-200 md:pl-16"
            : "flex-1 transition-all duration-200 md:pl-60"
        }
      >
        {children}
      </div>
    </div>
  );
}
