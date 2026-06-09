import { Router, type IRouter } from "express";
import { cgFetch } from "../lib/coingecko";
import { coinbaseSpot } from "../lib/priceFallback";

const router: IRouter = Router();

// Server-side CoinGecko proxy with a short in-memory cache. Keeps the public
// CoinGecko key/IP server-side and collapses many client requests into one
// upstream call per TTL window, avoiding browser-side rate limiting.
const CACHE_TTL_MS = 30_000;
const UPSTREAM_TIMEOUT_MS = 8_000;
const ID_PATTERN = /^[a-z0-9-]+$/;

interface CacheEntry {
  expires: number;
  body: unknown;
}
const cache = new Map<string, CacheEntry>();

router.get("/api/prices", async (req, res) => {
  const rawIds = String(req.query.ids ?? "").trim();
  if (!rawIds) {
    res.status(400).json({ error: "ids query param is required" });
    return;
  }

  // Normalise + validate to a stable, safe cache key.
  const ids = [...new Set(rawIds.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))].sort();
  if (ids.length === 0 || ids.length > 100 || !ids.every((id) => ID_PATTERN.test(id))) {
    res.status(400).json({ error: "invalid ids" });
    return;
  }

  const key = ids.join(",");
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expires > now) {
    res.set("x-cache", "HIT").json(cached.body);
    return;
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(key)}&vs_currencies=usd&include_24hr_change=true`;
    const upstream = await cgFetch(url, UPSTREAM_TIMEOUT_MS);
    if (!upstream.ok) {
      const fb = await coinbaseSpot(ids);
      if (fb) { cache.set(key, { expires: now + CACHE_TTL_MS, body: fb }); res.set("x-source", "coinbase").json(fb); return; }
      // Serve a stale entry rather than failing the client when possible.
      if (cached) { res.set("x-cache", "STALE").json(cached.body); return; }
      res.status(502).json({ error: `upstream ${upstream.status}` });
      return;
    }
    const body = await upstream.json();
    cache.set(key, { expires: now + CACHE_TTL_MS, body });
    res.set("x-cache", "MISS").json(body);
  } catch {
    const fb = await coinbaseSpot(ids);
    if (fb) { cache.set(key, { expires: now + CACHE_TTL_MS, body: fb }); res.set("x-source", "coinbase").json(fb); return; }
    if (cached) { res.set("x-cache", "STALE").json(cached.body); return; }
    res.status(504).json({ error: "upstream timeout" });
  }
});

export default router;
