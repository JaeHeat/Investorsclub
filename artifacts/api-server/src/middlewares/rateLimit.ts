import type { Request, Response, NextFunction, RequestHandler } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

// Minimal dependency-free fixed-window rate limiter, keyed by client IP.
// Enough to blunt brute-force / scraping without pulling in a new dependency.
export function rateLimit({ windowMs, max }: { windowMs: number; max: number }): RequestHandler {
  const buckets = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip ?? req.socket.remoteAddress ?? "unknown";

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    if (bucket.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    // Opportunistic cleanup so the map can't grow unbounded.
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) {
        if (b.resetAt <= now) buckets.delete(k);
      }
    }

    next();
  };
}
