import express from "express";
import path from "path";
import fs from "fs";

export function serveFrontend(app: express.Express) {
  const distPath = path.resolve(process.cwd(), "../client/dist"); // [cite: 329]

  if (!fs.existsSync(distPath)) { // [cite: 330]
    console.warn(
      `
      ===================================================================
      
      WARNING: Frontend build not found at: ${distPath}.
      API will run, but the frontend will not be served by this server.
      Make sure to run 'npm run build' in the /client directory.
      
      ===================================================================
      `
    );
    return;
  }

  // 1. Serve static files (JS, CSS, images) from the 'dist' directory
  app.use(express.static(distPath)); // [cite: 331]

  // 2. This is the crucial part for a Single Page Application (SPA).
  // Any GET request that doesn't match a static file or an API route
  // will be handled here. We send back the main index.html file,
  // and the frontend router (wouter) takes over from there.
  app.get("*", (_req, res) => { // [cite: 331]
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}