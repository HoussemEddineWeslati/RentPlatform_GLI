// index.ts (at the root of your project)
import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import http from "http";
import { registerRoutes } from "./src/routes/index.js";
import { sessionMiddleware } from "./src/config/session.js";
import { serveFrontend } from "./src/config/static.js";

const app = express();

const defaultDevOrigins = ["http://localhost:5173", "http://localhost:3000"];
const allowedOrigins =
  process.env.ALLOWED_ORIGINS?.split(",").map((s) => s.trim()) ??
  (process.env.NODE_ENV === "development" ? defaultDevOrigins : []);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("trust proxy", 1);
app.use(sessionMiddleware);

// Request logging middleware (optional but good for debugging)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Register all API routes from the modular setup
registerRoutes(app);

// Serve the frontend build in production
if (process.env.NODE_ENV === "production") {
  serveFrontend(app);
}

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ success: false, message });
});

const server = http.createServer(app);
const port = parseInt(process.env.PORT || "5000", 10);
const host = "0.0.0.0";

server.listen(port, host, () => {
  console.log(`🚀 API server running at http://${host}:${port}`);
});