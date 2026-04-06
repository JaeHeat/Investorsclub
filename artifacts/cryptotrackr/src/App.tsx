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
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#F7931A", borderTopColor: "transparent" }} />
        <p className="text-xs text-[hsl(0_0%_40%)]">Loading...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, profile, clientProfile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Switch>
      <Route path="/">
        {!user ? (
          <LoginPage />
        ) : profile?.role === "admin" ? (
          <Redirect to="/admin" />
        ) : profile?.role === "client" && clientProfile?.onboarding_completed === false ? (
          <Redirect to="/onboarding" />
        ) : profile?.role === "client" ? (
          <Redirect to="/portal" />
        ) : (
          <LoginPage />
        )}
      </Route>

      <Route path="/onboarding">
        {!user ? <Redirect to="/" /> : <OnboardingPage />}
      </Route>

      <Route path="/portal">
        {!user ? <Redirect to="/" /> : profile?.role !== "client" ? <Redirect to="/" /> : <PortalIndex />}
      </Route>
      <Route path="/portal/milestones">
        {!user ? <Redirect to="/" /> : profile?.role !== "client" ? <Redirect to="/" /> : <MilestonesPage />}
      </Route>
      <Route path="/portal/roadmap">
        {!user ? <Redirect to="/" /> : profile?.role !== "client" ? <Redirect to="/" /> : <RoadmapPage />}
      </Route>
      <Route path="/portal/reports">
        {!user ? <Redirect to="/" /> : profile?.role !== "client" ? <Redirect to="/" /> : <ReportsPage />}
      </Route>
      <Route path="/portal/notes">
        {!user ? <Redirect to="/" /> : profile?.role !== "client" ? <Redirect to="/" /> : <NotesPage />}
      </Route>

      <Route path="/admin">
        {!user ? <Redirect to="/" /> : profile?.role !== "admin" ? <Redirect to="/" /> : <AdminDashboard />}
      </Route>
      <Route path="/admin/clients">
        {!user ? <Redirect to="/" /> : profile?.role !== "admin" ? <Redirect to="/" /> : <AdminClients />}
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
