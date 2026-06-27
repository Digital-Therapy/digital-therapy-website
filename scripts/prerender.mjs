// Build-time prerender for the Digital Therapy SPA.
//
// Runs AFTER `pnpm run build` (vite -> dist/public). It:
//   1. serves dist/public locally (SPA fallback, /api/* -> 404 so tRPC fails fast)
//   2. uses Playwright/chromium to render each route to static HTML, so non-JS
//      crawlers + social scrapers get full content + React-19-hoisted meta tags
//   3. renders a branded 1200x630 og-image-v2.png
//   4. writes sitemap.xml
//
// Chromium is provided in the Docker build stage via
// `npx playwright install --with-deps chromium`. Not needed in the runtime image.

import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { promises as fs } from "node:fs";
import http from "node:http";
import express from "express";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "../dist/public");
const SITE_URL = "https://www.digitaltherapy.io";

// Keep in sync with client/src/lib/seo.ts (ROUTE_META). Titles/descriptions
// come from the rendered app; this list only drives which routes to prerender
// and the sitemap. noindex routes (e.g. /404) are intentionally excluded.
const ROUTES = [
  { path: "/", priority: 1.0 },
  { path: "/capabilities", priority: 0.9 },
  { path: "/process", priority: 0.8 },
  { path: "/dt-brain", priority: 0.8 },
  { path: "/thesis", priority: 0.7 },
  { path: "/partners", priority: 0.7 },
  { path: "/team", priority: 0.7 },
  { path: "/get-started", priority: 0.85 },
  { path: "/vendors", priority: 0.6 },
  { path: "/terms", priority: 0.2 },
  { path: "/privacy", priority: 0.2 },
  { path: "/accessibility", priority: 0.2 },
];

async function startStaticServer() {
  // Read the CLEAN built shell once and always serve it as the SPA fallback.
  // Critical: we overwrite dist/public/index.html (and write <route>/index.html)
  // as we go, so we must NOT let express.static serve those freshly-baked files
  // back as the shell -- otherwise a later route inherits the previous route's
  // baked-in <title>/meta and ends up with duplicate tags.
  const cleanShell = await fs.readFile(join(DIST, "index.html"), "utf8");
  const app = express();
  // tRPC / API calls during prerender have no backend -- fail fast, don't
  // hand back the SPA shell (which would make queries hang/retry).
  app.use("/api", (_req, res) => res.status(404).end());
  app.use(express.static(DIST, { index: false })); // assets only, never index.html
  app.use("*", (_req, res) => res.type("html").send(cleanShell));
  return new Promise((res) => {
    const server = http.createServer(app).listen(0, "127.0.0.1", () =>
      res({ server, port: server.address().port })
    );
  });
}

async function prerenderRoutes(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const { path } of ROUTES) {
    const url = `${baseUrl}${path}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Wait for React to render content + hoist metadata.
    await page.waitForFunction(
      () => {
        const root = document.getElementById("root");
        return !!root && root.childElementCount > 0 && !!document.title;
      },
      { timeout: 30000 }
    );
    await page.waitForTimeout(400); // settle late effects / metadata
    const html = "<!doctype html>\n" + (await page.content()).replace(/^<!doctype html>/i, "").trim();

    const outDir = path === "/" ? DIST : join(DIST, path);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(join(outDir, "index.html"), html, "utf8");
    console.log(`  prerendered ${path} -> ${join(outDir, "index.html").replace(DIST, "dist/public")}`);
  }
  // Prerender the 404 page to dist/public/404.html. Served with a real 404
  // status for unknown URLs (see server/prerender-serve.ts) so crawlers get a
  // hard 404 + noindex instead of a soft-404 of the home page.
  const p404 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await p404.goto(`${baseUrl}/404`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await p404.waitForFunction(
    () => {
      const root = document.getElementById("root");
      return !!root && root.childElementCount > 0 && !!document.title;
    },
    { timeout: 30000 }
  );
  await p404.waitForTimeout(400);
  const html404 = "<!doctype html>\n" + (await p404.content()).replace(/^<!doctype html>/i, "").trim();
  await fs.writeFile(join(DIST, "404.html"), html404, "utf8");
  await p404.close();
  console.log("  prerendered /404 -> dist/public/404.html");
}

const OG_CARD_HTML = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;padding:0}
  .card{width:1200px;height:630px;box-sizing:border-box;
    background:radial-gradient(1200px 630px at 75% 15%, #1456ff 0%, #0A65FF 38%, #013aa6 100%);
    color:#fff;font-family:'Manrope',sans-serif;position:relative;overflow:hidden;
    padding:80px 88px;display:flex;flex-direction:column;justify-content:space-between}
  .glow{position:absolute;width:760px;height:760px;border-radius:50%;
    background:radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 62%);
    right:-160px;top:-220px}
  .eyebrow{font-size:24px;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:#bfd6ff}
  .title{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:96px;line-height:1.02;
    letter-spacing:-0.01em;margin:0;max-width:1000px}
  .sub{font-size:30px;font-weight:500;color:#dce8ff;max-width:900px;margin:0}
  .brand{display:flex;align-items:center;gap:18px;font-size:30px;font-weight:800;letter-spacing:-0.01em}
  .dot{width:18px;height:18px;border-radius:50%;background:#fff}
  .row{display:flex;align-items:flex-end;justify-content:space-between}
</style></head>
<body>
  <div class="card">
    <div class="glow"></div>
    <div class="eyebrow">Digital Therapy</div>
    <div>
      <h1 class="title">The Private Operating Layer for Family Offices</h1>
    </div>
    <div class="row">
      <p class="sub">One trained team for data, workflow, reporting, automation &amp; security.</p>
      <div class="brand"><span class="dot"></span>digitaltherapy.io</div>
    </div>
  </div>
</body></html>`;

async function renderOgImage(browser) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(OG_CARD_HTML, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(300);
  const el = await page.$(".card");
  await el.screenshot({ path: join(DIST, "og-image-v2.png") });
  await page.close();
  console.log("  rendered og-image-v2.png (1200x630)");
}

// Dedicated share card for NDA signing links — a tri-party graphic
// (Client · Digital Therapy · Vendor) so emailed/texted links read clearly.
const NDA_OG_CARD_HTML = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;padding:0}
  .card{width:1200px;height:630px;box-sizing:border-box;
    background:radial-gradient(1200px 630px at 78% 18%, #1456ff 0%, #0A65FF 40%, #013aa6 100%);
    color:#fff;font-family:'Manrope',sans-serif;position:relative;overflow:hidden;
    padding:78px 84px;display:flex;align-items:center;justify-content:space-between;gap:48px}
  .glow{position:absolute;width:780px;height:780px;border-radius:50%;
    background:radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 62%);
    right:-200px;top:-260px}
  .left{max-width:600px;z-index:2}
  .eyebrow{font-size:23px;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:#bfd6ff}
  .title{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:82px;line-height:1.02;
    letter-spacing:-0.01em;margin:14px 0 0}
  .caption{font-size:27px;font-weight:600;color:#e3edff;margin:26px 0 0;letter-spacing:.01em}
  /* Tri-party graphic */
  .lobes{position:relative;width:430px;height:460px;flex:none;z-index:2}
  .lobe{position:absolute;border-radius:50%;display:flex;align-items:center;justify-content:center;
    box-shadow:inset 26px 26px 60px rgba(255,255,255,0.34), inset -30px -34px 70px rgba(1,30,110,0.6),
      0 24px 60px rgba(1,28,120,0.45);
    background:radial-gradient(circle at 34% 28%, #6f9bff 0%, #2f6bff 42%, #0a3fc6 100%)}
  .lobe span{font-weight:800;font-size:30px;color:#fff;text-shadow:0 2px 6px rgba(1,20,80,0.45)}
  .client{width:208px;height:208px;left:120px;top:0}
  .dt{width:226px;height:226px;left:8px;top:182px}
  .vendor{width:208px;height:208px;left:214px;top:226px}
  .dt .dtmark{width:112px;height:auto;filter:drop-shadow(0 3px 9px rgba(1,20,80,0.4))}
</style></head>
<body>
  <div class="card">
    <div class="glow"></div>
    <div class="left">
      <div class="eyebrow">Digital Therapy</div>
      <h1 class="title">Mutual Non-Disclosure Agreement</h1>
      <p class="caption">Client &middot; Digital Therapy &middot; Vendor</p>
    </div>
    <div class="lobes">
      <div class="lobe client"><span>Client</span></div>
      <div class="lobe dt"><img class="dtmark" src="data:image/png;base64,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" alt="Digital Therapy"/></div>
      <div class="lobe vendor"><span>Vendor</span></div>
    </div>
  </div>
</body></html>`;

async function renderNdaOgImage(browser) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(NDA_OG_CARD_HTML, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(300);
  const el = await page.$(".card");
  await el.screenshot({ path: join(DIST, "nda-share.png") });
  await page.close();
  console.log("  rendered nda-share.png (1200x630)");
}

async function writeSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ROUTES.map(({ path, priority }) => {
    const loc = path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await fs.writeFile(join(DIST, "sitemap.xml"), xml, "utf8");
  console.log(`  wrote sitemap.xml (${ROUTES.length} urls)`);
}

async function main() {
  await fs.access(join(DIST, "index.html")); // ensure build ran
  const { server, port } = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    console.log("Prerendering routes...");
    await prerenderRoutes(browser, baseUrl);
    await renderOgImage(browser);
    await renderNdaOgImage(browser);
    await writeSitemap();
  } finally {
    await browser.close();
    server.close();
  }
  console.log("Prerender complete.");
}

main().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
