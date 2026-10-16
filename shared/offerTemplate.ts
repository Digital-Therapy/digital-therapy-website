/**
 * Vendor offer letters — the wording sent to Vendor Program members invited
 * onto a signed client engagement, plus the parser for vendor rows pasted from
 * the "Vendor Offer Letter & Onboarding Kit" doc's line-items table. Shared so
 * the admin preview, the public acceptance page and the server snapshot all
 * render the exact same letter.
 */

export type OfferEngagement = {
  clientName: string;
  clientObjective: string;
  projectName: string;
  kickoffDate: string;
  completionDate: string;
  projectLead: string;
  responseDeadline: string;
  paymentTerms: string;
};

export type OfferVendorRow = {
  vendorName: string;
  vendorEmail: string;
  role: string;
  pricingModel: string;
  requested: string;
  offered: string;
  offeredTotal: string;
};

export const TECH_ONBOARDING_HOST = "Milton Rodas";

export const TECH_ONBOARDING_AGENDA = [
  "How DT's Ops eco-system works",
  "How to access DT portals & tools",
  "The DT-VPN | Download & Setup",
  "Software Seats / Access Reqs",
  "Your system vs. Our system - How can we honor both of our procedures & policies? Let's talk.",
];

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name.trim();

/** The compensation sentence. Mentions the vendor's original request only when
 * the offer differs from it (fees adjusted to close the client deal). */
export function compensationParagraph(v: OfferVendorRow): string {
  const total = v.offeredTotal.trim() || v.offered.trim();
  const basis = v.offered.trim() && v.offered.trim() !== total ? ` (${v.offered.trim()})` : "";
  const hourly = /hour/i.test(v.pricingModel);
  const adjusted = v.requested.trim() && v.offered.trim() && v.requested.trim() !== v.offered.trim();
  const base = hourly
    ? `The budget for this role is ${total}${basis}. Please track your hours and flag us before you reach 80% of the budget; work beyond the estimated hours needs written approval in advance.`
    : `For this role, Digital Therapy will pay a fixed project fee of ${total}${basis}.`;
  return adjusted
    ? `Thank you for your estimate of ${v.requested.trim()}. To close this engagement, Digital Therapy adjusted fees across the project team. ${base}`
    : base;
}

/** The full letter as paragraphs (first = greeting). */
export function renderOfferLetter(e: OfferEngagement, v: OfferVendorRow): string[] {
  const client = e.clientName.trim();
  const objective = e.clientObjective.trim().replace(/\.$/, "");
  const paras = [
    `Hi ${firstName(v.vendorName)},`,
    `Thanks for being a part of Digital Therapy's Vendor Program. We're pleased to invite you to collaborate on our signed engagement with ${client}.` +
      (objective ? ` ${client} seeks to ${objective.charAt(0).toLowerCase()}${objective.slice(1)}.` : ""),
  ];
  if (v.role.trim()) paras.push(`Your role: we'd like you to serve as ${v.role.trim()} on ${e.projectName.trim() || "this project"}.`);
  if (e.kickoffDate.trim() || e.completionDate.trim()) {
    paras.push(
      `Timeline: the project kicks off ${e.kickoffDate.trim() || "on a date we'll confirm"}` +
        (e.completionDate.trim() ? `, with a target completion of ${e.completionDate.trim()}.` : "."),
    );
  }
  paras.push(`Compensation: ${compensationParagraph(v)}` + (e.paymentTerms.trim() ? ` Payment terms: ${e.paymentTerms.trim()}.` : ""));
  if (e.projectLead.trim()) paras.push(`Working together: ${e.projectLead.trim()} will lead the engagement and be your day-to-day contact.`);
  paras.push(
    `Next step: please review and accept this offer` +
      (e.responseDeadline.trim() ? ` by ${e.responseDeadline.trim()}` : "") +
      `. If anything about the scope, hours or fee needs discussion, reply before then and we'll work it out.`,
  );
  paras.push("We're glad to have you on the team.");
  return paras;
}

const EMAIL_RE = /[^\s,;|<>()]+@[^\s,;|<>()]+\.[a-z]{2,}/i;
const HEADER_RE = /^vendor\b/i;

/** Parse vendor rows pasted from the doc's line-items table (tab-separated, as
 * copied from a table; or comma-free pipe tables). Columns, in order: Vendor
 * (name, email) · Role · Pricing model · Requested · Offered · Offered total ·
 * Offer status (ignored). Header and blank rows are skipped. */
export function parseVendorRows(pasted: string): OfferVendorRow[] {
  const rows: OfferVendorRow[] = [];
  for (const raw of pasted.split(/\r?\n/)) {
    // Trim only spaces/newlines at the edges: a leading tab means an empty
    // Vendor cell, which must stay in column 0.
    const line = raw.replace(/^[ \r]+|[ \r]+$/g, "").replace(/^\||\|$/g, "");
    if (!line.trim() || /^[-|:\s]+$/.test(line)) continue;
    const cells = (line.includes("\t") ? line.split("\t") : line.split("|")).map((c) =>
      c.trim().replace(/^`|`$/g, ""),
    );
    if (HEADER_RE.test(cells[0] ?? "") && /role/i.test(cells[1] ?? "")) continue;
    const vendorCell = cells[0] ?? "";
    const email = vendorCell.match(EMAIL_RE)?.[0] ?? "";
    const name = vendorCell.replace(email, "").replace(/[,;|<>()]+\s*$/, "").replace(/[<(]\s*$/, "").trim();
    if (!name && !email) continue;
    rows.push({
      vendorName: name,
      vendorEmail: email,
      role: cells[1] ?? "",
      pricingModel: cells[2] ?? "",
      requested: cells[3] ?? "",
      offered: cells[4] ?? "",
      offeredTotal: cells[5] ?? "",
    });
  }
  return rows;
}
