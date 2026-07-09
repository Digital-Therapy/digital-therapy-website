/**
 * Vendor Payment Info (ACH) — sensitive banking data collected so Digital
 * Therapy can pay vendors for project work.
 *
 * Security model:
 *   - `bank_name` + `routing_number` stored plaintext. Routing numbers are
 *     public per-bank identifiers; bank name is not sensitive.
 *   - `account_number` is encrypted at rest with AES-256-GCM under the
 *     PAYMENT_ENCRYPTION_KEY env var. Only the last 4 are stored plaintext for
 *     admin-side display.
 *   - Full account number is only decryptable via revealAccountNumber(), which
 *     is wired through an OWNER-only tRPC procedure (Milton / Karina).
 *   - Vendor self-service collection uses a single-use, 7-day-TTL token stored
 *     in dt_site.vendor_payment_token. The public form at
 *     /vendor/payment/:token verifies the token, accepts submission, and marks
 *     the token used.
 */
import crypto from "node:crypto";
import { ENV } from "./_core/env";
import { getPool } from "./vendors";

const CIPHER_ALGO = "aes-256-gcm";

/** Loads the encryption key from env. Throws with a clear message if missing. */
function loadKey(): Buffer {
  const raw = process.env.PAYMENT_ENCRYPTION_KEY ?? "";
  if (!raw) {
    throw new Error(
      "PAYMENT_ENCRYPTION_KEY is required for vendor-payment-info features. " +
        "Generate one with: node -e 'console.log(require(\"crypto\").randomBytes(32).toString(\"base64\"))' " +
        "and set it in .env.",
    );
  }
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error(
      `PAYMENT_ENCRYPTION_KEY must decode to 32 bytes (got ${buf.length}). It should be base64-encoded 256-bit key.`,
    );
  }
  return buf;
}

function encryptAccountNumber(plaintext: string): string {
  const key = loadKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(CIPHER_ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${ct.toString("base64")}`;
}

function decryptAccountNumber(payload: string): string {
  const key = loadKey();
  const parts = payload.split(":");
  if (parts.length !== 3) throw new Error("Malformed ciphertext payload");
  const [ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ct = Buffer.from(ctB64, "base64");
  const decipher = crypto.createDecipheriv(CIPHER_ALGO, key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}

// ─── DDL ────────────────────────────────────────────────────────────────────

let _ready = false;
async function ensureTables() {
  const pool = getPool();
  if (!pool) return null;
  if (_ready) return pool;
  await pool.query(`CREATE SCHEMA IF NOT EXISTS dt_site`);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.vendor_payment_info (
       vendor_application_id text PRIMARY KEY,
       bank_name text NOT NULL,
       routing_number text NOT NULL,
       account_number_last4 text NOT NULL,
       account_number_ciphertext text NOT NULL,
       created_via text NOT NULL,
       created_at timestamptz NOT NULL DEFAULT now(),
       updated_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.vendor_payment_token (
       id serial PRIMARY KEY,
       token text UNIQUE NOT NULL,
       vendor_application_id text NOT NULL,
       expires_at timestamptz NOT NULL,
       used_at timestamptz,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS vendor_payment_token_token_idx ON dt_site.vendor_payment_token (token)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS vendor_payment_token_vendor_idx ON dt_site.vendor_payment_token (vendor_application_id)`,
  );
  _ready = true;
  return pool;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type PaymentInfoSummary = {
  bankName: string;
  routingNumber: string;
  accountNumberLast4: string;
  createdVia: "admin_direct" | "vendor_self_service";
  createdAt: string;
  updatedAt: string;
};

export type PaymentInfoInput = {
  bankName: string;
  routingNumber: string;
  accountNumber: string;
};

export type PaymentToken = {
  id: number;
  token: string;
  vendorApplicationId: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};

// ─── Read ───────────────────────────────────────────────────────────────────

export async function getPaymentInfoSummary(vendorAppId: string): Promise<PaymentInfoSummary | null> {
  const pool = await ensureTables();
  if (!pool) return null;
  const r = await pool.query(
    `SELECT bank_name, routing_number, account_number_last4, created_via, created_at, updated_at
       FROM dt_site.vendor_payment_info
      WHERE vendor_application_id = $1`,
    [vendorAppId],
  );
  if (!r.rows.length) return null;
  const row = r.rows[0];
  return {
    bankName: row.bank_name,
    routingNumber: row.routing_number,
    accountNumberLast4: row.account_number_last4,
    createdVia: row.created_via,
    createdAt: (row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)) ?? "",
    updatedAt: (row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at)) ?? "",
  };
}

/** OWNER-only. Returns the decrypted full account number for a one-time reveal. */
export async function revealAccountNumber(vendorAppId: string): Promise<string | null> {
  const pool = await ensureTables();
  if (!pool) return null;
  const r = await pool.query(
    `SELECT account_number_ciphertext FROM dt_site.vendor_payment_info WHERE vendor_application_id = $1`,
    [vendorAppId],
  );
  if (!r.rows.length) return null;
  return decryptAccountNumber(r.rows[0].account_number_ciphertext);
}

// ─── Write ──────────────────────────────────────────────────────────────────

export async function upsertPaymentInfo(
  vendorAppId: string,
  input: PaymentInfoInput,
  via: "admin_direct" | "vendor_self_service",
): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  const account = input.accountNumber.replace(/\s+/g, "");
  const last4 = account.slice(-4);
  const ciphertext = encryptAccountNumber(account);
  await pool.query(
    `INSERT INTO dt_site.vendor_payment_info
       (vendor_application_id, bank_name, routing_number, account_number_last4, account_number_ciphertext, created_via)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (vendor_application_id) DO UPDATE
       SET bank_name = EXCLUDED.bank_name,
           routing_number = EXCLUDED.routing_number,
           account_number_last4 = EXCLUDED.account_number_last4,
           account_number_ciphertext = EXCLUDED.account_number_ciphertext,
           updated_at = now()`,
    [vendorAppId, input.bankName.trim(), input.routingNumber.replace(/\s+/g, ""), last4, ciphertext, via],
  );
  return true;
}

export async function deletePaymentInfo(vendorAppId: string): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(`DELETE FROM dt_site.vendor_payment_info WHERE vendor_application_id = $1`, [vendorAppId]);
  return true;
}

// ─── Tokens ─────────────────────────────────────────────────────────────────

const TOKEN_TTL_DAYS = 7;

export async function generatePaymentToken(vendorAppId: string): Promise<{ token: string; url: string; expiresAt: string } | null> {
  const pool = await ensureTables();
  if (!pool) return null;
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO dt_site.vendor_payment_token (token, vendor_application_id, expires_at)
     VALUES ($1, $2, $3)`,
    [token, vendorAppId, expiresAt],
  );
  const baseUrl = (process.env.PUBLIC_SITE_URL ?? "https://www.digitaltherapy.io").replace(/\/$/, "");
  return {
    token,
    url: `${baseUrl}/vendor/payment/${token}`,
    expiresAt: expiresAt.toISOString(),
  };
}

export type TokenLookupResult =
  | { ok: true; vendorApplicationId: string; expiresAt: string }
  | { ok: false; reason: "not_found" | "expired" | "used" };

/** Public — validates a token and returns the associated vendor id. */
export async function lookupPaymentToken(token: string): Promise<TokenLookupResult> {
  const pool = await ensureTables();
  if (!pool) return { ok: false, reason: "not_found" };
  const r = await pool.query(
    `SELECT vendor_application_id, expires_at, used_at
       FROM dt_site.vendor_payment_token
      WHERE token = $1`,
    [token],
  );
  if (!r.rows.length) return { ok: false, reason: "not_found" };
  const row = r.rows[0];
  if (row.used_at) return { ok: false, reason: "used" };
  const expiresAt = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at);
  if (expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };
  return {
    ok: true,
    vendorApplicationId: row.vendor_application_id,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function submitViaToken(token: string, input: PaymentInfoInput): Promise<{ ok: true } | { ok: false; reason: string }> {
  const pool = await ensureTables();
  if (!pool) return { ok: false, reason: "Database not available." };
  const lookup = await lookupPaymentToken(token);
  if (!lookup.ok) {
    if (lookup.reason === "expired") return { ok: false, reason: "This link has expired." };
    if (lookup.reason === "used") return { ok: false, reason: "This link has already been used." };
    return { ok: false, reason: "This link is invalid." };
  }
  await upsertPaymentInfo(lookup.vendorApplicationId, input, "vendor_self_service");
  await pool.query(`UPDATE dt_site.vendor_payment_token SET used_at = now() WHERE token = $1`, [token]);
  return { ok: true };
}

export async function listPaymentTokens(vendorAppId: string): Promise<PaymentToken[]> {
  const pool = await ensureTables();
  if (!pool) return [];
  const r = await pool.query(
    `SELECT id, token, vendor_application_id, expires_at, used_at, created_at
       FROM dt_site.vendor_payment_token
      WHERE vendor_application_id = $1
      ORDER BY created_at DESC
      LIMIT 20`,
    [vendorAppId],
  );
  return r.rows.map((row) => ({
    id: row.id,
    token: row.token,
    vendorApplicationId: row.vendor_application_id,
    expiresAt: row.expires_at instanceof Date ? row.expires_at.toISOString() : String(row.expires_at),
    usedAt: row.used_at ? (row.used_at instanceof Date ? row.used_at.toISOString() : String(row.used_at)) : null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }));
}

// Suppress unused-import warning during build if ENV is only used indirectly.
void ENV;
