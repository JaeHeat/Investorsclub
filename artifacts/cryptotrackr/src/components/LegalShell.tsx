import { Link } from "wouter";
import { Bitcoin, ChevronLeft } from "lucide-react";

// Public, readable shell for legal pages (no portal chrome — reachable before login).
export function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "hsl(0 0% 4%)" }}>
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5" style={{ color: "#F7931A" }} />
            <span className="text-sm font-semibold tracking-tight text-white">Bitcoin Daily</span>
          </div>
          <Link href="/" className="inline-flex items-center gap-1 text-xs transition-colors" style={{ color: "hsl(0 0% 45%)" }}>
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-1">{title}</h1>
        <p className="text-xs text-[hsl(0_0%_42%)] mb-8">Last updated: {updated}</p>

        <div className="space-y-6 text-sm leading-relaxed text-[hsl(0_0%_62%)]">{children}</div>

        <div className="mt-10 pt-6 flex items-center gap-4 text-xs" style={{ borderTop: "1px solid hsl(0 0% 12%)" }}>
          <Link href="/terms" className="text-[hsl(0_0%_50%)] hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="text-[hsl(0_0%_50%)] hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-white mb-2">{heading}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
