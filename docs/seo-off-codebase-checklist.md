# Off-codebase SEO + GEO checklist

> **Status of in-codebase work:** complete through items 1–7 of the original
> roadmap (llms.txt, JSON-LD graph, alt-text audit, explicit `width`/`height`,
> robots AI-bot allowlist, ProfessionalService schema, Article schema on Thesis).
> See git history (`SEO/GEO`-prefixed commits) for the trail.
>
> Everything below is **work that happens in third-party dashboards, not in
> this repo**. Each section gives you the exact path through the UI plus any
> repo-side action you need to take (e.g., pasting a verification token).

---

## 1. Google Search Console — 15 minutes

**Why:** Google indexes faster with explicit ownership + sitemap submission.
Search Console also exposes the click-through-rate and indexing-coverage
reports you need to measure whether the SEO work is moving the needle.

### Steps

1. Open <https://search.google.com/search-console>.
2. Click **Add property** (top-left dropdown).
3. Choose **Domain** (recommended — covers `www.` and `non-www.` and all
   subdomains in one property). If your DNS provider does not support TXT
   records easily, fall back to **URL prefix** with `https://www.digitaltherapy.io/`.
4. **Verification (Domain method)** — Google gives you a TXT record to add
   to the DNS zone for `digitaltherapy.io`. Add it at the DNS host
   (Cloudflare / Namecheap / Route 53 / wherever the domain lives).
5. **Verification (URL-prefix method, alternative)** — Google gives you a
   `<meta name="google-site-verification" content="..." />` tag. Open
   `client/index.html`, find the placeholder block at the top of `<head>`,
   uncomment the Google line, paste the token between the quotes, commit, push.
   ```html
   <meta name="google-site-verification" content="PASTE_GSC_TOKEN_HERE" />
   ```
   Wait for the deploy to ship before clicking **Verify** in Search Console.
6. Once verified, in Search Console go to **Sitemaps** (left nav).
7. Paste `sitemap.xml` (relative path) and click **Submit**. The sitemap
   serves at <https://www.digitaltherapy.io/sitemap.xml> already.
8. (Optional) Submit `/llms.txt` as a URL inspection if you want Google to
   verify it loads — it does not influence Google ranking directly but it is
   a free sanity check.

### What to watch

- **Indexing > Pages** — should show ~12 indexable pages after a few days.
- **Performance** — total impressions + clicks; queries the site is showing
  up for.
- **Experience > Core Web Vitals** — the LCP / INP / CLS metrics. Should
  improve markedly with the WebP and CLS work that already shipped.

---

## 2. Bing Webmaster Tools — 10 minutes

**Why:** Bing's index also feeds DuckDuckGo, Yahoo Search, and the live web
results inside ChatGPT (Bing is OpenAI's web partner). So Bing visibility
directly affects how often your site is cited in AI answers.

### Steps

1. Open <https://www.bing.com/webmasters>.
2. Sign in (Microsoft account).
3. Click **Add a site** → enter `https://www.digitaltherapy.io/`.
4. Choose **HTML Meta Tag** verification. Bing gives you
   `<meta name="msvalidate.01" content="..." />`.
5. Open `client/index.html`, uncomment the Bing line in the placeholder
   block, paste the token, commit, push.
6. Wait for deploy, then click **Verify** in Bing Webmaster Tools.
7. **Sitemaps** (left nav) → enter `https://www.digitaltherapy.io/sitemap.xml`
   → **Submit**.

### Pro tip

In Bing Webmaster Tools → **Configure My Site** → **Site Preferences**, set
the preferred URL form to `https://www.digitaltherapy.io/` (with the `www`)
so all variants consolidate.

---

## 3. Google Business Profile — 20 minutes

**Why:** Even without a walk-in storefront, a registered profile triggers a
knowledge-panel sidebar in Google search results for "Digital Therapy NYC"
and related queries. Family-office prospects researching the firm see a
polished panel with phone, website, hours, and reviews.

### Steps

1. Open <https://www.google.com/business/>.
2. Click **Manage now** → enter `Digital Therapy`.
3. **Business category** — choose `Business management consultant` (closest
   match for family-office consulting).
4. **Service area** — choose "I deliver goods and services to my customers"
   → add `New York, NY` as the primary service area. Toggle **I don't want
   to show my address publicly** if you do not want the 115 E 89th St
   listing visible — the address is still used for verification, just hidden
   from search results.
5. **Contact info** — phone `917-495-0455`, website `https://www.digitaltherapy.io/`.
6. **Verification** — Google will ask to mail a postcard to the address with
   a PIN. Takes 5–10 days.

### Profile copy to paste during setup

**Short description (250-char limit):**

> Digital Therapy builds the private operating layer for modern family
> offices. Fusion Teams combining Operations, Accounting, and Technology
> deploy on-site for the first month of every engagement.

**Long description (750-char limit):**

> Digital Therapy is a New York consulting firm delivering family-office
> transformation through Fusion Teams — small, cross-disciplinary units of
> Operations, Accounting, and Technology subject-matter experts who train
> together, deploy together, and stay accountable together. Engagements
> start with a four-week Discovery phase on-site. From there, Digital
> Therapy designs and builds the data warehouse, accounting transformation,
> automation, reporting, and on-premises AI infrastructure (DT Brain) the
> family office needs to operate at scale. Clients include multi-entity
> family offices and the portfolio companies they own.

**Services to add (each gets its own service card):**

- Entity + Cashflow Mapping
- Warehouse & Data Aggregation
- Accounting Systems Transformation (Close Acceleration, AP, AR)
- Single Pane of Glass Reporting
- Document Automation (OCR + AI)
- Insights & Reporting
- DT Brain — On-Premises Automation Hub
- Family-Office Discovery (4-week on-site engagement)

**Photos to upload:**

- `client/public/dtlogo.webp` — the wordmark
- `client/public/welcome-hero.webp` — hero image
- `client/public/dt-talk-to-your-data.webp` — dashboard
- `client/public/team/jon.avif` — Jonathan headshot
- `client/public/team/milton.webp` — Milton headshot
- `client/public/team/hunter.webp` — Hunter headshot

**Hours:** Mon–Fri 9 am – 6 pm ET (or whatever you actually keep — Google
displays this verbatim).

---

## 4. Baseline Lighthouse benchmark — 5 minutes

**Why:** You need a "before" number so the SEO + performance work has a
measurable delta. Run this **today** so future audits can show the lift.

### Option A — Chrome DevTools (easiest)

1. Open `https://www.digitaltherapy.io/` in Chrome (desktop, incognito so
   extensions do not skew results).
2. Open DevTools (`Cmd+Option+I`).
3. **Lighthouse** tab → check Performance + Accessibility + Best Practices
   + SEO + Mobile preset → **Analyze page load**.
4. Save the report (`...` menu → Save as HTML) into `docs/lighthouse/`
   with today's date in the filename. Repeat for `/capabilities`, `/team`,
   `/thesis` so you have a per-route baseline.

### Option B — PageSpeed Insights (no install)

Open <https://pagespeed.web.dev/> → paste `https://www.digitaltherapy.io/`
→ **Analyze**. Get separate Mobile + Desktop scores plus actionable
recommendations.

### Targets after the recent work

- **Performance:** ≥ 90 on desktop, ≥ 75 on mobile (the WebP + CLS work
  should put you here).
- **SEO:** ≥ 95 (per-route meta + JSON-LD + sitemap + robots all in place).
- **Accessibility:** ≥ 95 (every `<img>` has alt; semantic headings; brand
  contrast meets WCAG AA except a few intentional muted-text exceptions
  worth reviewing).
- **Best Practices:** ≥ 95.

If anything is below target, capture the Lighthouse "Opportunities" list
and we will work through them in the next pass.

---

## 5. Cloudflare Polish + Mirage (only if the site is fronted by Cloudflare)

**Why:** Belt-and-suspenders image optimization at the edge — catches any
future image regression automatically. Free on the Free plan.

### Steps

1. Open Cloudflare dashboard → select the `digitaltherapy.io` zone.
2. **Speed → Optimization → Image Optimization**.
3. Turn on:
   - **Polish** → set to **Lossy** (best size savings; visually identical for
     this site's photography). Toggle **WebP** on (transparent fallback if
     the browser does not support it).
   - **Mirage** → on (lazy-loads images for mobile clients automatically).
4. **Speed → Optimization → Content Optimization → Brotli** → on (already
   default; verify).
5. **Caching → Configuration → Browser Cache TTL** → 4 hours minimum (Vite's
   content-hashed bundles are immutable; longer TTL is fine).

After enabling Polish, re-run a Lighthouse audit a day later — Polish
typically shaves another 10–20% off image bytes on top of the WebP work
already in the bundle.

---

## Quick wins to monitor weekly

| Metric | Where | Target |
|---|---|---|
| Indexed pages | Search Console > Pages | 12+ |
| Total impressions (28-day) | Search Console > Performance | grow week-over-week |
| Top queries | Search Console > Performance | start including "fusion team", "family office transformation", named leaders |
| Core Web Vitals — LCP | Search Console > Experience | "Good" (< 2.5 s) |
| Core Web Vitals — CLS | Search Console > Experience | "Good" (< 0.1) |
| Mobile Lighthouse Perf | PageSpeed Insights | ≥ 75 |
| Bing indexed pages | Bing Webmaster Tools > Sitemaps | 12+ |
| LLM citation visibility | Ask ChatGPT/Claude/Perplexity "what is Digital Therapy" | site appears in answer with link |

---

## When to re-run this checklist

Once a quarter, or after any of:
- A major copy rewrite on a primary page (Capabilities / Process / Thesis)
- A page rename or URL change (would break sitemap + canonical entries)
- Adding a new public route (needs sitemap entry + RouteSeo metadata)
- New leadership hires (need Person nodes added to the JSON-LD graph)
- Closing or migrating the New York address (LocalBusiness fields stale)
