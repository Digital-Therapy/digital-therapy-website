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
  .dt svg{width:96px;height:60px}
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
      <div class="lobe dt">
        <svg viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 9 C8 6 10 5 13 7 L29 18 C31 19.5 33 19.5 35 18 L51 7 C54 5 56 6 56 9 L56 31 C56 34 54 35 51 33 L35 22 C33 20.5 31 20.5 29 22 L13 33 C10 35 8 34 8 31 Z" stroke="#fff" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>
      </div>
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
