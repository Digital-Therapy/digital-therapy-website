/**
 * Vendor Headshots — admin can request fresh headshots from a vendor via a
 * single-use, 7-day-TTL token. The vendor opens the link on their phone, sees
 * a rules-guided upload page, and uploads up to 3 images.
 *
 * File bytes go to Manus Forge storage (same helper used elsewhere in the
 * site). We keep per-file metadata + the storage key in dt_site.vendor_headshot
 * so the admin can render thumbnails and each file remains addressable.
 *
 * All headshots accumulate — new uploads are ADDED to the vendor's list, not
 * replacing prior ones. That way admin retains history and can pick whichever
 * they want to use.
 */
import crypto from "node:crypto";
import { storageGet, storagePut } from "./storage";
import { getPool } from "./vendors";

const MAX_HEADSHOTS_PER_UPLOAD = 3;
const TOKEN_TTL_DAYS = 7;

let _ready = false;
async function ensureTables() {
  const pool = getPool();
  if (!pool) return null;
  if (_ready) return pool;
  await pool.query(`CREATE SCHEMA IF NOT EXISTS dt_site`);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.vendor_headshot (
       id serial PRIMARY KEY,
       vendor_application_id text NOT NULL,
       storage_key text NOT NULL,
       filename text NOT NULL,
       mime_type text,
       size_bytes bigint,
       uploaded_via text NOT NULL DEFAULT 'vendor_link',
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS vendor_headshot_vendor_idx ON dt_site.vendor_headshot (vendor_application_id)`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.vendor_headshot_token (
       id serial PRIMARY KEY,
       token text UNIQUE NOT NULL,
       vendor_application_id text NOT NULL,
       expires_at timestamptz NOT NULL,
       used_at timestamptz,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS vendor_headshot_token_token_idx ON dt_site.vendor_headshot_token (token)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS vendor_headshot_token_vendor_idx ON dt_site.vendor_headshot_token (vendor_application_id)`,
  );
  _ready = true;
  return pool;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type VendorHeadshot = {
  id: number;
  vendorApplicationId: string;
  storageKey: string;
  url: string;
  filename: string;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedVia: string;
  createdAt: string;
};

export type HeadshotToken = {
  id: number;
  token: string;
  vendorApplicationId: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};

// ─── Read ───────────────────────────────────────────────────────────────────

export async function listHeadshots(vendorAppId: string): Promise<VendorHeadshot[]> {
  const pool = await ensureTables();
  if (!pool) return [];
  const r = await pool.query(
    `SELECT id, vendor_application_id, storage_key, filename, mime_type, size_bytes, uploaded_via, created_at
       FROM dt_site.vendor_headshot
      WHERE vendor_application_id = $1
      ORDER BY created_at DESC`,
    [vendorAppId],
  );
  return r.rows.map((row) => ({
    id: row.id,
    vendorApplicationId: row.vendor_application_id,
    storageKey: row.storage_key,
    // /manus-storage/{key} is the site's 307-redirect pattern; the browser
    // resolves it to the actual S3 URL. Works for <img src="…">.
    url: `/manus-storage/${row.storage_key.replace(/^\/+/, "")}`,
    filename: row.filename,
    mimeType: row.mime_type ?? null,
    sizeBytes: typeof row.size_bytes === "number" ? row.size_bytes : row.size_bytes ? Number(row.size_bytes) : null,
    uploadedVia: row.uploaded_via,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }));
}

export async function deleteHeadshot(id: number): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(`DELETE FROM dt_site.vendor_headshot WHERE id = $1`, [id]);
  return true;
}

// ─── Tokens ─────────────────────────────────────────────────────────────────

export async function generateHeadshotToken(vendorAppId: string): Promise<{ token: string; url: string; expiresAt: string } | null> {
  const pool = await ensureTables();
  if (!pool) return null;
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO dt_site.vendor_headshot_token (token, vendor_application_id, expires_at)
     VALUES ($1, $2, $3)`,
    [token, vendorAppId, expiresAt],
  );
  const baseUrl = (process.env.PUBLIC_SITE_URL ?? "https://www.digitaltherapy.io").replace(/\/$/, "");
  return {
    token,
    url: `${baseUrl}/vendor/headshot/${token}`,
    expiresAt: expiresAt.toISOString(),
  };
}

export type TokenLookupResult =
  | { ok: true; vendorApplicationId: string; expiresAt: string }
  | { ok: false; reason: "not_found" | "expired" | "used" };

export async function lookupHeadshotToken(token: string): Promise<TokenLookupResult> {
  const pool = await ensureTables();
  if (!pool) return { ok: false, reason: "not_found" };
  const r = await pool.query(
    `SELECT vendor_application_id, expires_at, used_at
       FROM dt_site.vendor_headshot_token
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

export async function listHeadshotTokens(vendorAppId: string): Promise<HeadshotToken[]> {
  const pool = await ensureTables();
  if (!pool) return [];
  const r = await pool.query(
    `SELECT id, token, vendor_application_id, expires_at, used_at, created_at
       FROM dt_site.vendor_headshot_token
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

// ─── Upload ─────────────────────────────────────────────────────────────────

export type HeadshotUploadFile = {
  filename: string;
  mimeType: string;
  /** Raw base64 (no data: URI prefix). */
  dataBase64: string;
};

export async function submitHeadshotsViaToken(
  token: string,
  files: HeadshotUploadFile[],
): Promise<{ ok: true; uploaded: number } | { ok: false; reason: string }> {
  const pool = await ensureTables();
  if (!pool) return { ok: false, reason: "Database not available." };
  const lookup = await lookupHeadshotToken(token);
  if (!lookup.ok) {
    if (lookup.reason === "expired") return { ok: false, reason: "This link has expired." };
    if (lookup.reason === "used") return { ok: false, reason: "This link has already been used." };
    return { ok: false, reason: "This link is invalid." };
  }
  if (!files.length) return { ok: false, reason: "Please upload at least one headshot." };
  if (files.length > MAX_HEADSHOTS_PER_UPLOAD) {
    return { ok: false, reason: `You can upload up to ${MAX_HEADSHOTS_PER_UPLOAD} images at a time.` };
  }

  const vendorId = lookup.vendorApplicationId;
  let uploaded = 0;
  for (const file of files) {
    if (!file.mimeType.startsWith("image/")) continue;
    const buf = Buffer.from(file.dataBase64, "base64");
    if (buf.length === 0) continue;
    // Namespace under vendor id + timestamp to keep keys unique across resends.
    const cleanName = file.filename.replace(/[^\w.\-]/g, "_").slice(0, 120);
    const relKey = `vendor-headshots/${vendorId}/${Date.now()}_${cleanName}`;
    const { key } = await storagePut(relKey, buf, file.mimeType);
    await pool.query(
      `INSERT INTO dt_site.vendor_headshot
         (vendor_application_id, storage_key, filename, mime_type, size_bytes)
       VALUES ($1, $2, $3, $4, $5)`,
      [vendorId, key, cleanName, file.mimeType, buf.length],
    );
    uploaded++;
  }
  if (uploaded === 0) {
    return { ok: false, reason: "No valid image files were uploaded." };
  }
  await pool.query(`UPDATE dt_site.vendor_headshot_token SET used_at = now() WHERE token = $1`, [token]);
  return { ok: true, uploaded };
}

// Reference for callers that want the display URL for a known storage key.
export async function headshotDisplayUrl(storageKey: string): Promise<string> {
  const { url } = await storageGet(storageKey);
  return url;
}
