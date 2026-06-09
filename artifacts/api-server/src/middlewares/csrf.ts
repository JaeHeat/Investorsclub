import type { Request, Response, NextFunction, RequestHandler } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// CSRF defence for cookie-authenticated mutations. The session cookie is
// already SameSite=Lax + HttpOnly + Secure; this adds an Origin/Referer check
// on every state-changing request (the OWASP-recommended header defence), so a
// forged cross-site POST is rejected even if a cookie leaks through.
//
// Configure ALLOWED_ORIGINS (comma-separated) for split frontend/API
// deployments; otherwise same-origin is required.
export function csrfOriginCheck(): RequestHandler {
  const allowed = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const hostOf = (value: string): string | null => {
    try {
      return new URL(value).host;
    } catch {
      return null;
    }
  };

  return (req: Request, res: Response, next: NextFunction) => {
    if (SAFE_METHODS.has(req.method)) return next();

    const source = req.get("origin") ?? req.get("referer");
    if (!source) {
      res.status(403).json({ error: "Missing Origin on a state-changing request" });
      return;
    }
    const reqHost = hostOf(source);
    if (!reqHost) {
      res.status(403).json({ error: "Malformed Origin" });
      return;
    }

    const ok = allowed.length
      ? allowed.some((a) => (hostOf(a) ?? a) === reqHost)
      : reqHost === req.get("host");

    if (!ok) {
      res.status(403).json({ error: "Cross-origin request blocked" });
      return;
    }
    next();
  };
}
