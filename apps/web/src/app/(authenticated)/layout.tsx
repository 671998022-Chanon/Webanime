import { Sidebar } from "@/components/layout/sidebar";

/**
 * Authenticated layout — adds desktop sidebar to the left of content.
 * This route group is for pages that require the sidebar navigation
 * (Home, Browse, Watchlist, etc.). The sidebar is hidden on mobile;
 * mobile navigation is provided by the MobileDrawer.
 */
export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <Sidebar />
      {/* Main content offset — matches sidebar width on md+ */}
      <div className="flex-1 md:pl-60">{children}</div>
    </div>
  );
}
