import { Router, type IRouter } from "express";
import { cgFetch } from "../lib/coingecko";
import { coinbaseHistory } from "../lib/priceFallback";

const router: IRouter = Router();

// Server-side proxy for CoinGecko market-chart history, used to reconstruct
// portfolio equity curves. Cached longer than spot prices since history barely
// changes within a session.
const CACHE_TTL_MS = 5 * 60_000;
const UPSTREAM_TIMEOUT_MS = 9_000;
const ID_PATTERN = /^[a-z0-9-]+$/;
const ALLOWED_DAYS = new Set(["1", "7", "30", "90", "180", "365", "max"]);

interface CacheEntry {
  expires: number;
  body: unknown;
}
const cache = new Map<string, CacheEntry>();

// Mounted under "/api" in routes/index.ts → final path is /api/history.
router.get("/history", async (req, res) => {
  const id = String(req.query.id ?? "").trim().toLowerCase();
  const days = String(req.query.days ?? "365").trim();

  if (!id || !ID_PATTERN.test(id) || id.length > 64) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  if (!ALLOWED_DAYS.has(days)) {
    res.status(400).json({ error: "invalid days" });
    return;
  }

  const key = `${id}:${days}`;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expires > now) {
    res.set("x-cache", "HIT").json(cached.body);
    return;
  }

  try {
    const interval = Number(days) <= 90 || days === "max" ? "" : "&interval=daily";
    const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}${interval}`;
    const upstream = await cgFetch(url, UPSTREAM_TIMEOUT_MS);
    if (!upstream.ok) {
      const fb = days !== "max" ? await coinbaseHistory(id, Number(days)) : await coinbaseHistory(id, 300);
      if (fb) { const body = { prices: fb }; cache.set(key, { expires: now + CACHE_TTL_MS, body }); res.set("x-source", "coinbase").json(body); return; }
      if (cached) { res.set("x-cache", "STALE").json(cached.body); return; }
      res.status(502).json({ error: `upstream ${upstream.status}` });
      return;
    }
    const json = (await upstream.json()) as { prices?: [number, number][] };
    const body = { prices: Array.isArray(json.prices) ? json.prices : [] };
    cache.set(key, { expires: now + CACHE_TTL_MS, body });
    res.set("x-cache", "MISS").json(body);
  } catch {
    const fb = days !== "max" ? await coinbaseHistory(id, Number(days)) : await coinbaseHistory(id, 300);
    if (fb) { const body = { prices: fb }; cache.set(key, { expires: now + CACHE_TTL_MS, body }); res.set("x-source", "coinbase").json(body); return; }
    if (cached) { res.set("x-cache", "STALE").json(cached.body); return; }
    res.status(504).json({ error: "upstream timeout" });
  }
});

export default router;
