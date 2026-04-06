import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, Profile, ClientProfile } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  clientProfile: ClientProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshClientProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .single();
    setProfile(data as Profile | null);
    return data as Profile | null;
  }

  async function fetchClientProfile(userId: string) {
    const { data } = await supabase
      .from("client_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setClientProfile(data as ClientProfile | null);
    return data as ClientProfile | null;
  }

  async function refreshClientProfile() {
    if (user) {
      await fetchClientProfile(user.id);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        if (p?.role === "client") {
          await fetchClientProfile(session.user.id);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        if (p?.role === "client") {
          await fetchClientProfile(session.user.id);
        }
      } else {
        setProfile(null);
        setClientProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, clientProfile, loading, signIn, signOut, refreshClientProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
