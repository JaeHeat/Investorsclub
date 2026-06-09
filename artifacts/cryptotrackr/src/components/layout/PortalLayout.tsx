import { useAuth } from "@/contexts/AuthContext";
import { getReports, getReadReports } from "@/lib/localStore";
import { Link, useLocation } from "wouter";
import { Bitcoin, LayoutDashboard, Target, Map, FileText, MessageSquare, Activity, PieChart, LogOut, Menu, X, TrendingDown, TrendingUp, RefreshCw, Eye, Shield, Settings, BookOpen, Calculator, Zap, Sparkles, CalendarDays, Repeat } from "lucide-react";
import { useState, useEffect } from "react";

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
      { icon: Repeat,          label: "The 4-Year Cycle", href: "/portal/thesis" },
      { icon: Activity,        label: "Cycle Signals",   href: "/portal/cycle" },
      { icon: PieChart,        label: "Portfolio Plan",  href: "/portal/plan" },
      { icon: TrendingUp,      label: "Entry Strategy",  href: "/portal/entry" },
      { icon: TrendingDown,    label: "Exit Strategy",   href: "/portal/exit" },
      { icon: RefreshCw,       label: "DCA Planner",     href: "/portal/dca" },
      { icon: Zap,             label: "EV Tool",          href: "/portal/ev" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { icon: Sparkles,        label: "Probability Forecast", href: "/portal/forecast" },
      { icon: CalendarDays,    label: "Seasonality",     href: "/portal/seasonality" },
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
    label: "Resources",
    items: [
      { icon: Map,             label: "Roadmap",         href: "/portal/roadmap" },
      { icon: FileText,        label: "Reports",         href: "/portal/reports" },
    ],
  },
  {
    label: "Personal",
    items: [
      { icon: MessageSquare,   label: "Notes",           href: "/portal/notes" },
      { icon: BookOpen,        label: "Trade Journal",   href: "/portal/journal" },
      { icon: Calculator,      label: "Tax Estimator",   href: "/portal/tax" },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function NavItem({ icon: Icon, label, href, location, badge, onClick }: {
  icon: React.ElementType;
  label: string;
  href: string;
  location: string;
  badge?: number;
  onClick?: () => void;
}) {
  const active = href === "/portal" ? location === "/portal" : location.startsWith(href);
  return (
    <Link
      key={href}
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
      style={{
        background: active ? "rgba(247,147,26,0.08)" : "transparent",
        color: active ? "#F7931A" : "hsl(0 0% 65%)",
      }}
      data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
      onClick={onClick}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: "#F7931A" }}
        />
      )}
    </Link>
  );
}

function countUnreadReports(userId: string): number {
  try {
    const reports = getReports(userId);
    const readIds = getReadReports(userId);
    return reports.filter((r) => {
      if (readIds.has(r.id)) return false;
      const ageDays = (Date.now() - new Date(r.published_at).getTime()) / 86400000;
      return ageDays <= 7;
    }).length;
  } catch {
    return 0;
  }
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, clientProfile, signOut } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadReports, setUnreadReports] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (user) setUnreadReports(countUnreadReports(user.id));
  }, [location, user]);

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
          <span className="text-sm font-semibold tracking-tight text-white">Bitcoin Daily</span>
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
                    <NavItem
                      key={href}
                      icon={icon}
                      label={label}
                      href={href}
                      location={location}
                      badge={href === "/portal/reports" ? unreadReports : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="px-3 py-4" style={{ borderTop: "1px solid hsl(0 0% 10%)" }}>
          <Link
            href="/portal/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all mb-1"
            style={{
              background: location === "/portal/settings" ? "rgba(247,147,26,0.08)" : "transparent",
              color: location === "/portal/settings" ? "#F7931A" : "hsl(0 0% 65%)",
            }}
            data-testid="nav-settings"
          >
            <Settings className="w-4 h-4 shrink-0" />
            Settings
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
          <span className="text-sm font-semibold text-white">Bitcoin Daily</span>
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
                    const hasUnread = href === "/portal/reports" && unreadReports > 0;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                        onClick={() => setMobileOpen(false)}
                        style={{
                          background: active ? "rgba(247,147,26,0.08)" : "transparent",
                          color: active ? "#F7931A" : "hsl(0 0% 65%)",
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1">{label}</span>
                        {hasUnread && (
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#F7931A" }} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <div>
              <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_30%)]">Account</p>
              <Link
                href="/portal/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                onClick={() => setMobileOpen(false)}
                style={{
                  background: location === "/portal/settings" ? "rgba(247,147,26,0.08)" : "transparent",
                  color: location === "/portal/settings" ? "#F7931A" : "hsl(0 0% 65%)",
                }}
              >
                <Settings className="w-4 h-4" />
                Settings
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
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen flex flex-col">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
          {children}
        </div>
        {/* Global compliance disclaimer — guarantees coverage on every portal
            page (incl. the projection-heavy Cycle Outlook and dashboard). */}
        <footer className="max-w-5xl mx-auto w-full px-4 sm:px-6 pb-8">
          <div className="border-t pt-4" style={{ borderColor: "hsl(0 0% 11%)" }}>
            <p className="text-[10px] leading-relaxed text-[hsl(0_0%_32%)]">
              For educational and informational purposes only — not financial, investment, or tax advice. Projections are
              scenario estimates based on historical Bitcoin halving cycles; past performance does not guarantee future
              results, and digital assets can lose substantial value. Make your own decisions and consult a licensed
              professional before acting.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link href="/terms" className="text-[10px] text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_65%)] transition-colors">Terms</Link>
              <Link href="/privacy" className="text-[10px] text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_65%)] transition-colors">Privacy</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
