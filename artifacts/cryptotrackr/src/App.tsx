import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Component, Suspense, lazy, type ReactNode, type ErrorInfo } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "hsl(0 0% 4%)" }}>
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <span className="text-red-400 text-xl">!</span>
            </div>
            <h1 className="text-white font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-white/40 mb-6">An unexpected error occurred. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A", border: "1px solid rgba(247,147,26,0.2)" }}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
// Routes are lazy-loaded so each page ships in its own chunk — keeps the
// initial bundle small instead of one ~1MB blob.
const LoginPage = lazy(() => import("@/pages/login"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));
const PortalIndex = lazy(() => import("@/pages/portal/index"));
const MilestonesPage = lazy(() => import("@/pages/portal/milestones"));
const CyclePage = lazy(() => import("@/pages/portal/cycle"));
const RoadmapPage = lazy(() => import("@/pages/portal/roadmap"));
const ReportsPage = lazy(() => import("@/pages/portal/reports"));
const NotesPage = lazy(() => import("@/pages/portal/notes"));
const PlanPage = lazy(() => import("@/pages/portal/plan"));
const ExitStrategyPage = lazy(() => import("@/pages/portal/exit"));
const EntryStrategyPage = lazy(() => import("@/pages/portal/entry"));
const DcaPage = lazy(() => import("@/pages/portal/dca"));
const ForecastPage = lazy(() => import("@/pages/portal/forecast"));
const SeasonalityPage = lazy(() => import("@/pages/portal/seasonality"));
const AssetPage = lazy(() => import("@/pages/portal/asset"));
const ThesisPage = lazy(() => import("@/pages/portal/thesis"));
const TermsPage = lazy(() => import("@/pages/legal/terms"));
const PrivacyPage = lazy(() => import("@/pages/legal/privacy"));
const WatchlistPage = lazy(() => import("@/pages/portal/watchlist"));
const BearProtectionPage = lazy(() => import("@/pages/portal/bear"));
const SettingsPage = lazy(() => import("@/pages/portal/settings"));
const TradeJournalPage = lazy(() => import("@/pages/portal/journal"));
const TaxPage = lazy(() => import("@/pages/portal/tax"));
const EVPage = lazy(() => import("@/pages/portal/ev"));
const AdminDashboard = lazy(() => import("@/pages/admin/index"));
const AdminClients = lazy(() => import("@/pages/admin/clients"));
const CycleIntelligence = lazy(() => import("@/pages/admin/cycle"));
const AdminPlans = lazy(() => import("@/pages/admin/plans"));
const BroadcastPage = lazy(() => import("@/pages/admin/broadcast"));
const AnalyticsPage = lazy(() => import("@/pages/admin/analytics"));
const AdminApprovalsPage = lazy(() => import("@/pages/admin/approvals"));
const AdminTransactionsPage = lazy(() => import("@/pages/admin/transactions"));
const PendingApprovalPage = lazy(() => import("@/pages/pending"));

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(0 0% 4%)" }}>
      <div
        className="w-5 h-5 rounded-full border-2 animate-spin"
        style={{ borderColor: "rgba(247,147,26,0.25)", borderTopColor: "#F7931A" }}
      />
    </div>
  );
}

function ProtectedRoute({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: "admin" | "client";
}) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect to="/" />;
  if (user.role === "pending") return <Redirect to="/pending" />;
  if (requireRole && user.role !== requireRole) return <Redirect to="/" />;
  return <>{children}</>;
}

function RootRoute() {
  const { user, clientProfile, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  if (user) {
    if (user.role === "admin") return <Redirect to="/admin" />;
    if (user.role === "pending") return <Redirect to="/pending" />;
    if (user.role === "client") {
      if (!clientProfile?.onboarding_completed) return <Redirect to="/onboarding" />;
      return <Redirect to="/portal" />;
    }
  }

  return <LoginPage />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />

      <Route path="/onboarding">
        <ProtectedRoute requireRole="client"><OnboardingPage /></ProtectedRoute>
      </Route>

      <Route path="/portal">
        <ProtectedRoute requireRole="client"><PortalIndex /></ProtectedRoute>
      </Route>
      <Route path="/portal/milestones">
        <ProtectedRoute requireRole="client"><MilestonesPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/cycle">
        <ProtectedRoute requireRole="client"><CyclePage /></ProtectedRoute>
      </Route>
      <Route path="/portal/roadmap">
        <ProtectedRoute requireRole="client"><RoadmapPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/reports">
        <ProtectedRoute requireRole="client"><ReportsPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/notes">
        <ProtectedRoute requireRole="client"><NotesPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/plan">
        <ProtectedRoute requireRole="client"><PlanPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/exit">
        <ProtectedRoute requireRole="client"><ExitStrategyPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/entry">
        <ProtectedRoute requireRole="client"><EntryStrategyPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/dca">
        <ProtectedRoute requireRole="client"><DcaPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/forecast">
        <ProtectedRoute requireRole="client"><ForecastPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/seasonality">
        <ProtectedRoute requireRole="client"><SeasonalityPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/asset/:id">
        <ProtectedRoute requireRole="client"><AssetPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/thesis">
        <ProtectedRoute requireRole="client"><ThesisPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/watchlist">
        <ProtectedRoute requireRole="client"><WatchlistPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/bear">
        <ProtectedRoute requireRole="client"><BearProtectionPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/settings">
        <ProtectedRoute requireRole="client"><SettingsPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/journal">
        <ProtectedRoute requireRole="client"><TradeJournalPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/tax">
        <ProtectedRoute requireRole="client"><TaxPage /></ProtectedRoute>
      </Route>
      <Route path="/portal/ev">
        <ProtectedRoute requireRole="client"><EVPage /></ProtectedRoute>
      </Route>

      <Route path="/pending">
        {() => {
          const { user, loading } = useAuth();
          if (loading) return <LoadingScreen />;
          if (!user) return <Redirect to="/" />;
          if (user.role !== "pending") return <Redirect to="/" />;
          return <PendingApprovalPage />;
        }}
      </Route>

      <Route path="/admin">
        <ProtectedRoute requireRole="admin"><AdminDashboard /></ProtectedRoute>
      </Route>
      <Route path="/admin/clients">
        <ProtectedRoute requireRole="admin"><AdminClients /></ProtectedRoute>
      </Route>
      <Route path="/admin/cycle">
        <ProtectedRoute requireRole="admin"><CycleIntelligence /></ProtectedRoute>
      </Route>
      <Route path="/admin/plans">
        <ProtectedRoute requireRole="admin"><AdminPlans /></ProtectedRoute>
      </Route>
      <Route path="/admin/broadcast">
        <ProtectedRoute requireRole="admin"><BroadcastPage /></ProtectedRoute>
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute requireRole="admin"><AnalyticsPage /></ProtectedRoute>
      </Route>
      <Route path="/admin/approvals">
        <ProtectedRoute requireRole="admin"><AdminApprovalsPage /></ProtectedRoute>
      </Route>
      <Route path="/admin/transactions">
        <ProtectedRoute requireRole="admin"><AdminTransactionsPage /></ProtectedRoute>
      </Route>

      <Route path="/terms"><TermsPage /></Route>
      <Route path="/privacy"><PrivacyPage /></Route>

      <Route><Redirect to="/" /></Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Suspense fallback={<LoadingScreen />}>
              <AppRoutes />
            </Suspense>
          </WouterRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
