
//index.ts
import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./src/routes/index.js";
import { sessionMiddleware } from "./src/config/session.js";
import { serveFrontend } from "./src/config/static.js"; // ✅ we'll create this helper

const app = express();

// Determine allowed origins from env or sensible defaults
const defaultDevOrigins = ["http://localhost:5173", "http://localhost:3000"];
const allowedOrigins =
  process.env.ALLOWED_ORIGINS?.split(",").map((s) => s.trim()) ??
  (process.env.NODE_ENV === "development" ? defaultDevOrigins : []);

// Enable CORS for client-server separation
app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (mobile apps, curl, server-to-server, same-origin)
      if (!origin) return cb(null, true);
      // if no configured allowedOrigins, be permissive in non-prod (but prefer setting ALLOWED_ORIGINS)
      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 👉 enable session support
app.set("trust proxy", 1); // required if running behind proxy in production (Heroku, Render, etc.)
app.use(sessionMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  // @ts-ignore - keep signature
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }
      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error("Unhandled error:", err);
  });

  // ✅ Only serve static frontend in production
  if (app.get("env") === "production") {
    serveFrontend(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = "0.0.0.0";
  server.listen({ port, host }, () => {
    console.log(`🚀 API running at http://${host}:${port}`);
  });
})();
