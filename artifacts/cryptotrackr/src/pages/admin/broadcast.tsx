import { useState, useEffect } from "react";
import {
  getBroadcasts, addBroadcast, deleteBroadcast,
  getScheduledBroadcasts, saveScheduledBroadcast, deleteScheduledBroadcast, publishScheduledBroadcast,
} from "@/lib/localStore";
import type { Broadcast } from "@/lib/types";
import AdminLayout from "@/components/layout/AdminLayout";
import { Radio, Plus, Trash2, CheckCircle2, Clock, Eye, EyeOff, AlertTriangle, CalendarClock, Send, FileEdit, X } from "lucide-react";

type ScheduledBroadcast = Broadcast & { scheduled_for: string | null; status: "draft" | "scheduled" | "published" };

const PHASE_TAGS = [
  "General Update", "Bull Market Watch", "Bear Market Watch",
  "Portfolio Action", "Cycle Alert", "Rebalancing", "Exit Strategy",
];

const MODE_OPTIONS = [
  { value: "publish",  label: "Publish now",       icon: Send,         desc: "Goes live immediately to all clients" },
  { value: "schedule", label: "Schedule",           icon: CalendarClock, desc: "Auto-publishes on your next visit after the set time" },
  { value: "draft",    label: "Save as draft",      icon: FileEdit,     desc: "Save for later, not visible to clients" },
] as const;

type Mode = typeof MODE_OPTIONS[number]["value"];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

function DeleteConfirmDialog({ broadcast, onConfirm, onCancel }: { broadcast: Broadcast; onConfirm: () => void; onCancel: () => void }) {
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
          {broadcast.phase_tag && <p className="text-[10px] text-[hsl(0_0%_40%)] mt-0.5">{broadcast.phase_tag}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[hsl(0_0%_65%)]" style={{ background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 18%)" }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.35)" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledBroadcast[]>([]);
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [phaseTag, setPhaseTag] = useState("General Update");
  const [mode, setMode] = useState<Mode>("publish");
  const [scheduledFor, setScheduledFor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Broadcast | null>(null);
  const [scheduledDeleteTarget, setScheduledDeleteTarget] = useState<ScheduledBroadcast | null>(null);
  const [activeTab, setActiveTab] = useState<"compose" | "drafts">("compose");
  const [autoPublishedCount, setAutoPublishedCount] = useState(0);

  useEffect(() => {
    // Auto-publish any scheduled broadcasts whose time has passed
    const now = new Date();
    const pending = getScheduledBroadcasts();
    let anyPublished = false;
    for (const b of pending) {
      if (b.status === "scheduled" && b.scheduled_for && new Date(b.scheduled_for) <= now) {
        publishScheduledBroadcast(b.id);
        anyPublished = true;
      }
    }
    if (anyPublished) {
      setAutoPublishedCount((c) => c + 1);
    }
    setBroadcasts(getBroadcasts());
    setScheduled(getScheduledBroadcasts());
  }, []);

  // Default scheduled_for to 1 day from now
  useEffect(() => {
    if (!scheduledFor) {
      const tomorrow = new Date(Date.now() + 86400000);
      tomorrow.setSeconds(0, 0);
      setScheduledFor(tomorrow.toISOString().slice(0, 16));
    }
  }, []);

  function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);

    if (mode === "publish") {
      addBroadcast({ title: title.trim(), content: content.trim(), phase_tag: phaseTag });
      setBroadcasts(getBroadcasts());
    } else {
      saveScheduledBroadcast({
        title: title.trim(),
        content: content.trim(),
        phase_tag: phaseTag,
        scheduled_for: mode === "schedule" ? scheduledFor : null,
        status: mode === "schedule" ? "scheduled" : "draft",
      });
      setScheduled(getScheduledBroadcasts());
    }

    setTitle("");
    setContent("");
    setPhaseTag("General Update");
    setShowPreview(false);
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    if (mode !== "publish") setActiveTab("drafts");
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

  function handlePublishScheduled(id: string) {
    publishScheduledBroadcast(id);
    setBroadcasts(getBroadcasts());
    setScheduled(getScheduledBroadcasts());
  }

  function handleDeleteScheduled(broadcast: ScheduledBroadcast) {
    setScheduledDeleteTarget(broadcast);
  }

  function confirmDeleteScheduled() {
    if (!scheduledDeleteTarget) return;
    deleteScheduledBroadcast(scheduledDeleteTarget.id);
    setScheduled(getScheduledBroadcasts());
    setScheduledDeleteTarget(null);
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-[hsl(0,0%,9%)] border border-[hsl(0,0%,16%)] outline-none focus:border-[#F7931A] transition-colors";

  const draftsAndScheduled = scheduled.filter((s) => s.status !== "published");

  return (
    <AdminLayout>
      {deleteTarget && (
        <DeleteConfirmDialog broadcast={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
      )}
      {scheduledDeleteTarget && (
        <DeleteConfirmDialog broadcast={scheduledDeleteTarget} onConfirm={confirmDeleteScheduled} onCancel={() => setScheduledDeleteTarget(null)} />
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Radio className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Cycle Broadcasts</h1>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "hsl(0 0% 12%)", color: "hsl(0 0% 55%)" }}>
            {broadcasts.length} published
          </span>
          {draftsAndScheduled.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}>
              {draftsAndScheduled.length} queued
            </span>
          )}
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">
          Post cycle updates visible to all clients. Schedule them in advance or save as drafts.
        </p>
      </div>

      {autoPublishedCount > 0 && (
        <div
          className="rounded-xl px-4 py-3 mb-5 flex items-center gap-3"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
          <p className="text-sm text-[#10b981]">
            {autoPublishedCount} scheduled broadcast{autoPublishedCount > 1 ? "s were" : " was"} automatically published on page load.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "hsl(0 0% 9%)" }}>
        {(["compose", "drafts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
            style={{
              background: activeTab === tab ? "hsl(0 0% 14%)" : "transparent",
              color: activeTab === tab ? "white" : "hsl(0 0% 45%)",
            }}
          >
            {tab === "drafts" ? `Drafts & Scheduled${draftsAndScheduled.length > 0 ? ` (${draftsAndScheduled.length})` : ""}` : "Compose"}
          </button>
        ))}
      </div>

      {activeTab === "compose" && (
        <>
          {/* Compose */}
          <div className="rounded-2xl p-5 mb-8 space-y-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
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
                <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(247,147,26,0.06)", border: "1px solid rgba(247,147,26,0.18)" }}>
                  <Radio className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#F7931A" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {phaseTag && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(247,147,26,0.12)", color: "#F7931A" }}>{phaseTag}</span>}
                      <p className="text-sm font-semibold text-white">{title || <span className="text-[hsl(0_0%_35%)]">Untitled</span>}</p>
                    </div>
                    <p className="text-xs text-[hsl(0_0%_50%)] leading-relaxed line-clamp-3">{content || <span className="text-[hsl(0_0%_35%)]">No content…</span>}</p>
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
                  <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cycle Update: BTC approaching resistance..." />
                </div>
                <div>
                  <label className="block text-xs text-[hsl(0_0%_45%)] mb-1.5">Content</label>
                  <textarea className={`${inputClass} resize-none`} rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your market update or action item here..." />
                </div>
              </>
            )}

            {/* Delivery mode */}
            <div>
              <label className="block text-xs text-[hsl(0_0%_45%)] mb-2">Delivery</label>
              <div className="grid grid-cols-3 gap-2">
                {MODE_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    onClick={() => setMode(value)}
                    className="rounded-xl px-3 py-2.5 text-left transition-all"
                    style={{
                      background: mode === value ? "rgba(247,147,26,0.08)" : "hsl(0 0% 10%)",
                      border: mode === value ? "1px solid rgba(247,147,26,0.35)" : "1px solid hsl(0 0% 16%)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5" style={{ color: mode === value ? "#F7931A" : "hsl(0 0% 45%)" }} />
                      <p className="text-xs font-semibold" style={{ color: mode === value ? "#F7931A" : "white" }}>{label}</p>
                    </div>
                    <p className="text-[10px] text-[hsl(0_0%_38%)] leading-tight">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule datetime picker */}
            {mode === "schedule" && (
              <div>
                <label className="block text-xs text-[hsl(0_0%_45%)] mb-1.5">Publish at</label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                {scheduledFor && (
                  <p className="text-[11px] text-[hsl(0_0%_38%)] mt-1.5">
                    Will publish: {new Date(scheduledFor).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {showPreview && (
                <button onClick={() => setShowPreview(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ background: "hsl(0 0% 11%)", color: "hsl(0 0% 65%)", border: "1px solid hsl(0 0% 16%)" }}>Edit</button>
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
                  <><CheckCircle2 className="w-4 h-4" /> {mode === "publish" ? "Published" : mode === "schedule" ? "Scheduled" : "Saved"}</>
                ) : (
                  <>
                    {mode === "publish" && <><Radio className="w-4 h-4" /> Publish now</>}
                    {mode === "schedule" && <><CalendarClock className="w-4 h-4" /> Schedule</>}
                    {mode === "draft"   && <><FileEdit className="w-4 h-4" /> Save draft</>}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Published broadcasts */}
          {broadcasts.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
              <Radio className="w-8 h-8 mx-auto mb-3 text-[hsl(0_0%_22%)]" />
              <p className="text-sm text-[hsl(0_0%_40%)]">No published broadcasts yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <div key={b.id} className="rounded-2xl p-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {b.phase_tag && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(247,147,26,0.12)", color: "#F7931A" }}>{b.phase_tag}</span>}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[hsl(0_0%_35%)]" />
                          <span className="text-[10px] text-[hsl(0_0%_35%)]">{timeAgo(b.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white">{b.title}</p>
                    </div>
                    <button onClick={() => handleDelete(b)} className="shrink-0 p-1.5 rounded-lg text-[hsl(0_0%_35%)] hover:text-[#ef4444] hover:bg-[hsl(0,0%,11%)] transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[hsl(0_0%_45%)] leading-relaxed line-clamp-3">{b.content}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "drafts" && (
        <div>
          {draftsAndScheduled.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
              <CalendarClock className="w-8 h-8 mx-auto mb-3 text-[hsl(0_0%_22%)]" />
              <p className="text-sm text-[hsl(0_0%_40%)]">No drafts or scheduled broadcasts yet.</p>
              <button onClick={() => setActiveTab("compose")} className="mt-3 text-xs font-semibold" style={{ color: "#F7931A" }}>
                Compose one →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {draftsAndScheduled.map((b) => (
                <div key={b.id} className="rounded-2xl p-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {b.phase_tag && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(247,147,26,0.12)", color: "#F7931A" }}>{b.phase_tag}</span>}
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                          style={{
                            background: b.status === "scheduled" ? "rgba(6,182,212,0.1)" : "hsl(0 0% 14%)",
                            color: b.status === "scheduled" ? "#06b6d4" : "hsl(0 0% 45%)",
                          }}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">{b.title}</p>
                      {b.scheduled_for && (
                        <p className="text-xs text-[hsl(0_0%_40%)] mt-0.5 flex items-center gap-1">
                          <CalendarClock className="w-3 h-3" />
                          {new Date(b.scheduled_for).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handlePublishScheduled(b.id)}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                        style={{ background: "#F7931A", color: "#000" }}
                        title="Publish now"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Publish
                      </button>
                      <button onClick={() => handleDeleteScheduled(b)} className="p-1.5 rounded-lg text-[hsl(0_0%_35%)] hover:text-[#ef4444] transition-colors" title="Delete">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[hsl(0_0%_45%)] leading-relaxed line-clamp-2">{b.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
