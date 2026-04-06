import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRoadmapItems } from "@/lib/localStore";
import type { RoadmapItem } from "@/lib/types";
import PortalLayout from "@/components/layout/PortalLayout";
import { MessageSquare } from "lucide-react";

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<RoadmapItem[]>([]);

  useEffect(() => {
    if (user) {
      setNotes(getRoadmapItems(user.id));
    }
  }, [user]);

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Notes</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">Updates and messages from your consultant</p>
      </div>

      {notes.length === 0 ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center justify-center text-center"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        >
          <MessageSquare className="w-8 h-8 text-[hsl(0_0%_30%)] mb-3" />
          <p className="text-sm font-medium text-[hsl(0_0%_55%)]">No notes yet</p>
          <p className="text-xs text-[hsl(0_0%_35%)] mt-1">Your consultant's updates will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl p-5"
              style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
              data-testid={`note-${note.id}`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-semibold text-white">{note.title}</h3>
                <span className="text-xs text-[hsl(0_0%_35%)] shrink-0">
                  {new Date(note.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] leading-relaxed whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
