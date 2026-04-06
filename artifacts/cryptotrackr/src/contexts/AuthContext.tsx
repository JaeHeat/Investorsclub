import { createContext, useContext, useEffect, useState, useRef } from "react";
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
  const initialized = useRef(false);

  async function fetchProfile(userId: string, userMeta?: Record<string, unknown>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("fetchProfile error:", error.message);

      // Fallback: read role from user metadata (app_metadata or user_metadata)
      const metaRole =
        (userMeta?.role as string) ??
        (userMeta?.app_metadata as Record<string, string> | undefined)?.role;

      if (metaRole === "admin" || metaRole === "client") {
        const fallback: Profile = { id: userId, role: metaRole as "admin" | "client" };
        setProfile(fallback);
        return fallback;
      }

      // Surface the error so the user knows what to fix
      console.error(
        "CryptoTrackr: Could not read the 'profiles' table. " +
        "Check that your Supabase RLS policy on 'profiles' is not recursive. " +
        "Recommended fix: CREATE POLICY \"own\" ON profiles FOR SELECT USING (auth.uid() = id);"
      );
      return null;
    }

    setProfile(data as Profile);
    return data as Profile;
  }

  async function fetchClientProfile(userId: string): Promise<ClientProfile | null> {
    const { data, error } = await supabase
      .from("client_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error && error.code !== "PGRST116") {
      console.error("fetchClientProfile error:", error.message);
    }
    setClientProfile((data as ClientProfile) ?? null);
    return (data as ClientProfile) ?? null;
  }

  async function loadUserData(sessionUser: User) {
    // Pass user_metadata as fallback in case profiles table RLS is misconfigured
    const meta = {
      ...(sessionUser.user_metadata ?? {}),
      app_metadata: sessionUser.app_metadata,
    };
    const p = await fetchProfile(sessionUser.id, meta);
    if (p?.role === "client") {
      await fetchClientProfile(sessionUser.id);
    }
  }

  async function refreshClientProfile() {
    if (user) {
      await fetchClientProfile(user.id);
    }
  }

  useEffect(() => {
    // Use onAuthStateChange as the single source of truth.
    // It fires with the current session immediately upon subscription.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserData(session.user);
        } else {
          setProfile(null);
          setClientProfile(null);
        }

        // Only mark loading as done after first event
        if (!initialized.current) {
          initialized.current = true;
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    );

    // Fallback: if onAuthStateChange hasn't fired within 3s, stop loading
    const fallback = setTimeout(() => {
      if (!initialized.current) {
        initialized.current = true;
        setLoading(false);
      }
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }

  async function signOut() {
    setProfile(null);
    setClientProfile(null);
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{ user, session, profile, clientProfile, loading, signIn, signOut, refreshClientProfile }}
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
