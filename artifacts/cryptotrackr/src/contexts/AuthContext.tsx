import { createContext, useContext, useEffect, useState } from "react";
import { useAuth as useReplitAuth } from "@workspace/replit-auth-web";
import type { AuthUser } from "@workspace/replit-auth-web";
import { getClientProfile, upsertClientProfile, trackLastActive, clearAllLocalStore, setHoldings, getHoldings } from "@/lib/localStore";
import { syncProfileToServer, loadProfileFromServer } from "@/lib/profileApi";
import type { ClientProfile } from "@/lib/types";

export type { AuthUser };

interface AuthContextType {
  user: AuthUser | null;
  clientProfile: ClientProfile | null;
  loading: boolean;
  login: () => void;
  signOut: () => void;
  refreshClientProfile: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, login, logout } = useReplitAuth();
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);

  async function loadClientProfile(userId: string, replitUser?: AuthUser | null) {
    trackLastActive(userId);

    // Try to load from server first (real users have server-side data)
    const serverData = await loadProfileFromServer();

    if (serverData?.profile) {
      // Merge server profile into localStorage and state
      const merged: ClientProfile = {
        user_id: userId,
        ...serverData.profile,
      };
      upsertClientProfile(merged);
      if (serverData.holdings.length > 0) {
        setHoldings(userId, serverData.holdings);
      }
      setClientProfile(merged);
      return;
    }

    // Fall back to localStorage (handles demo "client-1" seed data)
    const cp = getClientProfile(userId);
    if (!cp) {
      const name = [replitUser?.firstName, replitUser?.lastName].filter(Boolean).join(" ") || "";
      upsertClientProfile({
        user_id: userId,
        full_name: name,
        country: null,
        timezone: null,
        btc_holdings: null,
        avg_cost_basis: null,
        investment_goal: null,
        risk_tolerance: null,
        time_horizon: null,
        notes: null,
        discord_username: null,
        discord_role_claimed: false,
        goal_conservative: null,
        goal_moderate: null,
        goal_moonshot: null,
        joined_at: null,
        onboarding_completed: false,
        initial_portfolio_value: null,
        high_water_mark: null,
      });
      setClientProfile(getClientProfile(userId));
    } else {
      setClientProfile(cp);
      // Auto-sync to server if the client has completed onboarding but
      // their data isn't on the server yet (e.g. signed up before this migration)
      if (cp.onboarding_completed) {
        const holdings = getHoldings(userId);
        syncProfileToServer(cp, holdings);
      }
    }
  }

  useEffect(() => {
    if (!isLoading && user?.role === "client") {
      loadClientProfile(user.id, user);
    }
    if (!isLoading && !user) {
      setClientProfile(null);
    }
  }, [isLoading, user?.id, user?.role]);

  function refreshClientProfile() {
    if (user?.role === "client") {
      loadClientProfile(user.id);
    }
  }

  function signOut() {
    clearAllLocalStore();
    logout();
  }

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        clientProfile,
        loading: isLoading,
        login,
        signOut,
        refreshClientProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
