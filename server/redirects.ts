/**
 * Short-link redirects — vanity paths on digitaltherapy.io that forward to
 * long upstream URLs (scheduling pages, hosted docs, partner portals, etc.).
 *
 * Each entry is a 302 (temporary) by default so the destination can be
 * rotated without breaking cached clients. Use 301 for truly permanent
 * aliases (rare). Keep the map alphabetized by path to make merges easier.
 *
 * Registered in server/_core/index.ts BEFORE the Vite dev middleware and
 * BEFORE registerPrerendered, so the short link beats both the SPA fallback
 * and any baked prerender for that path.
 */
import type { Express, Request, Response } from "express";

type Redirect = {
  /** Vanity path on digitaltherapy.io, e.g. "/book". Leading slash required. */
  from: string;
  /** Full target URL including scheme. */
  to: string;
  /** 301 (permanent, cacheable) or 302 (temporary, default). */
  status?: 301 | 302;
};

const SHORT_LINKS: Redirect[] = [
  {
    // Public scheduling page — booking calendar for Digital Therapy intro
    // conversations. Short URL used in email signatures, decks, business
    // cards. Destination can be rotated without reprinting materials.
    from: "/book",
    to: "https://calendar.google.com/appointments/schedules/AcZssZ3kquxyOjzRtERnat4l82_l1fAJbuNFl0SuRX1mWC-GMhGhszD1M0uQuSKWL6_4Rd9jTrrAO6ba",
  },
];

export function registerShortLinks(app: Express) {
  for (const entry of SHORT_LINKS) {
    const status = entry.status ?? 302;
    app.get(entry.from, (_req: Request, res: Response) => {
      res.redirect(status, entry.to);
    });
  }
}
