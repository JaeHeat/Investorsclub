import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/login";
import OnboardingPage from "@/pages/onboarding";
import PortalIndex from "@/pages/portal/index";
import MilestonesPage from "@/pages/portal/milestones";
import RoadmapPage from "@/pages/portal/roadmap";
import ReportsPage from "@/pages/portal/reports";
import NotesPage from "@/pages/portal/notes";
import AdminDashboard from "@/pages/admin/index";
import AdminClients from "@/pages/admin/clients";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(0 0% 4%)" }}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(247,147,26,0.3)", borderTopColor: "#F7931A" }}
        />
        <p className="text-xs text-[hsl(0_0%_40%)]">Loading...</p>
      </div>
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
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect to="/" />;

  // Still fetching profile
  if (!profile) return <LoadingScreen />;

  if (requireRole && profile.role !== requireRole) return <Redirect to="/" />;

  return <>{children}</>;
}

function RootRoute() {
  const { user, profile, clientProfile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  // Logged in — redirect based on role
  if (user && profile) {
    if (profile.role === "admin") return <Redirect to="/admin" />;
    if (profile.role === "client") {
      if (!clientProfile?.onboarding_completed) return <Redirect to="/onboarding" />;
      return <Redirect to="/portal" />;
    }
  }

  // User logged in but profile not yet fetched (still loading profile)
  if (user && !profile) return <LoadingScreen />;

  return <LoginPage />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />

      <Route path="/onboarding">
        <ProtectedRoute requireRole="client">
          <OnboardingPage />
        </ProtectedRoute>
      </Route>

      <Route path="/portal">
        <ProtectedRoute requireRole="client">
          <PortalIndex />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/milestones">
        <ProtectedRoute requireRole="client">
          <MilestonesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/roadmap">
        <ProtectedRoute requireRole="client">
          <RoadmapPage />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/reports">
        <ProtectedRoute requireRole="client">
          <ReportsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/notes">
        <ProtectedRoute requireRole="client">
          <NotesPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin">
        <ProtectedRoute requireRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/clients">
        <ProtectedRoute requireRole="admin">
          <AdminClients />
        </ProtectedRoute>
      </Route>

      <Route>
        <Redirect to="/" />
      </Route>
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
