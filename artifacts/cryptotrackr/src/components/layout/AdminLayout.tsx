import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Bitcoin, LayoutDashboard, Users, Activity, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Clients", href: "/admin/clients" },
  { icon: Activity, label: "Cycle Intel", href: "/admin/cycle" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(0 0% 4%)" }}>
      <aside
        className="hidden lg:flex flex-col w-60 fixed inset-y-0 left-0"
        style={{ background: "hsl(0 0% 5%)", borderRight: "1px solid hsl(0 0% 12%)" }}
      >
        <div className="px-5 h-16 flex items-center gap-2.5 shrink-0" style={{ borderBottom: "1px solid hsl(0 0% 10%)" }}>
          <Bitcoin className="w-5 h-5" style={{ color: "#F7931A" }} />
          <span className="text-sm font-semibold tracking-tight text-white">CryptoTrackr</span>
          <span
            className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
            style={{ background: "rgba(247,147,26,0.12)", color: "#F7931A" }}
          >
            Admin
          </span>
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="px-3 space-y-0.5">
            {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
              const active = href === "/admin" ? location === "/admin" : location.startsWith(href);
              return (
                <Link key={href} href={href}>
                  <a
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background: active ? "rgba(247,147,26,0.08)" : "transparent",
                      color: active ? "#F7931A" : "hsl(0 0% 65%)",
                    }}
                    data-testid={`admin-nav-${label.toLowerCase()}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-3 py-4" style={{ borderTop: "1px solid hsl(0 0% 10%)" }}>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_75%)] transition-colors"
            data-testid="button-signout"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4" style={{ background: "hsl(0 0% 5%)", borderBottom: "1px solid hsl(0 0% 12%)" }}>
        <div className="flex items-center gap-2">
          <Bitcoin className="w-5 h-5" style={{ color: "#F7931A" }} />
          <span className="text-sm font-semibold text-white">CryptoTrackr</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase" style={{ background: "rgba(247,147,26,0.12)", color: "#F7931A" }}>Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[hsl(0_0%_55%)]">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 pt-14" style={{ background: "hsl(0 0% 5%)" }}>
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
              const active = href === "/admin" ? location === "/admin" : location.startsWith(href);
              return (
                <Link key={href} href={href}>
                  <a
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      background: active ? "rgba(247,147,26,0.08)" : "transparent",
                      color: active ? "#F7931A" : "hsl(0 0% 65%)",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </a>
                </Link>
              );
            })}
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[hsl(0_0%_50%)]"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
