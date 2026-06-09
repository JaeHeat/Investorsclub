import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { authMiddleware } from "./middlewares/authMiddleware";
import { rateLimit } from "./middlewares/rateLimit";
import { csrfOriginCheck } from "./middlewares/csrf";

const app: Express = express();

// Trust the first proxy hop (Replit / typical PaaS) so req.ip reflects the
// real client address for rate limiting rather than the proxy.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));
app.use(authMiddleware);

// Stricter limit on the auth entry point (brute-force surface), looser global
// limit on everything else.
app.use("/api/login", rateLimit({ windowMs: 60_000, max: 20 }));
app.use("/api", csrfOriginCheck(), rateLimit({ windowMs: 60_000, max: 300 }), router);

export default app;
