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
  const indexFile = path.join(distPath, "index.html");

  // Dynamic, SPA-only routes that are intentionally NOT prerendered: the
  // auth-gated admin console. These must fall through to the SPA shell
  // (index.html, 200) so the client router renders them — never the prerendered
  // 404. (The token-gated NDA signing route is handled explicitly below so its
  // shared links unfurl with a clean, private preview instead of "Page Not
  // Found".)
  const spaRoutePrefixes = ["/vendorlists", "/admin"];

  // Inject a clean, private (noindex) preview into the SPA shell for the
  // token-gated NDA signing page — the shell itself carries no static meta
  // (it's set client-side), so shared links would otherwise unfurl blank.
  const SIGN_META = [
    `<title>Sign your Mutual NDA · Digital Therapy</title>`,
    `<meta name="description" content="Review and electronically sign your mutual non-disclosure agreement with Digital Therapy." />`,
    `<meta name="robots" content="noindex, nofollow" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="Sign your Mutual NDA · Digital Therapy" />`,
    `<meta property="og:description" content="Review and electronically sign your mutual non-disclosure agreement with Digital Therapy." />`,
    `<meta property="og:image" content="https://www.digitaltherapy.io/og-image.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="Sign your Mutual NDA · Digital Therapy" />`,
    `<meta name="twitter:description" content="Review and electronically sign your mutual non-disclosure agreement with Digital Therapy." />`,
    `<meta name="twitter:image" content="https://www.digitaltherapy.io/og-image.png" />`,
  ].join("\n    ");
  let _signingShell: string | null | undefined;
  const signingShell = (): string | null => {
    if (_signingShell !== undefined) return _signingShell;
    try {
      _signingShell = fs.readFileSync(indexFile, "utf8").replace("</head>", `  ${SIGN_META}\n  </head>`);
    } catch {
      _signingShell = null;
    }
    return _signingShell;
  };

  app.get("*", (req: Request, res: Response, next: NextFunction) => {
    const p = req.path;
    // Let static/SPA handle root and asset files (anything with an extension).
    // We intentionally do NOT gate on the Accept header: crawlers/social
    // scrapers send a mix of "text/html" and "*/*", and serving the prerendered
    // file directly (200) for both /thesis and /thesis/ avoids a 301 to the
    // non-canonical trailing-slash URL.
    if (p === "/" || path.extname(p)) return next();

    // Token-gated NDA signing → serve the SPA shell (200) with injected private
    // preview meta, so the SPA renders it and shared links unfurl cleanly.
    if (p === "/nda/sign" || p.startsWith("/nda/sign/")) {
      const shell = signingShell();
      if (shell) return res.status(200).type("html").send(shell);
      return next(); // shell unreadable → plain SPA fallback
    }

    // Other SPA-only dynamic routes → fall through to the SPA shell (200), not the 404.
    if (spaRoutePrefixes.some((pre) => p === pre || p.startsWith(pre + "/"))) return next();

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
