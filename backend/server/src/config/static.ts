//src/config/static.ts
import express from "express";
import path from "path";
import fs from "fs";

export function serveFrontend(app: express.Express) {
  const distPath = path.resolve(process.cwd(), "../client/dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `❌ Missing frontend build at: ${distPath}. Run 'npm run build' in /client first.`
    );
  }

  // Serve static files
  app.use(express.static(distPath));

  // Always return index.html for SPA routes
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
