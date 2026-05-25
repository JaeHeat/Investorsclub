import type { ClientProfile, HoldingAsset } from "./types";

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

export async function loadClientsFromServer(): Promise<AdminClientData[]> {
  try {
    const res = await fetch("/api/clients", { credentials: "include" });
    if (!res.ok) return [];
    const data = (await res.json()) as { clients: AdminClientData[] };
    return data.clients ?? [];
  } catch {
    return [];
  }
}
