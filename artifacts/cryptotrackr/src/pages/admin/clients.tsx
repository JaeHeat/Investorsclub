import { useState } from "react";
import {
  getAllClientProfiles,
  getMilestones,
  upsertMilestone,
  getRoadmapItems,
  getAllRoadmapItems,
  addRoadmapItem,
  getAllReports,
  addReport,
} from "@/lib/localStore";
import type { ClientProfile, Milestone, RoadmapItem, Report } from "@/lib/types";
import { formatUSD, getBonusPct, MILESTONE_PCTS, getPortfolioTier } from "@/lib/utils";
import AdminLayout from "@/components/layout/AdminLayout";
import { useBtcPrice } from "@/hooks/useBtcPrice";
import { ChevronRight, Check, Loader2, X, Plus } from "lucide-react";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-lg rounded-2xl" style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 15%)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid hsl(0 0% 12%)" }}>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-[hsl(0_0%_40%)] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AdminClients() {
  const { price } = useBtcPrice();
  const [clients, setClients] = useState<ClientProfile[]>(() => getAllClientProfiles());
  const [selected, setSelected] = useState<ClientProfile | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [roadmapForm, setRoadmapForm] = useState({ title: "", content: "" });
  const [reportForm, setReportForm] = useState({ title: "", content: "", is_global: false });
  const [milestoneForm, setMilestoneForm] = useState({ bonus_amount: "" });

  function selectClient(client: ClientProfile) {
    setSelected(client);
    setMilestones(getMilestones(client.user_id));
    setRoadmapItems(getRoadmapItems(client.user_id));
    setReports(getAllReports().filter((r) => r.user_id === client.user_id || r.is_global));
  }

  function saveRoadmapItem() {
    if (!selected || !roadmapForm.title || !roadmapForm.content) return;
    setSaving(true);
    addRoadmapItem({ user_id: selected.user_id, title: roadmapForm.title, content: roadmapForm.content });
    setRoadmapItems(getRoadmapItems(selected.user_id));
    setRoadmapForm({ title: "", content: "" });
    setShowRoadmapModal(false);
    setSaving(false);
  }

  function saveReport() {
    if (!selected || !reportForm.title || !reportForm.content) return;
    setSaving(true);
    addReport({
      user_id: reportForm.is_global ? null : selected.user_id,
      title: reportForm.title,
      content: reportForm.content,
      is_global: reportForm.is_global,
    });
    setReports(getAllReports().filter((r) => r.user_id === selected.user_id || r.is_global));
    setReportForm({ title: "", content: "", is_global: false });
    setShowReportModal(false);
    setSaving(false);
  }

  function markMilestone(pct: number) {
    if (!selected) return;
    setSaving(true);
    const bonus = parseFloat(milestoneForm.bonus_amount) || null;
    const initialVal = selected.initial_portfolio_value ?? 0;
    const bonusPct = getBonusPct(pct, initialVal);
    upsertMilestone({
      user_id: selected.user_id,
      milestone_pct: pct,
      hit: true,
      hit_at: new Date().toISOString(),
      bonus_amount: bonus,
      bonus_pct: bonusPct,
    });
    setMilestones(getMilestones(selected.user_id));
    setMilestoneForm({ bonus_amount: "" });
    setShowMilestoneModal(null);
    setSaving(false);
  }

  const inputStyle = {
    background: "hsl(0 0% 10%)",
    border: "1px solid hsl(0 0% 16%)",
    color: "white" as const,
  };

  if (selected) {
    const currentValue = price && selected.btc_holdings ? selected.btc_holdings * price : null;
    const costBasis = selected.btc_holdings && selected.avg_cost_basis ? selected.btc_holdings * selected.avg_cost_basis : 0;
    const returnPct = costBasis > 0 && currentValue ? ((currentValue - costBasis) / costBasis) * 100 : null;
    const tier = getPortfolioTier(selected.initial_portfolio_value ?? 0);

    return (
      <AdminLayout>
        <button onClick={() => setSelected(null)} className="text-xs text-[hsl(0_0%_45%)] hover:text-white flex items-center gap-1 mb-6 transition-colors" data-testid="button-back-clients">
          ← Back to clients
        </button>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">{selected.full_name || "Client"}</h1>
            <p className="text-sm text-[hsl(0_0%_45%)] mt-1">{selected.country} · {selected.timezone}</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>{tier}</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Portfolio", value: currentValue ? formatUSD(currentValue) : "—" },
            { label: "Cost Basis", value: formatUSD(costBasis) },
            { label: "Return", value: returnPct !== null ? `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(1)}%` : "—" },
            { label: "BTC Holdings", value: `${selected.btc_holdings ?? "—"} BTC` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl p-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
              <p className="text-xs text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1">{label}</p>
              <p className="text-lg font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
            <h2 className="text-xs font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wide mb-4">Profile</h2>
            <div className="space-y-2.5">
              {[
                { label: "Goal", value: selected.investment_goal?.replace(/_/g, " ") },
                { label: "Risk", value: selected.risk_tolerance },
                { label: "Horizon", value: selected.time_horizon?.replace(/_/g, " ") },
                { label: "Avg Cost", value: selected.avg_cost_basis ? formatUSD(selected.avg_cost_basis) : null },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-[hsl(0_0%_40%)]">{label}</span>
                  <span className="text-white capitalize">{value || "—"}</span>
                </div>
              ))}
              {selected.notes && (
                <div className="pt-2" style={{ borderTop: "1px solid hsl(0 0% 12%)" }}>
                  <p className="text-xs text-[hsl(0_0%_40%)] mb-1">Notes from client</p>
                  <p className="text-xs text-[hsl(0_0%_60%)] leading-relaxed">{selected.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wide">Milestones</h2>
            </div>
            <div className="space-y-2">
              {MILESTONE_PCTS.map((pct) => {
                const record = milestones.find((m) => m.milestone_pct === pct);
                const isHit = record?.hit ?? false;
                return (
                  <div key={pct} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: isHit ? "rgba(34,197,94,0.12)" : "hsl(0 0% 11%)" }}
                      >
                        {isHit && <Check className="w-3 h-3" style={{ color: "#22c55e" }} />}
                      </div>
                      <span className="text-sm text-white">{pct}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isHit && record?.bonus_amount && (
                        <span className="text-xs text-[hsl(0_0%_45%)]">{formatUSD(record.bonus_amount)}</span>
                      )}
                      {!isHit && (
                        <button
                          onClick={() => setShowMilestoneModal(pct)}
                          className="text-xs px-2 py-1 rounded-lg transition-colors"
                          style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}
                          data-testid={`mark-milestone-${pct}`}
                        >
                          Mark hit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 mb-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wide">Roadmap</h2>
            <button
              onClick={() => setShowRoadmapModal(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}
              data-testid="button-add-roadmap"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
          {roadmapItems.length === 0 ? (
            <p className="text-sm text-[hsl(0_0%_35%)]">No roadmap items yet</p>
          ) : (
            <div className="space-y-2">
              {roadmapItems.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-xl p-3" style={{ background: "hsl(0 0% 10%)" }}>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-[hsl(0_0%_45%)] mt-1 line-clamp-2">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-[hsl(0_0%_50%)] uppercase tracking-wide">Reports</h2>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(247,147,26,0.08)", color: "#F7931A" }}
              data-testid="button-add-report"
            >
              <Plus className="w-3 h-3" />
              Publish
            </button>
          </div>
          {reports.length === 0 ? (
            <p className="text-sm text-[hsl(0_0%_35%)]">No reports yet</p>
          ) : (
            <div className="space-y-2">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex justify-between text-sm">
                  <span className="text-white">{report.title}</span>
                  <span className="text-[hsl(0_0%_40%)] text-xs">
                    {new Date(report.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {showRoadmapModal && (
          <Modal title="Add Roadmap Item" onClose={() => setShowRoadmapModal(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[hsl(0_0%_55%)] mb-1.5 uppercase tracking-wide">Title</label>
                <input
                  type="text"
                  value={roadmapForm.title}
                  onChange={(e) => setRoadmapForm({ ...roadmapForm, title: e.target.value })}
                  placeholder="e.g. Cycle Top Target"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle}
                  data-testid="input-roadmap-title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(0_0%_55%)] mb-1.5 uppercase tracking-wide">Content</label>
                <textarea
                  value={roadmapForm.content}
                  onChange={(e) => setRoadmapForm({ ...roadmapForm, content: e.target.value })}
                  placeholder="Cycle stage notes..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none"
                  style={inputStyle}
                  data-testid="input-roadmap-content"
                />
              </div>
              <button
                onClick={saveRoadmapItem}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                style={{ background: "#F7931A", color: "#0A0A0A" }}
                data-testid="button-save-roadmap"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Save"}
              </button>
            </div>
          </Modal>
        )}

        {showReportModal && (
          <Modal title="Publish Report" onClose={() => setShowReportModal(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[hsl(0_0%_55%)] mb-1.5 uppercase tracking-wide">Title</label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  placeholder="e.g. April 2026 Update"
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle}
                  data-testid="input-report-title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(0_0%_55%)] mb-1.5 uppercase tracking-wide">Content</label>
                <textarea
                  value={reportForm.content}
                  onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })}
                  placeholder="Monthly analysis..."
                  rows={5}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none"
                  style={inputStyle}
                  data-testid="input-report-content"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reportForm.is_global}
                  onChange={(e) => setReportForm({ ...reportForm, is_global: e.target.checked })}
                  className="rounded"
                  data-testid="checkbox-global"
                />
                <span className="text-sm text-[hsl(0_0%_65%)]">Send to all clients</span>
              </label>
              <button
                onClick={saveReport}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                style={{ background: "#F7931A", color: "#0A0A0A" }}
                data-testid="button-save-report"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</> : "Publish Report"}
              </button>
            </div>
          </Modal>
        )}

        {showMilestoneModal !== null && (
          <Modal title={`Mark ${showMilestoneModal}% Milestone`} onClose={() => setShowMilestoneModal(null)}>
            <div className="space-y-4">
              <p className="text-sm text-[hsl(0_0%_55%)]">
                Bonus rate: {getBonusPct(showMilestoneModal, selected.initial_portfolio_value ?? 0)}% of gains
              </p>
              <div>
                <label className="block text-xs font-medium text-[hsl(0_0%_55%)] mb-1.5 uppercase tracking-wide">Bonus Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[hsl(0_0%_45%)]">$</span>
                  <input
                    type="number"
                    value={milestoneForm.bonus_amount}
                    onChange={(e) => setMilestoneForm({ bonus_amount: e.target.value })}
                    placeholder="0"
                    className="w-full pl-7 pr-4 py-2.5 rounded-lg text-sm outline-none"
                    style={inputStyle}
                    data-testid="input-bonus-amount"
                  />
                </div>
              </div>
              <button
                onClick={() => markMilestone(showMilestoneModal)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                style={{ background: "#F7931A", color: "#0A0A0A" }}
                data-testid="button-confirm-milestone"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Mark as Hit"}
              </button>
            </div>
          </Modal>
        )}
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Clients</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">All client profiles and portfolio details</p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-sm text-[hsl(0_0%_40%)]">No clients have completed onboarding yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => {
            const currentValue = price && client.btc_holdings ? client.btc_holdings * price : null;
            const costBasis = client.btc_holdings && client.avg_cost_basis ? client.btc_holdings * client.avg_cost_basis : 0;
            const returnPct = costBasis > 0 && currentValue ? ((currentValue - costBasis) / costBasis) * 100 : null;
            const tier = getPortfolioTier(client.initial_portfolio_value ?? 0);

            return (
              <button
                key={client.user_id}
                onClick={() => selectClient(client)}
                className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all hover:border-[hsl(0_0%_18%)]"
                style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
                data-testid={`client-card-${client.user_id}`}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold" style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}>
                  {client.full_name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{client.full_name || "Unnamed"}</p>
                  <p className="text-xs text-[hsl(0_0%_40%)] mt-0.5">{client.country} · {tier}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-white">{currentValue ? formatUSD(currentValue) : "—"}</p>
                  <p className={`text-xs mt-0.5 ${returnPct !== null && returnPct >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {returnPct !== null ? `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(1)}%` : "—"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[hsl(0_0%_30%)] shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
