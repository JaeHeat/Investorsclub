import { useState, useEffect, useCallback } from "react";
import { getCurrentAuthUser, type AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

// Local-demo bypass: when VITE_LOCAL_DEMO is set to "admin" or "client",
// skip the OIDC backend entirely and return a mock user. Never active in a
// real deployment (production uses the Replit OIDC flow via /api/auth/user).
const DEMO_ROLE = (import.meta.env.VITE_LOCAL_DEMO as string | undefined)?.trim();
const DEMO_USER: AuthUser | null =
  DEMO_ROLE === "admin"
    ? { id: "admin-1", email: "admin@cryptotrackr.com", firstName: "Demo", lastName: "Admin", profileImageUrl: null, role: "admin" }
    : DEMO_ROLE === "client"
      ? { id: "client-1", email: "client@cryptotrackr.com", firstName: "Alex", lastName: "Rivera", profileImageUrl: null, role: "client" }
      : null;

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(DEMO_USER);
  const [isLoading, setIsLoading] = useState(!DEMO_USER);

  useEffect(() => {
    if (DEMO_USER) return;
    let cancelled = false;

    // Typed call via the generated API client (@workspace/api-client-react)
    // instead of a hand-rolled fetch — keeps the request shape in sync with
    // the OpenAPI spec.
    getCurrentAuthUser({ credentials: "include" })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    const base = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";
    window.location.href = `/api/login?returnTo=${encodeURIComponent(base)}`;
  }, []);

  const logout = useCallback(() => {
    fetch("/api/logout", { method: "POST", credentials: "include" })
      .then((res) => res.json())
      .then((data: { redirectUrl?: string }) => {
        window.location.href = data.redirectUrl ?? "/";
      })
      .catch(() => {
        window.location.href = "/";
      });
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
