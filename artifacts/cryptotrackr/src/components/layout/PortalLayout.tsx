import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { Bitcoin, LayoutDashboard, Target, Map, FileText, MessageSquare, Activity, PieChart, LogOut, Menu, X, TrendingDown, RefreshCw, Eye, Shield, Settings } from "lucide-react";
import { useState } from "react";

const NAV_GROUPS = [
  {
    label: "Portfolio",
    items: [
      { icon: LayoutDashboard, label: "Portfolio",       href: "/portal" },
      { icon: Target,          label: "Milestones",      href: "/portal/milestones" },
    ],
  },
  {
    label: "Strategy",
    items: [
      { icon: Activity,        label: "Cycle Outlook",   href: "/portal/cycle" },
      { icon: PieChart,        label: "Portfolio Plan",  href: "/portal/plan" },
      { icon: TrendingDown,    label: "Exit Strategy",   href: "/portal/exit" },
      { icon: RefreshCw,       label: "DCA Planner",     href: "/portal/dca" },
    ],
  },
  {
    label: "Monitor",
    items: [
      { icon: Eye,             label: "Watchlist",       href: "/portal/watchlist" },
      { icon: Shield,          label: "Bear Protection", href: "/portal/bear" },
    ],
  },
  {
    label: "Consultant",
    items: [
      { icon: Map,             label: "Roadmap",         href: "/portal/roadmap" },
      { icon: FileText,        label: "Reports",         href: "/portal/reports" },
      { icon: MessageSquare,   label: "Notes",           href: "/portal/notes" },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function NavItem({ icon: Icon, label, href, location, onClick }: {
  icon: React.ElementType;
  label: string;
  href: string;
  location: string;
  onClick?: () => void;
}) {
  const active = href === "/portal" ? location === "/portal" : location.startsWith(href);
  return (
    <Link key={href} href={href}>
      <a
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
        style={{
          background: active ? "rgba(247,147,26,0.08)" : "transparent",
          color: active ? "#F7931A" : "hsl(0 0% 65%)",
        }}
        data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
        onClick={onClick}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </a>
    </Link>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { clientProfile, signOut } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSignOut() {
    setMobileOpen(false);
    signOut();
  }

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(0 0% 4%)" }}>
      {/* Sidebar desktop */}
      <aside
        className="hidden lg:flex flex-col w-60 fixed inset-y-0 left-0"
        style={{ background: "hsl(0 0% 5%)", borderRight: "1px solid hsl(0 0% 12%)" }}
      >
        <div className="px-5 h-16 flex items-center gap-2.5 shrink-0" style={{ borderBottom: "1px solid hsl(0 0% 10%)" }}>
          <Bitcoin className="w-5 h-5" style={{ color: "#F7931A" }} />
          <span className="text-sm font-semibold tracking-tight text-white">CryptoTrackr</span>
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 mb-5">
            <p className="text-xs text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1">Signed in as</p>
            <p className="text-sm font-medium text-white truncate">{clientProfile?.full_name || "Client"}</p>
          </div>

          <nav className="px-3 space-y-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_30%)]">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(({ icon, label, href }) => (
                    <NavItem key={href} icon={icon} label={label} href={href} location={location} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="px-3 py-4" style={{ borderTop: "1px solid hsl(0 0% 10%)" }}>
          <Link href="/portal/settings">
            <a
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all mb-1"
              style={{
                background: location === "/portal/settings" ? "rgba(247,147,26,0.08)" : "transparent",
                color: location === "/portal/settings" ? "#F7931A" : "hsl(0 0% 65%)",
              }}
              data-testid="nav-settings"
            >
              <Settings className="w-4 h-4 shrink-0" />
              Settings
            </a>
          </Link>
          <button
            onClick={handleSignOut}
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
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[hsl(0_0%_55%)]" data-testid="button-mobile-menu">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 pt-14 overflow-y-auto" style={{ background: "hsl(0 0% 5%)" }}>
          <nav className="p-4 space-y-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_30%)]">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(({ icon: Icon, label, href }) => {
                    const active = href === "/portal" ? location === "/portal" : location.startsWith(href);
                    return (
                      <Link key={href} href={href}>
                        <a
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
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
                </div>
              </div>
            ))}
            <div>
              <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_30%)]">Account</p>
              <Link href="/portal/settings">
                <a
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    background: location === "/portal/settings" ? "rgba(247,147,26,0.08)" : "transparent",
                    color: location === "/portal/settings" ? "#F7931A" : "hsl(0 0% 65%)",
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </a>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[hsl(0_0%_50%)]"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
