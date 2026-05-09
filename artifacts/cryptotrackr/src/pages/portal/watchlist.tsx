import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getWatchlist, addWatchlistItem, removeWatchlistItem, getHoldings } from "@/lib/localStore";
import { usePrices } from "@/hooks/usePrices";
import { formatUSD } from "@/lib/utils";
import { CURATED_ALTS, ALT_CATEGORY_COLORS } from "@/lib/portfolioPlans";
import type { WatchlistItem } from "@/lib/types";
import PortalLayout from "@/components/layout/PortalLayout";
import { Eye, Plus, Trash2 } from "lucide-react";

const CORE_ASSETS = [
  { coingecko_id: "bitcoin",  symbol: "BTC", name: "Bitcoin",  category: "Core" as const },
  { coingecko_id: "ethereum", symbol: "ETH", name: "Ethereum", category: "Core" as const },
  { coingecko_id: "solana",   symbol: "SOL", name: "Solana",   category: "Core" as const },
];

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
    if (!user) return;
    const wl = getWatchlist(user.id);
    if (wl.length === 0) {
      const holdings = getHoldings(user.id);
      for (const h of holdings) {
        addWatchlistItem(user.id, { coingecko_id: h.coingecko_id, symbol: h.symbol, name: h.name });
      }
    }
    setWatchlist(getWatchlist(user.id));
  }, [user]);

  const allCoinIds = useMemo(() => watchlist.map((w) => w.coingecko_id), [watchlist]);
  const { prices, changes24h } = usePrices(allCoinIds);

  const allPickerAssets = useMemo(() => {
    return [
      ...CORE_ASSETS.map((a) => ({ ...a, isCore: true, rationale: "" })),
      ...CURATED_ALTS.map((a) => ({ ...a, isCore: false })),
    ];
  }, []);

  const filteredPicker = useMemo(() =>
    allPickerAssets.filter(
      (a) =>
        !watchlist.some((w) => w.coingecko_id === a.coingecko_id) &&
        (search === "" ||
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.symbol.toLowerCase().includes(search.toLowerCase()))
    ),
    [watchlist, search, allPickerAssets]
  );

  function handleAdd(asset: { coingecko_id: string; symbol: string; name: string }) {
    if (!user) return;
    addWatchlistItem(user.id, {
      coingecko_id: asset.coingecko_id,
      symbol: asset.symbol,
      name: asset.name,
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

  const coreInfoMap = useMemo(() => {
    const m: Record<string, typeof CORE_ASSETS[0]> = {};
    for (const a of CORE_ASSETS) m[a.coingecko_id] = a;
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
        <p className="text-sm text-[hsl(0_0%_42%)] mt-2">Track assets with live prices and 24h change.</p>
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
            {filteredPicker.length === 0 ? (
              <p className="text-xs text-[hsl(0_0%_40%)] py-2 text-center">All assets already in watchlist</p>
            ) : (
              filteredPicker.map((asset) => {
                const isCore = "isCore" in asset && asset.isCore;
                const categoryColor = isCore ? "#F7931A" : ALT_CATEGORY_COLORS[(asset as typeof CURATED_ALTS[0]).category];
                const categoryLabel = isCore ? "Core" : (asset as typeof CURATED_ALTS[0]).category;
                return (
                  <button
                    key={asset.coingecko_id}
                    onClick={() => handleAdd(asset)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[hsl(0,0%,12%)] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: `${categoryColor}18`, color: categoryColor }}
                      >
                        {categoryLabel}
                      </span>
                      <span className="text-sm font-semibold text-white">{asset.symbol}</span>
                      <span className="text-xs text-[hsl(0_0%_45%)]">{asset.name}</span>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-[hsl(0_0%_40%)]" />
                  </button>
                );
              })
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
          <p className="text-xs text-[hsl(0_0%_30%)] mt-1 mb-4">Track BTC, ETH, SOL, and top-25 alts with live prices.</p>
          <button
            onClick={() => setShowPicker(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(247,147,26,0.1)", color: "#F7931A" }}
          >
            <Plus className="w-3.5 h-3.5" /> Add your first asset
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {watchlist.map((item) => {
            const price = prices[item.coingecko_id];
            const change24h = changes24h[item.coingecko_id];
            const altInfo = altInfoMap[item.coingecko_id];
            const coreInfo = coreInfoMap[item.coingecko_id];

            const categoryColor = coreInfo
              ? "#F7931A"
              : altInfo ? ALT_CATEGORY_COLORS[altInfo.category] : "#6b7280";
            const categoryLabel = coreInfo ? "Core" : altInfo ? altInfo.category : null;

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
                    {categoryLabel && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{ background: `${categoryColor}18`, color: categoryColor }}
                      >
                        {categoryLabel}
                      </span>
                    )}
                  </div>
                  {altInfo && <p className="text-[10px] text-[hsl(0_0%_38%)] leading-relaxed">{altInfo.rationale}</p>}
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
                    <p className="text-[10px] text-[hsl(0_0%_35%)]">—</p>
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
