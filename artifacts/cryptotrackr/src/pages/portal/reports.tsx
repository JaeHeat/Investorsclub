import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, Report } from "@/lib/supabase";
import PortalLayout from "@/components/layout/PortalLayout";
import { FileText, ChevronRight } from "lucide-react";

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from("reports")
        .select("*")
        .or(`user_id.eq.${user.id},is_global.eq.true`)
        .order("published_at", { ascending: false })
        .then(({ data }) => {
          if (data) setReports(data as Report[]);
          setLoading(false);
        });
    }
  }, [user]);

  if (selected) {
    return (
      <PortalLayout>
        <button
          onClick={() => setSelected(null)}
          className="text-xs text-[hsl(0_0%_45%)] hover:text-white flex items-center gap-1 mb-6 transition-colors"
          data-testid="button-back-reports"
        >
          ← Back to reports
        </button>
        <div className="rounded-2xl p-7" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-xl font-semibold text-white">{selected.title}</h1>
            <div className="shrink-0 text-right">
              <p className="text-xs text-[hsl(0_0%_40%)]">
                {new Date(selected.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              {selected.is_global && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>
                  Global
                </span>
              )}
            </div>
          </div>
          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-[hsl(0_0%_65%)] leading-relaxed whitespace-pre-wrap">{selected.content}</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Monthly Reports</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">Updates and analysis from your consultant</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "hsl(0 0% 9%)" }} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center justify-center text-center"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        >
          <FileText className="w-8 h-8 text-[hsl(0_0%_30%)] mb-3" />
          <p className="text-sm font-medium text-[hsl(0_0%_55%)]">No reports published yet</p>
          <p className="text-xs text-[hsl(0_0%_35%)] mt-1">Your monthly reports will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelected(report)}
              className="w-full rounded-2xl p-5 flex items-center justify-between gap-4 text-left transition-all hover:border-[hsl(0_0%_18%)]"
              style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
              data-testid={`report-${report.id}`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 shrink-0 text-[hsl(0_0%_40%)]" />
                <div>
                  <p className="text-sm font-medium text-white">{report.title}</p>
                  <p className="text-xs text-[hsl(0_0%_40%)] mt-0.5">
                    {new Date(report.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    {report.is_global && " · Global"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[hsl(0_0%_35%)] shrink-0" />
            </button>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
