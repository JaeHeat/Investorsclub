import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRoadmapItems } from "@/lib/localStore";
import type { RoadmapItem } from "@/lib/types";
import PortalLayout from "@/components/layout/PortalLayout";
import { Map } from "lucide-react";

export default function RoadmapPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<RoadmapItem[]>([]);

  useEffect(() => {
    if (user) {
      setItems(getRoadmapItems(user.id));
    }
  }, [user]);

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Roadmap</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">Cycle targets and stage notes from your consultant</p>
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
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl p-5"
              style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
              data-testid={`roadmap-item-${item.id}`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <span className="text-xs text-[hsl(0_0%_35%)] shrink-0">
                  {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] leading-relaxed whitespace-pre-wrap">{item.content}</p>
              {!item.user_id && (
                <span
                  className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}
                >
                  Global
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
