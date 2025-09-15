// client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional Replit plugins — require them only if present
let runtimeErrorOverlay: any = null;
let cartographer: any = null;
let devBanner: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  runtimeErrorOverlay = require("@replit/vite-plugin-runtime-error-modal");
} catch (_) {}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cartoPkg = require("@replit/vite-plugin-cartographer");
  cartographer = cartoPkg?.cartographer ?? null;
} catch (_) {}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bannerPkg = require("@replit/vite-plugin-dev-banner");
  devBanner = bannerPkg?.devBanner ?? null;
} catch (_) {}

export default defineConfig(() => {
  const isDev =
    typeof process !== "undefined" && process.env.NODE_ENV !== "production";

  const optionalReplPlugins = isDev
    ? [
        cartographer ? cartographer() : null,
        devBanner ? devBanner() : null,
      ].filter(Boolean)
    : [];

  return {
    plugins: [
      react(),
      runtimeErrorOverlay ? runtimeErrorOverlay() : null,
      ...optionalReplPlugins,
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@assets": path.resolve(__dirname, "attached_assets"),

      },
    },

    build: {
      outDir: "dist", // client/dist
      emptyOutDir: true,
    },

    server: {
      host: "0.0.0.0",
      port: 5173,
      allowedHosts: true as const, // ✅ fix overload typing
      fs: {
        strict: true,
        deny: ["**/.*"],
        allow: ["."],
      },
    },
  };
});
