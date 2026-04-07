import { useState, useEffect } from "react";
import { getBroadcasts, addBroadcast, deleteBroadcast } from "@/lib/localStore";
import type { Broadcast } from "@/lib/types";
import AdminLayout from "@/components/layout/AdminLayout";
import { Radio, Plus, Trash2, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const PHASE_TAGS = [
  "General Update",
  "Bull Market Watch",
  "Bear Market Watch",
  "Portfolio Action",
  "Cycle Alert",
  "Rebalancing",
  "Exit Strategy",
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [phaseTag, setPhaseTag] = useState("General Update");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    setBroadcasts(getBroadcasts());
  }, []);

  function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    addBroadcast({ title: title.trim(), content: content.trim(), phase_tag: phaseTag });
    setBroadcasts(getBroadcasts());
    setTitle("");
    setContent("");
    setPhaseTag("General Update");
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  function handleDelete(id: string) {
    deleteBroadcast(id);
    setBroadcasts(getBroadcasts());
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-[hsl(0,0%,9%)] border border-[hsl(0,0%,16%)] outline-none focus:border-[#F7931A] transition-colors";

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Radio className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Cycle Broadcasts</h1>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "hsl(0 0% 12%)", color: "hsl(0 0% 55%)" }}
          >
            {broadcasts.length} published
          </span>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Post cycle updates visible to all clients at the top of their portal.
        </p>
      </div>

      {/* Compose */}
      <div
        className="rounded-2xl p-5 mb-8 space-y-4"
        style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)]">New broadcast</p>

        <div>
          <label className="block text-xs text-[hsl(0_0%_45%)] mb-1.5">Phase tag</label>
          <select className={inputClass} value={phaseTag} onChange={(e) => setPhaseTag(e.target.value)}>
            {PHASE_TAGS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-[hsl(0_0%_45%)] mb-1.5">Title</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cycle Update: BTC approaching resistance..."
          />
        </div>

        <div>
          <label className="block text-xs text-[hsl(0_0%_45%)] mb-1.5">Content</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your market update or action item here..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || submitting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: success ? "rgba(16,185,129,0.15)" : "#F7931A",
            color: success ? "#10b981" : "#000",
            opacity: !title.trim() || !content.trim() ? 0.5 : 1,
          }}
        >
          {success ? (
            <><CheckCircle2 className="w-4 h-4" /> Published</>
          ) : (
            <><Plus className="w-4 h-4" /> Publish broadcast</>
          )}
        </button>
      </div>

      {/* Existing broadcasts */}
      {broadcasts.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        >
          <Radio className="w-8 h-8 mx-auto mb-3 text-[hsl(0_0%_22%)]" />
          <p className="text-sm text-[hsl(0_0%_40%)]">No broadcasts yet. Publish one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl p-4"
              style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {b.phase_tag && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(247,147,26,0.12)", color: "#F7931A" }}
                      >
                        {b.phase_tag}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[hsl(0_0%_35%)]" />
                      <span className="text-[10px] text-[hsl(0_0%_35%)]">{timeAgo(b.created_at)}</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-white">{b.title}</p>
                </div>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="shrink-0 p-1.5 rounded-lg text-[hsl(0_0%_35%)] hover:text-[#ef4444] hover:bg-[hsl(0,0%,11%)] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[hsl(0_0%_45%)] leading-relaxed line-clamp-3">{b.content}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
