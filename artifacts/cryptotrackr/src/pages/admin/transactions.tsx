import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { getAllTradeJournalEntries } from "@/lib/localStore";
import { loadClientsFromServer, type AdminClientData } from "@/lib/profileApi";
import { formatUSD } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Receipt, RefreshCw, Search } from "lucide-react";
import type { TradeJournalEntry } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TransactionsPage() {
  const [entries, setEntries] = useState<TradeJournalEntry[]>([]);
  const [clientNames, setClientNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "buy" | "sell">("all");

  useEffect(() => {
    const journal = getAllTradeJournalEntries();
    setEntries(journal);

    loadClientsFromServer().then((apiClients: AdminClientData[]) => {
      const names = new Map<string, string>(
        apiClients.map((c) => [
          c.id,
          c.profile?.full_name ?? ([c.firstName, c.lastName].filter(Boolean).join(" ") || "Unknown"),
        ])
      );
      setClientNames(names);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchesType = typeFilter === "all" || e.type === typeFilter;
      const q = search.toLowerCase();
      const clientName = clientNames.get(e.user_id) ?? "";
      const matchesSearch =
        !q ||
        e.asset_symbol.toLowerCase().includes(q) ||
        e.asset_name.toLowerCase().includes(q) ||
        clientName.toLowerCase().includes(q) ||
        (e.notes ?? "").toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [entries, typeFilter, search, clientNames]);

  const totalVolume = filtered.reduce((s, e) => s + e.total_usd, 0);
  const buyCount = filtered.filter((e) => e.type === "buy").length;
  const sellCount = filtered.filter((e) => e.type === "sell").length;

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Receipt className="w-5 h-5" style={{ color: "#F7931A" }} />
          <h1 className="text-2xl font-semibold text-white">Transactions</h1>
        </div>
        <p className="text-sm text-[hsl(0_0%_45%)]">All client trade journal entries</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Volume", value: formatUSD(totalVolume) },
          { label: "Buy Orders", value: String(buyCount) },
          { label: "Sell Orders", value: String(sellCount) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}>
            <p className="text-xs text-[hsl(0_0%_45%)] uppercase tracking-wide mb-1">{label}</p>
            <p className="text-xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(0_0%_40%)]" />
          <input
            type="text"
            placeholder="Search by asset, client, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder:text-[hsl(0_0%_35%)] outline-none"
            style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 14%)" }}
          />
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid hsl(0 0% 14%)" }}>
          {(["all", "buy", "sell"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className="px-3 py-2 text-xs font-medium capitalize transition-colors"
              style={{
                background: typeFilter === f ? "rgba(247,147,26,0.1)" : "hsl(0 0% 8%)",
                color: typeFilter === f ? "#F7931A" : "hsl(0 0% 50%)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(0 0% 13%)" }}>
        <div
          className="grid px-5 py-2.5 text-xs text-[hsl(0_0%_40%)] uppercase tracking-wide"
          style={{
            gridTemplateColumns: "80px 1fr 1fr 90px 90px 90px",
            background: "hsl(0 0% 7%)",
            borderBottom: "1px solid hsl(0 0% 11%)",
          }}
        >
          <span>Type</span>
          <span>Asset</span>
          <span>Client</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Price</span>
          <span className="text-right">Total</span>
        </div>

        <div style={{ background: "hsl(0 0% 6%)" }}>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[hsl(0_0%_40%)]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Receipt className="w-8 h-8 mx-auto mb-3 text-[hsl(0_0%_25%)]" />
              <p className="text-sm text-[hsl(0_0%_40%)]">
                {entries.length === 0
                  ? "No transactions yet — clients log trades via their Trade Journal in the portal."
                  : "No transactions match your filters."}
              </p>
            </div>
          ) : (
            filtered.map((entry) => {
              const isBuy = entry.type === "buy";
              const clientName = clientNames.get(entry.user_id) ?? "Unknown";
              return (
                <div
                  key={entry.id}
                  className="grid px-5 py-3.5 items-center"
                  style={{
                    gridTemplateColumns: "80px 1fr 1fr 90px 90px 90px",
                    borderBottom: "1px solid hsl(0 0% 9%)",
                  }}
                >
                  {/* Type badge */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: isBuy ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)" }}
                    >
                      {isBuy
                        ? <ArrowDownLeft className="w-3 h-3 text-green-400" />
                        : <ArrowUpRight className="w-3 h-3 text-red-400" />}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: isBuy ? "#22c55e" : "#ef4444" }}>
                      {entry.type.toUpperCase()}
                    </span>
                  </div>

                  {/* Asset */}
                  <div>
                    <p className="text-sm font-medium text-white">{entry.asset_symbol}</p>
                    <p className="text-xs text-[hsl(0_0%_40%)]">{formatDate(entry.date)}</p>
                  </div>

                  {/* Client */}
                  <div>
                    <p className="text-sm text-[hsl(0_0%_65%)] truncate">{clientName}</p>
                    {entry.notes && (
                      <p className="text-xs text-[hsl(0_0%_35%)] truncate max-w-[160px]">{entry.notes}</p>
                    )}
                  </div>

                  {/* Amount */}
                  <p className="text-sm text-right text-white">
                    {entry.amount % 1 === 0 ? entry.amount.toFixed(0) : entry.amount.toFixed(4)}
                  </p>

                  {/* Price */}
                  <p className="text-sm text-right text-[hsl(0_0%_60%)]">
                    {formatUSD(entry.price)}
                  </p>

                  {/* Total */}
                  <p className="text-sm text-right font-medium text-white">
                    {formatUSD(entry.total_usd)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
