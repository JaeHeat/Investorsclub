import { createContext, useContext, useEffect, useState } from "react";
import { localSignIn, localSignOut, getLocalSession, type LocalUser } from "@/lib/localAuth";
import { getClientProfile, upsertClientProfile } from "@/lib/localStore";
import type { ClientProfile } from "@/lib/types";

interface AuthContextType {
  user: LocalUser | null;
  clientProfile: ClientProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  refreshClientProfile: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  function loadClientProfile(userId: string) {
    const cp = getClientProfile(userId);
    setClientProfile(cp);
    return cp;
  }

  useEffect(() => {
    const session = getLocalSession();
    if (session) {
      setUser(session);
      if (session.role === "client") {
        loadClientProfile(session.id);
      }
    }
    setLoading(false);
  }, []);

  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    const result = localSignIn(email, password);
    if ("error" in result) {
      return { error: result.error };
    }
    setUser(result.user);
    if (result.user.role === "client") {
      loadClientProfile(result.user.id);
    }
    return { error: null };
  }

  function signOut() {
    localSignOut();
    setUser(null);
    setClientProfile(null);
  }

  function refreshClientProfile() {
    if (user?.role === "client") {
      loadClientProfile(user.id);
    }
  }

  return (
    <AuthContext.Provider value={{ user, clientProfile, loading, signIn, signOut, refreshClientProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
