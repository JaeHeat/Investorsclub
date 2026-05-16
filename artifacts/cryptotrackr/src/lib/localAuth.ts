import type { UserRole } from "./types";

export interface LocalUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

// Hardcoded users — replace with your real credentials
const USERS: (LocalUser & { password: string })[] = [
  {
    id: "admin-1",
    email: "admin@cryptotrackr.com",
    password: "admin123",
    role: "admin",
    name: "Admin",
  },
  {
    id: "admin-2",
    email: "jaeheat@gmail.com",
    password: "Jae2025!",
    role: "admin",
    name: "Jae",
  },
  {
    id: "client-1",
    email: "client@cryptotrackr.com",
    password: "client123",
    role: "client",
    name: "Demo Client",
  },
];

const SESSION_KEY = "cryptotrackr-session";

export function localSignIn(
  email: string,
  password: string
): { user: LocalUser } | { error: string } {
  const match = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!match) return { error: "Invalid email or password." };
  const { password: _pw, ...user } = match;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { user };
}

export function localSignOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function getLocalSession(): LocalUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}
