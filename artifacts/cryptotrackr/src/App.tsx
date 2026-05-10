import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/login";
import OnboardingPage from "@/pages/onboarding";
import PortalIndex from "@/pages/portal/index";
import MilestonesPage from "@/pages/portal/milestones";
import CyclePage from "@/pages/portal/cycle";
import RoadmapPage from "@/pages/portal/roadmap";
import ReportsPage from "@/pages/portal/reports";
import NotesPage from "@/pages/portal/notes";
import PlanPage from "@/pages/portal/plan";
import ExitStrategyPage from "@/pages/portal/exit";
import EntryStrategyPage from "@/pages/portal/entry";
import DcaPage from "@/pages/portal/dca";
import WatchlistPage from "@/pages/portal/watchlist";
import BearProtectionPage from "@/pages/portal/bear";
import SettingsPage from "@/pages/portal/settings";
import TradeJournalPage from "@/pages/portal/journal";
import TaxPage from "@/pages/portal/tax";
import AdminDashboard from "@/pages/admin/index";
import AdminClients from "@/pages/admin/clients";
import CycleIntelligence from "@/pages/admin/cycle";
import AdminPlans from "@/pages/admin/plans";
import BroadcastPage from "@/pages/admin/broadcast";
import AnalyticsPage from "@/pages/admin/analytics";

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
  if (requireRole && user.role !== requireRole) return <Redirect to="/" />;
  return <>{children}</>;
}

function RootRoute() {
  const { user, clientProfile, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  if (user) {
    if (user.role === "admin") return <Redirect to="/admin" />;
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

      <Route><Redirect to="/" /></Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
