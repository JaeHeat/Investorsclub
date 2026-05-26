import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Check, X, UserCheck, Clock, Loader2, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

interface PendingUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: string;
}

function useAdminApprovals() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/pending-users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load pending users");
      const data = await res.json();
      setPendingUsers(data.users ?? []);
    } catch {
      setError("Could not load pending approvals");
    } finally {
      setLoading(false);
    }
  }

  async function approve(userId: string, role: "client" | "admin") {
    const res = await fetch(`/api/admin/users/${userId}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error("Failed to approve user");
    setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
  }

  return { pendingUsers, loading, error, load, approve };
}

export default function AdminApprovalsPage() {
  const { pendingUsers, loading, error, load, approve } = useAdminApprovals();
  const [approving, setApproving] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    load().then(() => setLoaded(true));
  }

  async function handleApprove(userId: string, role: "client" | "admin") {
    setApproving(userId);
    try {
      await approve(userId, role);
    } finally {
      setApproving(null);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "hsl(0 0% 4%)", color: "white" }}
    >
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link href="/admin" className="flex items-center gap-1 text-sm mb-5 transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <ChevronLeft size={14} />
            Back to dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(247,147,26,0.12)", border: "1px solid rgba(247,147,26,0.25)" }}
            >
              <UserCheck size={18} style={{ color: "#F7931A" }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Pending Approvals</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Review and approve new user applications
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin" style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
        )}

        {error && (
          <div
            className="rounded-lg px-4 py-3 text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}
          >
            {error}
          </div>
        )}

        {!loading && !error && pendingUsers.length === 0 && (
          <div
            className="rounded-xl px-6 py-12 text-center"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(247,147,26,0.08)", border: "1px solid rgba(247,147,26,0.2)" }}
            >
              <Clock size={20} style={{ color: "rgba(247,147,26,0.6)" }} />
            </div>
            <p className="text-sm font-medium text-white mb-1">No pending approvals</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              New sign-ups will appear here for review
            </p>
          </div>
        )}

        {!loading && pendingUsers.length > 0 && (
          <div className="space-y-3">
            {pendingUsers.map((u) => {
              const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unknown";
              const joined = new Date(u.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              return (
                <div
                  key={u.id}
                  className="rounded-xl px-5 py-4 flex items-center gap-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  data-testid={`card-pending-user-${u.id}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold"
                    style={{ background: "rgba(247,147,26,0.12)", color: "#F7931A" }}
                  >
                    {(u.firstName?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate" data-testid={`text-pending-name-${u.id}`}>
                      {name}
                    </p>
                    <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {u.email ?? "No email"} · Signed up {joined}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(u.id, "client")}
                      disabled={approving === u.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: "rgba(247,147,26,0.12)", color: "#F7931A", border: "1px solid rgba(247,147,26,0.25)" }}
                      data-testid={`button-approve-${u.id}`}
                    >
                      {approving === u.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprove(u.id, "admin")}
                      disabled={approving === u.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: "rgba(124,107,240,0.1)", color: "#7C6BF0", border: "1px solid rgba(124,107,240,0.25)" }}
                      data-testid={`button-approve-admin-${u.id}`}
                    >
                      <UserCheck size={12} />
                      Admin
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
                      data-testid={`button-deny-${u.id}`}
                      title="Deny (user stays pending)"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
