import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRoadmapItems } from "@/lib/localStore";
import type { RoadmapItem } from "@/lib/types";
import PortalLayout from "@/components/layout/PortalLayout";
import { Map, Globe, User } from "lucide-react";

const NEW_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

function isNew(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < NEW_THRESHOLD_MS;
}

function RoadmapCard({ item }: { item: RoadmapItem }) {
  const fresh = isNew(item.created_at);
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: item.user_id ? "rgba(247,147,26,0.04)" : "hsl(0 0% 7%)",
        border: item.user_id ? "1px solid rgba(247,147,26,0.18)" : "1px solid hsl(0 0% 13%)",
      }}
      data-testid={`roadmap-item-${item.id}`}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">{item.title}</h3>
          {fresh && (
            <span
              className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: "rgba(247,147,26,0.12)", color: "#F7931A" }}
            >
              NEW
            </span>
          )}
        </div>
        <span className="text-xs text-[hsl(0_0%_35%)] shrink-0">
          {new Date(item.created_at).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          })}
        </span>
      </div>
      <p className="text-sm text-[hsl(0_0%_55%)] leading-relaxed whitespace-pre-wrap">
        {item.content}
      </p>
    </div>
  );
}

export default function RoadmapPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<RoadmapItem[]>([]);

  useEffect(() => {
    document.title = "Roadmap — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  useEffect(() => {
    if (user) {
      setItems(getRoadmapItems(user.id));
    }
  }, [user]);

  const globalItems = items.filter((i) => i.user_id === null);
  const personalItems = items.filter((i) => i.user_id !== null);

  const newCount = items.filter((i) => isNew(i.created_at)).length;

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-white">Roadmap</h1>
          {newCount > 0 && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}
            >
              {newCount} new
            </span>
          )}
        </div>
        <p className="text-sm text-[hsl(0_0%_45%)]">
          Cycle targets and stage notes from your consultant
        </p>
      </div>

      {items.length === 0 ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center justify-center text-center"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        >
          <Map className="w-8 h-8 text-[hsl(0_0%_30%)] mb-3" />
          <p className="text-sm font-medium text-[hsl(0_0%_55%)]">No roadmap items yet</p>
          <p className="text-xs text-[hsl(0_0%_35%)] mt-1">Your consultant will add cycle targets here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Personal items first */}
          {personalItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-3.5 h-3.5" style={{ color: "#F7931A" }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#F7931A" }}>
                  Personal — for you
                </p>
              </div>
              <div className="space-y-3">
                {personalItems.map((item) => (
                  <RoadmapCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Global announcements */}
          {globalItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-3.5 h-3.5 text-[hsl(0_0%_40%)]" />
                <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_40%)]">
                  Cycle announcements — all clients
                </p>
              </div>
              <div className="space-y-3">
                {globalItems.map((item) => (
                  <RoadmapCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
