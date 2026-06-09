import { useLocation } from "wouter";
import { Bitcoin, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "hsl(0 0% 4%)" }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Bitcoin className="w-6 h-6" style={{ color: "#F7931A" }} />
          <span className="text-base font-semibold text-white tracking-tight">Bitcoin Daily</span>
        </div>

        <p className="text-6xl font-bold mb-4" style={{ color: "#F7931A" }}>404</p>
        <h1 className="text-xl font-semibold text-white mb-2">Page not found</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "#F7931A", color: "#0A0A0A" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to portal
        </button>
      </div>
    </div>
  );
}
