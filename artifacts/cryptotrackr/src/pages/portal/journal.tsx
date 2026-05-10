import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTradeJournal, addTradeJournalEntry, deleteTradeJournalEntry, getHoldings } from "@/lib/localStore";
import type { TradeJournalEntry } from "@/lib/types";
import PortalLayout from "@/components/layout/PortalLayout";
import { BookOpen, Plus, Trash2, TrendingUp, TrendingDown, X, AlertTriangle } from "lucide-react";

const ASSET_OPTIONS = [
  { symbol: "BTC",  name: "Bitcoin" },
  { symbol: "ETH",  name: "Ethereum" },
  { symbol: "SOL",  name: "Solana" },
  { symbol: "XRP",  name: "XRP" },
  { symbol: "ADA",  name: "Cardano" },
  { symbol: "AVAX", name: "Avalanche" },
  { symbol: "LINK", name: "Chainlink" },
  { symbol: "DOT",  name: "Polkadot" },
  { symbol: "SUI",  name: "Sui" },
  { symbol: "UNI",  name: "Uniswap" },
  { symbol: "PEPE", name: "PEPE" },
];

const inputClass =
  "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] outline-none focus:border-[#F7931A] transition-colors";

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  type: "buy" as "buy" | "sell",
  asset_symbol: "BTC",
  asset_name: "Bitcoin",
  amount: "",
  price: "",
  notes: "",
};

export default function TradeJournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TradeJournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");

  useEffect(() => {
    document.title = "Trade Journal — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  useEffect(() => {
    if (user) setEntries(getTradeJournal(user.id));
  }, [user]);

  const holdings = useMemo(() => (user ? getHoldings(user.id) : []), [user]);

  // Pre-populate asset options from holdings
  const holdingSymbols = holdings.map((h) => h.symbol);
  const allAssets = [
    ...holdings.map((h) => ({ symbol: h.symbol, name: h.name })),
    ...ASSET_OPTIONS.filter((a) => !holdingSymbols.includes(a.symbol)),
  ];

  const totalBought = useMemo(
    () => entries.filter((e) => e.type === "buy").reduce((s, e) => s + e.total_usd, 0),
    [entries]
  );
  const totalSold = useMemo(
    () => entries.filter((e) => e.type === "sell").reduce((s, e) => s + e.total_usd, 0),
    [entries]
  );

  const filtered = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.type === filter)),
    [entries, filter]
  );

  function handleAdd() {
    if (!user || !form.amount || !form.price) return;
    const amount = parseFloat(form.amount);
    const price = parseFloat(form.price);
    if (isNaN(amount) || isNaN(price)) return;
    const entry: Omit<TradeJournalEntry, "id" | "created_at"> = {
      user_id: user.id,
      date: form.date,
      type: form.type,
      asset_symbol: form.asset_symbol,
      asset_name: form.asset_name,
      amount,
      price,
      total_usd: amount * price,
      notes: form.notes.trim(),
    };
    addTradeJournalEntry(entry);
    setEntries(getTradeJournal(user.id));
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (!user) return;
    deleteTradeJournalEntry(id, user.id);
    setEntries(getTradeJournal(user.id));
    setDeleteTarget(null);
  }

  function setAsset(symbol: string) {
    const asset = allAssets.find((a) => a.symbol === symbol);
    setForm((f) => ({ ...f, asset_symbol: symbol, asset_name: asset?.name ?? symbol }));
  }

  const formatUSD = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(2)}M`
      : n >= 1000
        ? `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : `$${n.toFixed(2)}`;

  return (
    <PortalLayout>
      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.65)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "hsl(0 0% 9%)", border: "1px solid hsl(0 0% 16%)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Delete this entry?</p>
                <p className="text-xs text-[hsl(0_0%_45%)] mt-0.5">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[hsl(0_0%_65%)]" style={{ background: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 18%)" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteTarget)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.35)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Trade Journal</h1>
          {entries.length > 0 && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "hsl(0 0% 12%)", color: "hsl(0 0% 55%)" }}
            >
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)]">Log every buy and sell. Your consultant sees this as context for advice.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total bought", value: formatUSD(totalBought), color: "#22c55e" },
          { label: "Total sold",   value: formatUSD(totalSold),   color: "#ef4444" },
          { label: "Net deployed", value: formatUSD(totalBought - totalSold), color: "#F7931A" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
            <p className="text-[10px] text-[hsl(0_0%_40%)] uppercase tracking-wide mb-1.5">{label}</p>
            <p className="text-lg font-semibold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Add entry button + filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: showForm ? "hsl(0 0% 12%)" : "#F7931A", color: showForm ? "hsl(0 0% 65%)" : "#000" }}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Log trade"}
        </button>
        <div className="flex items-center gap-1.5 ml-auto">
          {(["all", "buy", "sell"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={{
                background: filter === f ? "rgba(247,147,26,0.1)" : "hsl(0 0% 9%)",
                color: filter === f ? "#F7931A" : "hsl(0 0% 50%)",
                border: filter === f ? "1px solid rgba(247,147,26,0.25)" : "1px solid hsl(0 0% 14%)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Add entry form */}
      {showForm && (
        <div className="rounded-2xl p-5 mb-6 space-y-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(0_0%_35%)]">New entry</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[hsl(0_0%_45%)] mb-1.5">Date</label>
              <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-[hsl(0_0%_45%)] mb-1.5">Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["buy", "sell"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className="py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                    style={{
                      background: form.type === t ? (t === "buy" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)") : "hsl(0 0% 10%)",
                      border: form.type === t ? `1px solid ${t === "buy" ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}` : "1px solid hsl(0 0% 16%)",
                      color: form.type === t ? (t === "buy" ? "#22c55e" : "#ef4444") : "hsl(0 0% 55%)",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[hsl(0_0%_45%)] mb-1.5">Asset</label>
              <select
                className={inputClass}
                value={form.asset_symbol}
                onChange={(e) => setAsset(e.target.value)}
              >
                {allAssets.map((a) => (
                  <option key={a.symbol} value={a.symbol}>{a.symbol} — {a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[hsl(0_0%_45%)] mb-1.5">Quantity</label>
              <input
                type="number"
                className={inputClass}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0.5"
                min="0"
                step="any"
              />
            </div>
            <div>
              <label className="block text-xs text-[hsl(0_0%_45%)] mb-1.5">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[hsl(0_0%_40%)]">$</span>
                <input
                  type="number"
                  className={`${inputClass} pl-6`}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="85000"
                  min="0"
                  step="any"
                />
              </div>
            </div>
          </div>

          {form.amount && form.price && (
            <div className="px-3 py-2 rounded-lg text-sm" style={{ background: "hsl(0 0% 10%)" }}>
              <span className="text-[hsl(0_0%_40%)]">Total: </span>
              <span className="font-semibold text-white">{formatUSD(parseFloat(form.amount || "0") * parseFloat(form.price || "0"))}</span>
            </div>
          )}

          <div>
            <label className="block text-xs text-[hsl(0_0%_45%)] mb-1.5">Notes (optional)</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Why did you make this trade? What was the reasoning?"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={!form.amount || !form.price}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: "#F7931A", color: "#000" }}
          >
            Log trade
          </button>
        </div>
      )}

      {/* Entries list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl p-10 flex flex-col items-center text-center" style={{ background: "hsl(0 0% 7%)", border: "1px dashed hsl(0 0% 16%)" }}>
          <BookOpen className="w-7 h-7 text-[hsl(0_0%_25%)] mb-3" />
          {entries.length === 0 ? (
            <>
              <p className="text-sm font-medium text-white mb-1">No trades logged yet</p>
              <p className="text-xs text-[hsl(0_0%_40%)] max-w-xs leading-relaxed">
                Start logging your buys and sells to keep a record of your decision-making across the cycle.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-white mb-1">No {filter} trades found</p>
              <p className="text-xs text-[hsl(0_0%_40%)] max-w-xs leading-relaxed">
                You have {entries.length} {entries.length === 1 ? "entry" : "entries"} total — try switching the filter above.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl p-4"
              style={{
                background: "hsl(0 0% 7%)",
                border: `1px solid ${entry.type === "buy" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"}`,
              }}
              data-testid={`journal-entry-${entry.id}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: entry.type === "buy" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  }}
                >
                  {entry.type === "buy"
                    ? <TrendingUp className="w-4 h-4" style={{ color: "#22c55e" }} />
                    : <TrendingDown className="w-4 h-4" style={{ color: "#ef4444" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
                      style={{
                        background: entry.type === "buy" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        color: entry.type === "buy" ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {entry.type}
                    </span>
                    <p className="text-sm font-semibold text-white">
                      {entry.amount} {entry.asset_symbol}
                    </p>
                    <span className="text-xs text-[hsl(0_0%_45%)]">@ {formatUSD(entry.price)}</span>
                    <span className="text-xs font-semibold text-white ml-auto">{formatUSD(entry.total_usd)}</span>
                  </div>
                  <p className="text-xs text-[hsl(0_0%_40%)]">
                    {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  {entry.notes && (
                    <p className="text-xs text-[hsl(0_0%_50%)] mt-2 leading-relaxed border-t border-[hsl(0_0%_12%)] pt-2">
                      {entry.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setDeleteTarget(entry.id)}
                  className="shrink-0 p-1.5 rounded-lg text-[hsl(0_0%_30%)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
