/**
 * Vendor offer letters — invite Vendor Program members onto a signed client
 * engagement. The admin pastes the vendor line items from the "Vendor Offer
 * Letter & Onboarding Kit" doc, fills the engagement fact sheet, and hits
 * "Send Offer Letters": each vendor is emailed a single-vendor link
 * (/offer/:token) where they (1) e-sign the letter, (2) confirm or edit their
 * ACH info and (3) book a 30-minute technology onboarding with Milton.
 *
 * The letter text is snapshotted at send so the signed copy is immutable. ACH
 * reuses vendorPaymentInfo (account number encrypted at rest; the page only
 * ever sees bank name, account type and last 4). Email goes through the portal
 * relay (best-effort), like NDAs.
 */
import crypto from "crypto";
import {
  renderOfferLetter,
  TECH_ONBOARDING_AGENDA,
  TECH_ONBOARDING_HOST,
  type OfferEngagement,
  type OfferVendorRow,
} from "../shared/offerTemplate";
import { sendEmailViaRelay } from "./portal";
import {
  getPaymentInfoSummary,
  upsertPaymentInfo,
  verifyVendorNameMatch,
  type PaymentInfoInput,
} from "./vendorPaymentInfo";
import { findVendorByEmail, getPool } from "./vendors";

const SITE_BASE = (process.env.PUBLIC_BASE_URL || "https://www.digitaltherapy.io").replace(/\/$/, "");
const offerLink = (token: string) => `${SITE_BASE}/offer/${token}`;
const newToken = () => crypto.randomBytes(24).toString("base64url");
const REPLY_TO = "hello@digitaltherapy.io";

/** Milton's booking page for the technology onboarding. Unset -> the page tells
 * the vendor Milton will email times. */
export const techOnboardingUrl = () => (process.env.TECH_ONBOARDING_BOOKING_URL || "").trim() || null;

let _ready = false;
async function ensureOfferSchema() {
  const pool = getPool();
  if (!pool) return null;
  if (_ready) return pool;
  await pool.query(`CREATE SCHEMA IF NOT EXISTS dt_site`);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.vendor_offer (
       id serial PRIMARY KEY,
       token text NOT NULL UNIQUE,
       vendor_application_id text NOT NULL,
       vendor_name text NOT NULL,
       vendor_email text NOT NULL,
       client_name text NOT NULL,
       project_name text,
       engagement jsonb NOT NULL,
       line_item jsonb NOT NULL,
       body jsonb NOT NULL,
       status text NOT NULL DEFAULT 'sent',
       sent_at timestamptz NOT NULL DEFAULT now(),
       signed_at timestamptz,
       signature_text text,
       signed_ip text,
       signed_user_agent text,
       ach_confirmed_at timestamptz,
       booking_opened_at timestamptz,
       created_at timestamptz NOT NULL DEFAULT now())`,
  );
  await pool.query(`CREATE INDEX IF NOT EXISTS vendor_offer_vendor_idx ON dt_site.vendor_offer (vendor_application_id)`);
  _ready = true;
  return pool;
}

const iso = (d: unknown) => (d ? (d instanceof Date ? d.toISOString() : String(d)) : null);

export type SendOffersResult = {
  sent: { vendorName: string; vendorEmail: string; link: string; emailed: boolean }[];
  skipped: { vendorName: string; vendorEmail: string; reason: string }[];
};

/** Create one offer per vendor row and email each its acceptance link. A row
 * whose email doesn't match a Vendor Program record is skipped (offers go only
 * to onboarded vendors, and ACH is keyed to the vendor record). */
export async function sendOffers(engagement: OfferEngagement, rows: OfferVendorRow[]): Promise<SendOffersResult | null> {
  const pool = await ensureOfferSchema();
  if (!pool) return null;
  const result: SendOffersResult = { sent: [], skipped: [] };
  for (const row of rows) {
    const label = { vendorName: row.vendorName, vendorEmail: row.vendorEmail };
    if (!row.vendorEmail) {
      result.skipped.push({ ...label, reason: "No email in the Vendor column." });
      continue;
    }
    const vendor = await findVendorByEmail(row.vendorEmail);
    if (!vendor) {
      result.skipped.push({ ...label, reason: "No Vendor Program record with this email." });
      continue;
    }
    const vendorName = row.vendorName || vendor.vendor.name;
    const line = { ...row, vendorName };
    const body = renderOfferLetter(engagement, line);
    const token = newToken();
    await pool.query(
      `INSERT INTO dt_site.vendor_offer
         (token, vendor_application_id, vendor_name, vendor_email, client_name, project_name, engagement, line_item, body)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        token,
        vendor.vendor.id,
        vendorName,
        row.vendorEmail,
        engagement.clientName,
        engagement.projectName || null,
        JSON.stringify(engagement),
        JSON.stringify(line),
        JSON.stringify(body),
      ],
    );
    const link = offerLink(token);
    const subject = `Project offer: ${engagement.projectName || engagement.clientName} for ${engagement.clientName}`;
    const mail = await sendEmailViaRelay({
      to: row.vendorEmail,
      subject,
      html:
        body.map((p) => `<p>${escapeHtml(p)}</p>`).join("") +
        `<p><a href="${link}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#0A65FF;color:#fff;text-decoration:none;font-weight:600">Click to accept offer</a></p>` +
        `<p>Digital Therapy · ${REPLY_TO}</p>`,
      text: `${body.join("\n\n")}\n\nClick to accept offer: ${link}\n\nDigital Therapy · ${REPLY_TO}`,
      replyTo: REPLY_TO,
      tags: ["offer", "invite"],
    });
    result.sent.push({ ...label, vendorName, link, emailed: mail.ok });
  }
  return result;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

async function offerRow(token: string) {
  const pool = await ensureOfferSchema();
  if (!pool) return null;
  return (await pool.query(`SELECT * FROM dt_site.vendor_offer WHERE token=$1`, [token])).rows[0] ?? null;
}

/** Public: everything the acceptance page needs for one token. */
export async function getOfferByToken(token: string) {
  const o = await offerRow(token);
  if (!o) return null;
  const ach = await getPaymentInfoSummary(o.vendor_application_id);
  return {
    status: o.status as string,
    vendorName: o.vendor_name as string,
    clientName: o.client_name as string,
    projectName: (o.project_name as string) ?? "",
    body: o.body as string[],
    signed: Boolean(o.signed_at),
    signedAt: iso(o.signed_at),
    ach: ach
      ? { bankName: ach.bankName, accountType: ach.accountType, last4: ach.accountNumberLast4 }
      : null,
    achConfirmed: Boolean(o.ach_confirmed_at),
    bookingOpened: Boolean(o.booking_opened_at),
    onboarding: { host: TECH_ONBOARDING_HOST, agenda: TECH_ONBOARDING_AGENDA, bookingUrl: techOnboardingUrl() },
  };
}

/** Public: e-sign. The typed signature must match the vendor's name. */
export async function signOffer(
  token: string,
  signatureText: string,
  ip: string | null,
  userAgent: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const o = await offerRow(token);
  if (!o) return { ok: false, error: "This offer link is invalid." };
  if (o.status === "void") return { ok: false, error: "This offer has been withdrawn." };
  if (o.signed_at) return { ok: true };
  if (signatureText.trim().toLowerCase() !== String(o.vendor_name).trim().toLowerCase()) {
    return { ok: false, error: "Your typed signature must match your name exactly." };
  }
  await getPool()!.query(
    `UPDATE dt_site.vendor_offer SET status='signed', signed_at=now(), signature_text=$2, signed_ip=$3, signed_user_agent=$4
      WHERE id=$1 AND signed_at IS NULL`,
    [o.id, signatureText.trim(), ip, userAgent],
  );
  await sendEmailViaRelay({
    to: REPLY_TO,
    subject: `Offer accepted: ${o.vendor_name} · ${o.project_name || o.client_name}`,
    text: `${o.vendor_name} e-signed their offer for ${o.client_name} (${o.project_name ?? ""}) on ${new Date().toISOString()}.`,
    tags: ["offer", "signed"],
  });
  return { ok: true };
}

/** Public: vendor confirms the ACH info already on file (signed offers only). */
export async function confirmOfferAch(token: string): Promise<{ ok: boolean; error?: string }> {
  const o = await offerRow(token);
  if (!o || !o.signed_at) return { ok: false, error: "Please sign the offer first." };
  if (!(await getPaymentInfoSummary(o.vendor_application_id))) return { ok: false, error: "No payment info on file." };
  await getPool()!.query(`UPDATE dt_site.vendor_offer SET ach_confirmed_at=now() WHERE id=$1`, [o.id]);
  return { ok: true };
}

/** Public: vendor enters new ACH info (signed offers only). Same rules as the
 * standalone payment form: business account attested + name must match. */
export async function updateOfferAch(token: string, input: PaymentInfoInput): Promise<{ ok: boolean; error?: string }> {
  const o = await offerRow(token);
  if (!o || !o.signed_at) return { ok: false, error: "Please sign the offer first." };
  if (!input.businessAccountAttested) return { ok: false, error: "You must confirm this is a business bank account." };
  const nameError = await verifyVendorNameMatch(o.vendor_application_id, input.vendorName);
  if (nameError) return { ok: false, error: nameError };
  await upsertPaymentInfo(o.vendor_application_id, input, "vendor_self_service");
  await getPool()!.query(`UPDATE dt_site.vendor_offer SET ach_confirmed_at=now() WHERE id=$1`, [o.id]);
  return { ok: true };
}

/** Public: record that the vendor opened Milton's booking page. */
export async function markOfferBooking(token: string): Promise<{ ok: boolean }> {
  const o = await offerRow(token);
  if (!o || !o.signed_at) return { ok: false };
  await getPool()!.query(
    `UPDATE dt_site.vendor_offer SET booking_opened_at=COALESCE(booking_opened_at, now()) WHERE id=$1`,
    [o.id],
  );
  return { ok: true };
}

/** Admin: every offer, newest first, with each step's progress. */
export async function listOffers() {
  const pool = await ensureOfferSchema();
  if (!pool) return [];
  const rows = (await pool.query(`SELECT * FROM dt_site.vendor_offer ORDER BY sent_at DESC LIMIT 500`)).rows;
  return rows.map((o) => ({
    id: o.id as number,
    vendorName: o.vendor_name as string,
    vendorEmail: o.vendor_email as string,
    clientName: o.client_name as string,
    projectName: (o.project_name as string) ?? "",
    role: ((o.line_item as OfferVendorRow)?.role as string) ?? "",
    offeredTotal: ((o.line_item as OfferVendorRow)?.offeredTotal as string) ?? "",
    status: o.status as string,
    sentAt: iso(o.sent_at),
    signedAt: iso(o.signed_at),
    achConfirmedAt: iso(o.ach_confirmed_at),
    bookingOpenedAt: iso(o.booking_opened_at),
    link: offerLink(o.token),
  }));
}

/** Admin: withdraw an unsigned offer (its link stops accepting signatures). */
export async function voidOffer(id: number): Promise<boolean> {
  const pool = await ensureOfferSchema();
  if (!pool) return false;
  const r = await pool.query(`UPDATE dt_site.vendor_offer SET status='void' WHERE id=$1 AND signed_at IS NULL`, [id]);
  return (r.rowCount ?? 0) > 0;
}
