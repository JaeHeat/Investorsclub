import { createContext, useContext, useEffect, useState } from "react";
import { useAuth as useReplitAuth } from "@workspace/replit-auth-web";
import type { AuthUser } from "@workspace/replit-auth-web";
import { getClientProfile, upsertClientProfile } from "@/lib/localStore";
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

  function loadClientProfile(userId: string, replitUser?: AuthUser | null) {
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
        onboarding_completed: false,
        initial_portfolio_value: null,
        high_water_mark: null,
      });
      setClientProfile(getClientProfile(userId));
    } else {
      setClientProfile(cp);
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

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        clientProfile,
        loading: isLoading,
        login,
        signOut: logout,
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
