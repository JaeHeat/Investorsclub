import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPersonalNotes, savePersonalNotes } from "@/lib/localStore";
import PortalLayout from "@/components/layout/PortalLayout";
import { MessageSquare, Save, Check } from "lucide-react";

const MAX_CHARS = 2000;

export default function NotesPage() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    document.title = "Notes — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  useEffect(() => {
    if (user) {
      setText(getPersonalNotes(user.id));
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
        {text.length === 0 && (
          <div className="px-5 pt-5 pb-2 pointer-events-none select-none">
            <p className="text-sm text-[hsl(0_0%_30%)] leading-relaxed">
              Start writing your thoughts, targets, or reminders here...
              {"\n\n"}Ideas: upcoming sell levels, personal price targets, questions to ask your consultant, cycle notes.
            </p>
          </div>
        )}
        <textarea
          value={text}
          onChange={handleChange}
          placeholder=""
          data-testid="notes-textarea"
          className="w-full px-5 py-5 text-sm text-white leading-relaxed bg-transparent outline-none resize-none"
          style={{
            minHeight: text.length === 0 ? "0px" : "320px",
            height: text.length === 0 ? "0px" : "auto",
            position: text.length === 0 ? "absolute" : "relative",
            opacity: text.length === 0 ? 0 : 1,
          }}
          rows={16}
          spellCheck
        />
        {text.length === 0 && (
          <textarea
            value={text}
            onChange={handleChange}
            placeholder=""
            data-testid="notes-textarea-visible"
            className="w-full px-5 pb-5 text-sm text-white leading-relaxed bg-transparent outline-none resize-none"
            style={{ minHeight: "240px" }}
            rows={12}
            spellCheck
          />
        )}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid hsl(0 0% 11%)" }}
        >
          <p className="text-xs text-[hsl(0_0%_32%)]">
            Auto-saved as you type
          </p>
          <p
            className="text-xs tabular-nums"
            style={{ color: remaining < 100 ? "#F7931A" : "hsl(0 0% 32%)" }}
          >
            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </p>
        </div>
      </div>
    </PortalLayout>
  );
}
