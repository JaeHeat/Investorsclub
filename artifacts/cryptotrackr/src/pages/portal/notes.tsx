import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPersonalNotes, savePersonalNotes } from "@/lib/localStore";
import PortalLayout from "@/components/layout/PortalLayout";
import { MessageSquare, Save, Check } from "lucide-react";

const NOTES_TS_KEY = (uid: string) => `ct-notes-saved-at-${uid}`;

const MAX_CHARS = 5000;

export default function NotesPage() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(true);
  const [justSaved, setJustSaved] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    document.title = "Notes — Bitcoin Daily";
    return () => { document.title = "Bitcoin Daily"; };
  }, []);

  useEffect(() => {
    if (user) {
      setText(getPersonalNotes(user.id));
      try {
        const ts = localStorage.getItem(NOTES_TS_KEY(user.id));
        if (ts) setLastSavedAt(new Date(ts));
      } catch { /* ignore */ }
    }
  }, [user]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!saved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saved]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    if (value.length > MAX_CHARS) return;
    setText(value);
    setSaved(false);
    setJustSaved(false);
  }

  const handleSave = useCallback(() => {
    if (!user) return;
    savePersonalNotes(user.id, text);
    const now = new Date();
    setLastSavedAt(now);
    try { localStorage.setItem(NOTES_TS_KEY(user.id), now.toISOString()); } catch { /* ignore */ }
    setSaved(true);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [user, text]);

  useEffect(() => {
    if (saved) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 1500);
    return () => clearTimeout(timer);
  }, [text, saved, handleSave]);

  const remaining = MAX_CHARS - text.length;

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5" style={{ color: "#F7931A" }} />
            <h1 className="text-2xl font-semibold text-white">My Notes</h1>
          </div>
          <div className="flex items-center gap-2">
            {!saved && (
              <span className="text-xs text-[hsl(0_0%_40%)]">Unsaved changes</span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: justSaved ? "rgba(16,185,129,0.12)" : "hsl(0 0% 11%)",
                color: justSaved ? "#10b981" : "hsl(0 0% 65%)",
                border: `1px solid ${justSaved ? "rgba(16,185,129,0.25)" : "hsl(0 0% 18%)"}`,
              }}
            >
              {justSaved ? <><Check className="w-3 h-3" /> Saved</> : <><Save className="w-3 h-3" /> Save</>}
            </button>
          </div>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">Your private scratch pad — only you can see this.</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
        <textarea
          value={text}
          onChange={handleChange}
          placeholder={"Start writing your thoughts, targets, or reminders here...\n\nIdeas: upcoming sell levels, personal price targets, questions to ask your consultant, cycle notes."}
          data-testid="notes-textarea"
          className="w-full px-5 py-5 text-sm text-white leading-relaxed bg-transparent outline-none resize-none placeholder-[hsl(0,0%,28%)]"
          style={{ minHeight: "320px" }}
          rows={16}
          spellCheck
        />
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid hsl(0 0% 11%)" }}
        >
          <p className="text-xs text-[hsl(0_0%_32%)]">
            {lastSavedAt
              ? `Last edited ${lastSavedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${lastSavedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
              : "Auto-saved as you type"}
          </p>
          <p
            className="text-xs tabular-nums"
            style={{ color: remaining < 500 ? (remaining < 100 ? "#ef4444" : "#F7931A") : "hsl(0 0% 32%)" }}
          >
            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </p>
        </div>
      </div>
    </PortalLayout>
  );
}
