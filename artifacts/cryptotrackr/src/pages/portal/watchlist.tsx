import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getWatchlist, addWatchlistItem, removeWatchlistItem } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD } from "@/lib/utils";
import { CURATED_ALTS, ALT_CATEGORY_COLORS } from "@/lib/portfolioPlans";
import type { WatchlistItem } from "@/lib/types";
import PortalLayout from "@/components/layout/PortalLayout";
import { Eye, Plus, Trash2 } from "lucide-react";

export default function WatchlistPage() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Watchlist — CryptoTrackr";
    return () => { document.title = "CryptoTrackr"; };
  }, []);

  useEffect(() => {
    if (user) setWatchlist(getWatchlist(user.id));
  }, [user]);

  const allCoinIds = useMemo(() => watchlist.map((w) => w.coingecko_id), [watchlist]);
  const { prices, changes24h } = usePrices(allCoinIds);

  const filteredAlts = useMemo(() =>
    CURATED_ALTS.filter(
      (a) =>
        !watchlist.some((w) => w.coingecko_id === a.coingecko_id) &&
        (search === "" ||
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.symbol.toLowerCase().includes(search.toLowerCase()))
    ),
    [watchlist, search]
  );

  function handleAdd(alt: typeof CURATED_ALTS[0]) {
    if (!user) return;
    const item = addWatchlistItem(user.id, {
      coingecko_id: alt.coingecko_id,
      symbol: alt.symbol,
      name: alt.name,
    });
    setWatchlist(getWatchlist(user.id));
    setShowPicker(false);
    setSearch("");
  }

  function handleRemove(coingecko_id: string) {
    if (!user) return;
    removeWatchlistItem(user.id, coingecko_id);
    setWatchlist(getWatchlist(user.id));
  }

  const altInfoMap = useMemo(() => {
    const m: Record<string, typeof CURATED_ALTS[0]> = {};
    for (const a of CURATED_ALTS) m[a.coingecko_id] = a;
    return m;
  }, []);

  return (
    <PortalLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5" style={{ color: "#F7931A" }} />
            <h1 className="text-2xl font-semibold text-white">Watchlist</h1>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "hsl(0 0% 12%)", color: "hsl(0 0% 60%)" }}
            >
              {watchlist.length} assets
            </span>
          </div>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#F7931A", color: "#000" }}
          >
            <Plus className="w-4 h-4" />
            Add asset
          </button>
        </div>
        <p className="text-sm text-[hsl(0_0%_42%)] mt-2">Track assets from our curated Top-25 universe with live prices.</p>
      </div>

      {/* Asset picker */}
      {showPicker && (
        <div
          className="rounded-2xl p-4 mb-6"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 14%)" }}
        >
          <input
            className="w-full px-3 py-2 rounded-xl text-sm text-white bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,18%)] outline-none focus:border-[#F7931A] mb-3"
            placeholder="Search by name or ticker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="space-y-1 max-h-52 overflow-y-auto">
            {filteredAlts.length === 0 ? (
              <p className="text-xs text-[hsl(0_0%_40%)] py-2 text-center">All curated alts already in watchlist</p>
            ) : (
              filteredAlts.map((alt) => (
                <button
                  key={alt.coingecko_id}
                  onClick={() => handleAdd(alt)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[hsl(0,0%,12%)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: `${ALT_CATEGORY_COLORS[alt.category]}18`,
                        color: ALT_CATEGORY_COLORS[alt.category],
                      }}
                    >
                      {alt.category}
                    </span>
                    <span className="text-sm font-semibold text-white">{alt.symbol}</span>
                    <span className="text-xs text-[hsl(0_0%_45%)]">{alt.name}</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-[hsl(0_0%_40%)]" />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Watchlist */}
      {watchlist.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
        >
          <Eye className="w-8 h-8 mx-auto mb-3 text-[hsl(0_0%_25%)]" />
          <p className="text-sm font-semibold text-[hsl(0_0%_40%)]">No assets watched yet</p>
          <p className="text-xs text-[hsl(0_0%_30%)] mt-1">Add assets from our curated Top-25 universe to track their price.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {watchlist.map((item) => {
            const price = prices[item.coingecko_id];
            const change24h = changes24h[item.coingecko_id];
            const info = altInfoMap[item.coingecko_id];

            return (
              <div
                key={item.coingecko_id}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(0 0% 13%)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-white">{item.symbol}</p>
                    <p className="text-xs text-[hsl(0_0%_45%)] truncate">{item.name}</p>
                    {info && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          background: `${ALT_CATEGORY_COLORS[info.category]}18`,
                          color: ALT_CATEGORY_COLORS[info.category],
                        }}
                      >
                        {info.category}
                      </span>
                    )}
                  </div>
                  {info && <p className="text-[10px] text-[hsl(0_0%_38%)] leading-relaxed">{info.rationale}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">
                    {price ? formatUSD(price) : <span className="text-[hsl(0_0%_35%)]">—</span>}
                  </p>
                  {change24h != null ? (
                    <p className="text-[11px] font-semibold mt-0.5" style={{ color: change24h >= 0 ? "#22c55e" : "#ef4444" }}>
                      {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
                    </p>
                  ) : (
                    <p className="text-[10px] text-[hsl(0_0%_35%)]">Loading...</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(item.coingecko_id)}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-[hsl(0,0%,12%)] text-[hsl(0_0%_35%)] hover:text-[#ef4444] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
}
