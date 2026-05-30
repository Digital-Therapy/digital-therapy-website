import type { Express, Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

/**
 * Serves the build-time prerendered per-route HTML (scripts/prerender.mjs ->
 * dist/public/<route>/index.html) for navigation requests WITHOUT a trailing
 * slash, e.g. GET /thesis -> dist/public/thesis/index.html with a 200 (no
 * redirect). This matters because crawlers + social scrapers request the
 * no-slash URL (which is also our canonical), and express.static would
 * otherwise 301 it to /thesis/ or the SPA fallback would hand back the generic
 * shell. Must be registered BEFORE serveStatic.
 *
 * distPath mirrors serveStatic in server/_core/vite.ts (same bundle dir).
 */
export function registerPrerendered(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");

  const notFoundPage = path.join(distPath, "404.html");

  app.get("*", (req: Request, res: Response, next: NextFunction) => {
    const p = req.path;
    // Let static/SPA handle root and asset files (anything with an extension).
    // We intentionally do NOT gate on the Accept header: crawlers/social
    // scrapers send a mix of "text/html" and "*/*", and serving the prerendered
    // file directly (200) for both /thesis and /thesis/ avoids a 301 to the
    // non-canonical trailing-slash URL.
    if (p === "/" || path.extname(p)) return next();

    const clean = p.replace(/\/+$/, "");
    const file = path.join(distPath, clean, "index.html");
    // Guard against path traversal: resolved file must stay under distPath.
    if (!file.startsWith(distPath + path.sep)) return next();

    fs.access(file, fs.constants.F_OK, (err) => {
      if (!err) return res.sendFile(file); // prerendered route -> 200

      // Unknown page: serve the prerendered 404 with a real 404 status (avoids
      // a soft-404 of the home shell). Fall through to the SPA if 404.html is
      // somehow missing.
      fs.access(notFoundPage, fs.constants.F_OK, (err404) => {
        if (err404) return next();
        res.status(404).sendFile(notFoundPage);
      });
    });
  });
}
