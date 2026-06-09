import type { ClientProfile, HoldingAsset } from "./types";
import { getAllClientProfiles, getHoldings } from "./localStore";

export interface ServerProfileData {
  profile: Omit<ClientProfile, "user_id"> | null;
  holdings: HoldingAsset[];
}

export interface AdminClientData {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  profile: Omit<ClientProfile, "user_id"> | null;
  holdings: HoldingAsset[];
}

export async function syncProfileToServer(
  profile: ClientProfile,
  holdings: HoldingAsset[],
): Promise<void> {
  try {
    const { user_id: _userId, ...profileData } = profile;
    await fetch("/api/clients/me/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ profile: profileData, holdings }),
    });
  } catch {
    // silent — localStorage is still the source for the client's own view
  }
}

export async function loadProfileFromServer(): Promise<ServerProfileData | null> {
  try {
    const res = await fetch("/api/clients/me/profile", {
      credentials: "include",
    });
    if (!res.ok) return null;
    return (await res.json()) as ServerProfileData;
  } catch {
    return null;
  }
}

// Map locally-stored client profiles into the admin API shape so the admin
// dashboard renders the same clients the portal sees.
function clientsFromLocalStore(): AdminClientData[] {
  return getAllClientProfiles().map((p) => {
    const { user_id, full_name, ...rest } = p;
    const [firstName = null, ...lastParts] = (full_name ?? "").split(" ");
    return {
      id: user_id,
      email: null,
      firstName: firstName || null,
      lastName: lastParts.length ? lastParts.join(" ") : null,
      profileImageUrl: null,
      createdAt: p.joined_at ?? new Date(0).toISOString(),
      profile: { full_name, ...rest },
      holdings: getHoldings(user_id),
    };
  });
}

export async function loadClientsFromServer(): Promise<AdminClientData[]> {
  try {
    const res = await fetch("/api/clients", { credentials: "include" });
    // Server is the source of truth when reachable (an empty list is a valid
    // answer — don't mask it with local demo data).
    if (res.ok) {
      const data = (await res.json()) as { clients: AdminClientData[] };
      return data.clients ?? [];
    }
  } catch {
    // fall through to the local fallback below
  }
  // No backend reachable (e.g. local dev without the API server): surface the
  // clients held in localStorage so the admin views aren't blank.
  return clientsFromLocalStore();
}
