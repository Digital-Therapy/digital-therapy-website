/**
 * Admin access management for the Tailscale-gated console.
 *
 * Who is an admin = the Tailscale login is either:
 *   - an OWNER (ENV.adminTailscaleOwners, e.g. milton@/hello@ -- seeded in .env,
 *     always admin, can manage the list, can never be removed), or
 *   - present in dt_site.admin_allowlist (added at runtime by an owner through
 *     the in-console Access page -- no restart needed).
 *
 * The allowlist table lives in the portal Postgres (same dt_site schema the
 * vendor console already uses); the portal's own tables are never touched.
 */
import type pg from "pg";
import { ENV } from "./_core/env";
import { getPool } from "./vendors";

export function ownerLogins(): string[] {
  return ENV.adminTailscaleOwners;
}

export function isOwner(login: string | null | undefined): boolean {
  return ownerLogins().includes((login ?? "").trim().toLowerCase());
}

let _ready = false;
async function ensureTable(pool: pg.Pool): Promise<void> {
  if (_ready) return;
  await pool.query(`CREATE SCHEMA IF NOT EXISTS dt_site`);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.admin_allowlist (
       login text PRIMARY KEY,
       note text,
       added_by text,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  _ready = true;
}

// Cache the DB allowlist so context.ts doesn't hit Postgres on every request.
let _cache: { set: Set<string>; at: number } | null = null;
const TTL_MS = 20_000;

async function dbSet(): Promise<Set<string>> {
  const pool = getPool();
  if (!pool) return new Set();
  const now = Date.now();
  if (_cache && now - _cache.at < TTL_MS) return _cache.set;
  try {
    await ensureTable(pool);
    const { rows } = await pool.query(`SELECT login FROM dt_site.admin_allowlist`);
    const set = new Set<string>(rows.map((r: { login: string }) => String(r.login).toLowerCase()));
    _cache = { set, at: now };
    return set;
  } catch (error) {
    console.warn("[Access] allowlist read failed:", error);
    return _cache?.set ?? new Set();
  }
}

function invalidate(): void {
  _cache = null;
}

/** True if this Tailscale login should be granted admin. */
export async function isAllowedAdmin(login: string): Promise<boolean> {
  const l = login.trim().toLowerCase();
  if (!l) return false;
  if (ownerLogins().includes(l)) return true;
  return (await dbSet()).has(l);
}

export type AccessEntry = {
  login: string;
  note: string | null;
  addedBy: string | null;
  createdAt: string;
};

export async function listAllowlist(): Promise<{ owners: string[]; entries: AccessEntry[] }> {
  const owners = ownerLogins();
  const pool = getPool();
  if (!pool) return { owners, entries: [] };
  await ensureTable(pool);
  const { rows } = await pool.query(
    `SELECT login, note, added_by, created_at
       FROM dt_site.admin_allowlist
      ORDER BY created_at`,
  );
  const entries: AccessEntry[] = rows.map((r: { login: string; note: string | null; added_by: string | null; created_at: string | Date }) => ({
    login: String(r.login),
    note: r.note ? String(r.note) : null,
    addedBy: r.added_by ? String(r.added_by) : null,
    createdAt: new Date(r.created_at).toISOString(),
  }));
  return { owners, entries };
}

const LOGIN_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function addAllowlist(login: string, note: string, addedBy: string): Promise<{ ok: boolean; reason?: string }> {
  const l = login.trim().toLowerCase();
  if (!LOGIN_RE.test(l)) return { ok: false, reason: "Enter a valid Tailscale login (an email address)." };
  if (ownerLogins().includes(l)) return { ok: false, reason: "That login is already a permanent owner." };
  const pool = getPool();
  if (!pool) return { ok: false, reason: "Portal database is not configured." };
  await ensureTable(pool);
  await pool.query(
    `INSERT INTO dt_site.admin_allowlist (login, note, added_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (login) DO UPDATE SET note = EXCLUDED.note`,
    [l, note.trim() || null, addedBy.trim().toLowerCase() || null],
  );
  invalidate();
  return { ok: true };
}

export async function removeAllowlist(login: string): Promise<{ ok: boolean; reason?: string }> {
  const l = login.trim().toLowerCase();
  if (ownerLogins().includes(l)) return { ok: false, reason: "Owners cannot be removed." };
  const pool = getPool();
  if (!pool) return { ok: false, reason: "Portal database is not configured." };
  await ensureTable(pool);
  await pool.query(`DELETE FROM dt_site.admin_allowlist WHERE login = $1`, [l]);
  invalidate();
  return { ok: true };
}
