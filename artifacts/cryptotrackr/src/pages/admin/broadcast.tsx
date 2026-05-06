import { useState, useEffect } from "react";
import { getBroadcasts, addBroadcast, deleteBroadcast } from "@/lib/localStore";
import type { Broadcast } from "@/lib/types";
import AdminLayout from "@/components/layout/AdminLayout";
import { Radio, Plus, Trash2, CheckCircle2, Clock, Eye, EyeOff, AlertTriangle } from "lucide-react";

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

function DeleteConfirmDialog({
  broadcast,
  onConfirm,
  onCancel,
}: {
  broadcast: Broadcast;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 16%)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Delete broadcast?</p>
            <p className="text-xs text-[hsl(0_0%_45%)] mt-0.5">This cannot be undone.</p>
          </div>
        </div>
        <div className="mb-5 px-3 py-2.5 rounded-xl" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-xs font-semibold text-white line-clamp-1">{broadcast.title}</p>
          {broadcast.phase_tag && (
            <p className="text-[10px] text-[hsl(0_0%_40%)] mt-0.5">{broadcast.phase_tag}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[hsl(0_0%_65%)] transition-colors"
            style={{ background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 18%)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.35)" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [phaseTag, setPhaseTag] = useState("General Update");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Broadcast | null>(null);

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
    setShowPreview(false);
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  function handleDelete(broadcast: Broadcast) {
    setDeleteTarget(broadcast);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteBroadcast(deleteTarget.id);
    setBroadcasts(getBroadcasts());
    setDeleteTarget(null);
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-[hsl(0,0%,9%)] border border-[hsl(0,0%,16%)] outline-none focus:border-[#F7931A] transition-colors";

  return (
    <AdminLayout>
      {deleteTarget && (
        <DeleteConfirmDialog
          broadcast={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

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
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)]">New broadcast</p>
          {(title.trim() || content.trim()) && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: showPreview ? "#F7931A" : "hsl(0 0% 50%)" }}
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPreview ? "Hide preview" : "Preview"}
            </button>
          )}
        </div>

        {showPreview && (title.trim() || content.trim()) ? (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(0_0%_30%)] mb-2">Client preview</p>
            <div
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "rgba(247,147,26,0.06)", border: "1px solid rgba(247,147,26,0.18)" }}
            >
              <Radio className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F7931A" }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {phaseTag && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(247,147,26,0.12)", color: "#F7931A" }}>
                      {phaseTag}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-white">{title || <span className="text-[hsl(0_0%_35%)]">Untitled broadcast</span>}</p>
                </div>
                <p className="text-xs text-[hsl(0_0%_50%)] leading-relaxed line-clamp-3">{content || <span className="text-[hsl(0_0%_35%)]">No content yet...</span>}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}

        <div className="flex gap-2">
          {showPreview && (
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "hsl(0 0% 11%)", color: "hsl(0 0% 65%)", border: "1px solid hsl(0 0% 16%)" }}
            >
              Edit
            </button>
          )}
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
              <><Radio className="w-4 h-4" /> Publish broadcast</>
            )}
          </button>
        </div>
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
                  onClick={() => handleDelete(b)}
                  className="shrink-0 p-1.5 rounded-lg text-[hsl(0_0%_35%)] hover:text-[#ef4444] hover:bg-[hsl(0,0%,11%)] transition-colors"
                  title="Delete broadcast"
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
