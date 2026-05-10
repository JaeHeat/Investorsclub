import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getReports, getReadReports, markReportRead } from "@/lib/localStore";
import type { Report } from "@/lib/types";
import PortalLayout from "@/components/layout/PortalLayout";
import { FileText, ChevronRight, ChevronLeft, Newspaper } from "lucide-react";

function isNew(report: Report, readIds: Set<string>) {
  if (readIds.has(report.id)) return false;
  const ageDays = (Date.now() - new Date(report.published_at).getTime()) / 86400000;
  return ageDays <= 7;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Report | null>(null);

  useEffect(() => {
    document.title = "Reports — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  useEffect(() => {
    if (user) {
      setReports(getReports(user.id));
      setReadIds(getReadReports(user.id));
    }
  }, [user]);

  function openReport(report: Report) {
    if (user && !readIds.has(report.id)) {
      markReportRead(user.id, report.id);
      setReadIds((prev) => new Set([...prev, report.id]));
    }
    setSelected(report);
  }

  if (selected) {
    return (
      <PortalLayout>
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-xs text-[hsl(0_0%_45%)] hover:text-white mb-6 transition-colors"
          data-testid="button-back-reports"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to reports
        </button>
        <div className="rounded-2xl p-7" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-xl font-semibold text-white">{selected.title}</h1>
            <p className="text-xs text-[hsl(0_0%_40%)] shrink-0 mt-1">
              {new Date(selected.published_at).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          </div>
          <p className="text-[hsl(0_0%_65%)] leading-relaxed whitespace-pre-wrap text-sm">
            {selected.content}
          </p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Newspaper className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Reports</h1>
        </div>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">Updates and analysis from your consultant</p>
      </div>

      {reports.length === 0 ? (
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
          {reports.map((report) => {
            const fresh = isNew(report, readIds);
            return (
              <button
                key={report.id}
                onClick={() => openReport(report)}
                className="w-full rounded-2xl p-5 flex items-center justify-between gap-4 text-left transition-all hover:border-[hsl(0_0%_18%)]"
                style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
                data-testid={`report-${report.id}`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <FileText className="w-4 h-4 shrink-0 text-[hsl(0_0%_40%)] mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-medium text-white">{report.title}</p>
                      {fresh && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ background: "rgba(247,147,26,0.12)", color: "#F7931A" }}
                        >
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[hsl(0_0%_40%)] mb-1.5">
                      {new Date(report.published_at).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-[hsl(0_0%_45%)] leading-relaxed line-clamp-2">
                      {(() => {
                        const lines = report.content.split("\n").map((l) => l.trim()).filter(Boolean);
                        const firstLine = lines[0] ?? "";
                        const preview = firstLine.toLowerCase() === report.title.toLowerCase()
                          ? (lines[1] ?? firstLine)
                          : firstLine;
                        return preview;
                      })()}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[hsl(0_0%_35%)] shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
}
