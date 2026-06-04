/**
 * Vendor inventory data-access layer.
 *
 * Source of truth = the portal's existing `public."VendorApplication"` table
 * (Postgres, reached via PORTAL_DATABASE_URL) where the website's forwarded
 * submissions already land. We READ that table (plus `File` for documents) and
 * store ONLY the admin's pipeline state in our own net-new, isolated table
 * `dt_site.vendor_status` — the portal app's tables are never modified.
 *
 * Fallback: when PORTAL_DATABASE_URL is absent but ENV.devPreview is on, an
 * in-memory seeded store powers the console offline. Filtering/sorting/facets
 * are shared between both paths via a common VendorRecord shape.
 */
import pg from "pg";
import { vendorStatusValues } from "../drizzle/schema";
import { ENV } from "./_core/env";

export type VendorStatus = (typeof vendorStatusValues)[number];
const DEFAULT_STATUS: VendorStatus = "applied";

/** Parsed vendor application payload (matches vendorApplicationInput in routers.ts). */
export type VendorApplicationData = {
  vendorTypeLabel: string;
  name: string;
  email: string;
  role?: string;
  companyName?: string;
  websiteUrl?: string;
  personalLinkedin?: string;
  companySocial?: string;
  personalBio?: string;
  companyCv?: string;
  hourlyRate?: string;
  hoursPerMonth?: string;
  availabilityNotes?: string;
  additionalSkills?: string;
  teamSize?: string;
  teamMembers?: { fullName: string; title: string; roleSkills: string; location: string; yearsTogether: string }[];
  sectors?: string[];
  skills?: string[];
  certifications?: { name: string; isCurrent: boolean; provider: string }[];
  marketingConsent?: boolean;
  nameUsageConsent?: boolean;
  signature?: string;
  context?: string;
  sourcePage?: string;
  files?: { field: "resume" | "w9" | "headshot"; filename: string; mimeType: string; dataBase64: string }[];
};

export type VendorSearchFilters = {
  query?: string;
  skills?: string[];
  certifications?: string[];
  sectors?: string[];
  vendorType?: string;
  status?: VendorStatus;
  rateMin?: number;
  rateMax?: number;
  hoursMin?: number;
  hoursMax?: number;
  sort?: "createdAt" | "name" | "hourlyRateNumeric" | "status";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type VendorListRow = {
  id: string;
  name: string;
  email: string;
  vendorTypeLabel: string;
  status: VendorStatus;
  hourlyRate: string | null;
  hoursPerMonth: string | null;
  createdAt: Date;
  skills: string[];
  certifications: string[];
  sectors: string[];
};

// Common normalized record both data paths produce.
type VendorRecord = {
  id: string;
  vendorTypeLabel: string;
  name: string;
  email: string;
  role: string | null;
  companyName: string | null;
  websiteUrl: string | null;
  personalLinkedin: string | null;
  companySocial: string | null;
  personalBio: string | null;
  companyCv: string | null;
  hourlyRate: string | null;
  hoursPerMonth: string | null;
  hourlyRateNumeric: number | null;
  hoursPerMonthNumeric: number | null;
  availabilityNotes: string | null;
  additionalSkills: string | null;
  teamSize: string | null;
  signature: string | null;
  sourcePage: string | null;
  context: string | null;
  status: VendorStatus;
  statusNotes: string | null;
  createdAt: Date;
  skills: string[];
  sectors: string[];
  certifications: { name: string; provider: string | null; isCurrent: boolean }[];
  teamMembers: { fullName: string | null; title: string | null; roleSkills: string | null; location: string | null; yearsTogether: string | null }[];
  files: { id: string; field: string; filename: string; mimeType: string | null; sizeBytes: number | null }[];
};

/** Extract the first integer from a free-text rate/hours string ("$150/hr" -> 150). */
export function parseFirstInt(value: string | undefined | null): number | null {
  if (!value) return null;
  const match = value.replace(/,/g, "").match(/\d+/);
  if (!match) return null;
  const n = Number.parseInt(match[0], 10);
  return Number.isFinite(n) ? n : null;
}

/** Turn free-text additionalSkills into discrete searchable tags. */
export function parseSkillTags(additionalSkills: string, formSkills: string[] = [], cap = 50): string[] {
  if (!additionalSkills) return [];
  const seen = new Set(formSkills.map((s) => s.trim().toLowerCase()));
  const out: string[] = [];
  for (const raw of additionalSkills.split(/[,;\n/|]+/)) {
    const value = raw.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length >= cap) break;
  }
  return out;
}

function asString(v: unknown): string | null {
  return v == null ? null : String(v);
}

function parseJsonArray(text: unknown): any[] {
  if (!text) return [];
  if (Array.isArray(text)) return text;
  if (typeof text !== "string") return [];
  try {
    const v = JSON.parse(text);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared filtering / sorting / facets / mapping (works on VendorRecord[])
// ─────────────────────────────────────────────────────────────────────────────

function applyFilters(records: VendorRecord[], filters: VendorSearchFilters): VendorRecord[] {
  let out = records;
  const q = filters.query?.trim().toLowerCase();
  if (q) {
    out = out.filter((r) =>
      [r.name, r.email, r.personalBio, r.companyCv, r.companyName].some((v) => (v ?? "").toLowerCase().includes(q)),
    );
  }
  if (filters.vendorType) {
    const vt = filters.vendorType.toLowerCase();
    // Substring match so "Technology" matches both "Technology Vendor" and
    // legacy "Technology SME" labels in historical data.
    out = out.filter((r) => r.vendorTypeLabel.toLowerCase().includes(vt));
  }
  if (filters.status) out = out.filter((r) => r.status === filters.status);
  if (filters.rateMin != null) out = out.filter((r) => r.hourlyRateNumeric != null && r.hourlyRateNumeric >= filters.rateMin!);
  if (filters.rateMax != null) out = out.filter((r) => r.hourlyRateNumeric != null && r.hourlyRateNumeric <= filters.rateMax!);
  if (filters.hoursMin != null) out = out.filter((r) => r.hoursPerMonthNumeric != null && r.hoursPerMonthNumeric >= filters.hoursMin!);
  if (filters.hoursMax != null) out = out.filter((r) => r.hoursPerMonthNumeric != null && r.hoursPerMonthNumeric <= filters.hoursMax!);

  const skills = (filters.skills ?? []).filter(Boolean);
  if (skills.length) out = out.filter((r) => skills.every((s) => r.skills.includes(s)));
  const certs = (filters.certifications ?? []).filter(Boolean);
  if (certs.length) out = out.filter((r) => certs.every((c) => r.certifications.some((x) => x.name === c)));
  const sectors = (filters.sectors ?? []).filter(Boolean);
  if (sectors.length) out = out.filter((r) => sectors.every((s) => r.sectors.includes(s)));
  return out;
}

function sortRecords(records: VendorRecord[], filters: VendorSearchFilters): VendorRecord[] {
  const sort = filters.sort ?? "createdAt";
  const dir = (filters.sortDir ?? "desc") === "asc" ? 1 : -1;
  return [...records].sort((a, b) => {
    let av: string | number;
    let bv: string | number;
    switch (sort) {
      case "name":
        av = a.name;
        bv = b.name;
        break;
      case "hourlyRateNumeric":
        av = a.hourlyRateNumeric ?? -1;
        bv = b.hourlyRateNumeric ?? -1;
        break;
      case "status":
        av = a.status;
        bv = b.status;
        break;
      default:
        av = a.createdAt.getTime();
        bv = b.createdAt.getTime();
    }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function toListRow(r: VendorRecord): VendorListRow {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    vendorTypeLabel: r.vendorTypeLabel,
    status: r.status,
    hourlyRate: r.hourlyRate,
    hoursPerMonth: r.hoursPerMonth,
    createdAt: r.createdAt,
    skills: r.skills,
    certifications: r.certifications.map((c) => c.name),
    sectors: r.sectors,
  };
}

function toDetail(r: VendorRecord, all: VendorRecord[]) {
  return {
    vendor: {
      id: r.id,
      vendorTypeLabel: r.vendorTypeLabel,
      name: r.name,
      email: r.email,
      role: r.role,
      companyName: r.companyName,
      websiteUrl: r.websiteUrl,
      personalLinkedin: r.personalLinkedin,
      companySocial: r.companySocial,
      personalBio: r.personalBio,
      companyCv: r.companyCv,
      hourlyRate: r.hourlyRate,
      hoursPerMonth: r.hoursPerMonth,
      availabilityNotes: r.availabilityNotes,
      additionalSkills: r.additionalSkills,
      teamSize: r.teamSize,
      sourcePage: r.sourcePage,
      status: r.status,
      statusNotes: r.statusNotes,
      createdAt: r.createdAt,
    },
    skills: r.skills.map((skill, i) => ({ id: i, skill })),
    sectors: r.sectors.map((sector, i) => ({ id: i, sector })),
    certifications: r.certifications.map((c, i) => ({ id: i, name: c.name, provider: c.provider, isCurrent: c.isCurrent })),
    teamMembers: r.teamMembers.map((m, i) => ({ id: i, ...m })),
    files: r.files,
    caseStudies: [] as { id: number; title: string; summary: string | null }[],
    applicationsFromEmail: all.filter((x) => x.email === r.email).length,
  };
}

function facetsFrom(records: VendorRecord[]) {
  const facet = (pick: (r: VendorRecord) => string[]) => {
    const byValue = new Map<string, Set<string>>();
    for (const r of records) {
      for (const value of pick(r)) {
        if (!value) continue;
        if (!byValue.has(value)) byValue.set(value, new Set());
        byValue.get(value)!.add(r.id);
      }
    }
    return Array.from(byValue.entries())
      .map(([value, ids]) => ({ value, count: ids.size }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  };
  return {
    skills: facet((r) => r.skills),
    certifications: facet((r) => r.certifications.map((c) => c.name)),
    sectors: facet((r) => r.sectors),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Portal Postgres path (reads VendorApplication + File; status in dt_site)
// ─────────────────────────────────────────────────────────────────────────────

let _pool: pg.Pool | null = null;
let _poolTried = false;
function getPool(): pg.Pool | null {
  if (!_poolTried) {
    _poolTried = true;
    const url = process.env.PORTAL_DATABASE_URL;
    if (url) {
      try {
        _pool = new pg.Pool({ connectionString: url, max: 4 });
      } catch (error) {
        console.warn("[Vendors] Postgres pool init failed:", error);
        _pool = null;
      }
    }
  }
  return _pool;
}

let _statusReady = false;
async function ensureStatusTable(pool: pg.Pool) {
  if (_statusReady) return;
  await pool.query(`CREATE SCHEMA IF NOT EXISTS dt_site`);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.vendor_status (
       vendor_application_id text PRIMARY KEY,
       status text NOT NULL DEFAULT 'applied',
       status_notes text,
       updated_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  _statusReady = true;
}

function rowToRecord(row: any, files: VendorRecord["files"]): VendorRecord {
  const skillsArr = parseJsonArray(row.skills).map((s) => String(s)).filter(Boolean);
  const additionalSkills = asString(row.additionalSkills);
  const parsedExtra = parseSkillTags(additionalSkills ?? "", skillsArr);
  const certs = parseJsonArray(row.certifications)
    .filter((c) => c && (c.name ?? "").toString().trim())
    .map((c) => ({ name: String(c.name), provider: c.provider ? String(c.provider) : null, isCurrent: c.isCurrent !== false }));
  const team = parseJsonArray(row.teamMembers).map((m) => ({
    fullName: m.fullName ? String(m.fullName) : null,
    title: m.title ? String(m.title) : null,
    roleSkills: m.roleSkills ? String(m.roleSkills) : null,
    location: m.location ? String(m.location) : null,
    yearsTogether: m.yearsTogether ? String(m.yearsTogether) : null,
  }));
  const statusRaw = asString(row.dt_status);
  const status = (vendorStatusValues as readonly string[]).includes(statusRaw ?? "")
    ? (statusRaw as VendorStatus)
    : DEFAULT_STATUS;
  return {
    id: String(row.id),
    vendorTypeLabel: String(row.vendorTypeLabel ?? ""),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    role: asString(row.role),
    // These columns don't exist on the portal's VendorApplication yet; null for now.
    companyName: asString(row.companyName),
    websiteUrl: asString(row.websiteUrl),
    personalLinkedin: asString(row.personalLinkedin),
    companySocial: asString(row.companySocial),
    personalBio: asString(row.personalBio),
    companyCv: asString(row.companyCv),
    hourlyRate: asString(row.hourlyRate),
    hoursPerMonth: asString(row.hoursPerMonth),
    hourlyRateNumeric: parseFirstInt(asString(row.hourlyRate)),
    hoursPerMonthNumeric: parseFirstInt(asString(row.hoursPerMonth)),
    availabilityNotes: asString(row.availabilityNotes),
    additionalSkills,
    teamSize: asString(row.teamSize),
    signature: asString(row.signature),
    sourcePage: asString(row.sourcePage),
    context: asString(row.context),
    status,
    statusNotes: asString(row.dt_status_notes),
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
    skills: [...skillsArr, ...parsedExtra],
    sectors: parseJsonArray(row.sectors).map((s) => String(s)).filter(Boolean),
    certifications: certs,
    teamMembers: team,
    files,
  };
}

async function loadPortalRecords(pool: pg.Pool): Promise<VendorRecord[]> {
  await ensureStatusTable(pool);
  const { rows } = await pool.query(
    `SELECT va.*, s.status AS dt_status, s.status_notes AS dt_status_notes
       FROM "VendorApplication" va
       LEFT JOIN dt_site.vendor_status s ON s.vendor_application_id = va.id`,
  );
  const fileRes = await pool.query(
    `SELECT id, name, size, "mimeType", "vendorApplicationId", "vendorDocKind"
       FROM "File" WHERE "vendorApplicationId" IS NOT NULL`,
  );
  const filesByVa = new Map<string, VendorRecord["files"]>();
  for (const f of fileRes.rows) {
    const key = String(f.vendorApplicationId);
    const list = filesByVa.get(key) ?? [];
    list.push({
      id: String(f.id),
      field: f.vendorDocKind ? String(f.vendorDocKind) : "document",
      filename: String(f.name),
      mimeType: f.mimeType ? String(f.mimeType) : null,
      sizeBytes: typeof f.size === "number" ? f.size : null,
    });
    filesByVa.set(key, list);
  }
  return rows.map((r) => rowToRecord(r, filesByVa.get(String(r.id)) ?? []));
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API — portal path when PORTAL_DATABASE_URL is set, else dev fallback
// ─────────────────────────────────────────────────────────────────────────────

export async function searchVendors(
  filters: VendorSearchFilters,
): Promise<{ rows: VendorListRow[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 25));
  const records = await loadRecords();
  const filtered = sortRecords(applyFilters(records, filters), filters);
  const total = filtered.length;
  const rows = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize).map(toListRow);
  return { rows, total, page, pageSize };
}

export async function getVendorById(id: string) {
  const records = await loadRecords();
  const r = records.find((x) => x.id === id);
  if (!r) return null;
  return toDetail(r, records);
}

export async function getVendorFacets() {
  return facetsFrom(await loadRecords());
}

export async function updateVendorStatus(id: string, status: VendorStatus, statusNotes?: string): Promise<boolean> {
  const pool = getPool();
  if (pool) {
    try {
      await ensureStatusTable(pool);
      await pool.query(
        `INSERT INTO dt_site.vendor_status (vendor_application_id, status, status_notes, updated_at)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (vendor_application_id)
         DO UPDATE SET status = EXCLUDED.status,
                       status_notes = COALESCE(EXCLUDED.status_notes, dt_site.vendor_status.status_notes),
                       updated_at = now()`,
        [id, status, statusNotes ?? null],
      );
      return true;
    } catch (error) {
      console.warn("[Vendors] Failed to update vendor status:", error);
      return false;
    }
  }
  if (ENV.devPreview) return devUpdateStatus(id, status, statusNotes);
  return false;
}

/**
 * Local persistence hook for the public form. In portal mode this is a no-op:
 * submissions reach the portal's VendorApplication via the ingest API, which
 * the admin reads. In offline preview it appends to the in-memory store.
 */
export async function createVendorApplication(
  input: VendorApplicationData,
  _opts: { portalForwarded?: boolean } = {},
): Promise<{ id: string } | null> {
  if (getPool()) return null;
  if (ENV.devPreview) return devCreateVendor(input);
  return null;
}

async function loadRecords(): Promise<VendorRecord[]> {
  const pool = getPool();
  if (pool) {
    try {
      return await loadPortalRecords(pool);
    } catch (error) {
      console.warn("[Vendors] Portal read failed, falling back:", error);
    }
  }
  if (ENV.devPreview) {
    ensureDevSeeded();
    return devStore;
  }
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Offline preview fallback (in-memory) — only when no PORTAL_DATABASE_URL
// ─────────────────────────────────────────────────────────────────────────────

let devSeq = 0;
const devStore: VendorRecord[] = [];
let devSeeded = false;

function buildDevRecord(input: VendorApplicationData): VendorRecord {
  const id = `dev-${++devSeq}`;
  const now = new Date();
  const skills = input.skills ?? [];
  return {
    id,
    vendorTypeLabel: input.vendorTypeLabel,
    name: input.name,
    email: input.email,
    role: input.role || null,
    companyName: input.companyName || null,
    websiteUrl: input.websiteUrl || null,
    personalLinkedin: input.personalLinkedin || null,
    companySocial: input.companySocial || null,
    personalBio: input.personalBio || null,
    companyCv: input.companyCv || null,
    hourlyRate: input.hourlyRate || null,
    hoursPerMonth: input.hoursPerMonth || null,
    hourlyRateNumeric: parseFirstInt(input.hourlyRate),
    hoursPerMonthNumeric: parseFirstInt(input.hoursPerMonth),
    availabilityNotes: input.availabilityNotes || null,
    additionalSkills: input.additionalSkills || null,
    teamSize: input.teamSize || null,
    signature: input.signature || null,
    sourcePage: input.sourcePage || null,
    context: input.context || null,
    status: DEFAULT_STATUS,
    statusNotes: null,
    createdAt: now,
    skills: [...skills, ...parseSkillTags(input.additionalSkills ?? "", skills)],
    sectors: input.sectors ?? [],
    certifications: (input.certifications ?? [])
      .filter((c) => c.name?.trim())
      .map((c) => ({ name: c.name, provider: c.provider || null, isCurrent: c.isCurrent ?? true })),
    teamMembers: (input.teamMembers ?? []).map((m) => ({
      fullName: m.fullName || null,
      title: m.title || null,
      roleSkills: m.roleSkills || null,
      location: m.location || null,
      yearsTogether: m.yearsTogether || null,
    })),
    files: [],
  };
}

function devCreateVendor(input: VendorApplicationData): { id: string } {
  ensureDevSeeded();
  const record = buildDevRecord(input);
  devStore.push(record);
  return { id: record.id };
}

function devUpdateStatus(id: string, status: VendorStatus, statusNotes?: string): boolean {
  const r = devStore.find((x) => x.id === id);
  if (!r) return false;
  r.status = status;
  if (statusNotes !== undefined) r.statusNotes = statusNotes || null;
  return true;
}

function ensureDevSeeded() {
  if (devSeeded) return;
  devSeeded = true;
  const aws = { name: "AWS Solutions Architect", isCurrent: true, provider: "Amazon Web Services" };
  const cpa = { name: "CPA", isCurrent: true, provider: "AICPA" };
  const seeds: { input: VendorApplicationData; status: VendorStatus }[] = [
    { status: "approved", input: { vendorTypeLabel: "Technology Vendor", name: "Maria Alvarez", email: "maria.alvarez@example.com", role: "Senior Full-Stack Engineer", companyName: "Alvarez Data Labs", websiteUrl: "https://alvarezdatalabs.com", personalLinkedin: "https://linkedin.com/in/maria-alvarez", companySocial: "https://linkedin.com/company/alvarez-data-labs", hourlyRate: "$150/hr", hoursPerMonth: "40", skills: ["AWS", "Python", "React", "Node.js", "SQL"], sectors: ["Technology", "Healthcare"], certifications: [aws] } },
    { status: "screening", input: { vendorTypeLabel: "Finance & Accounting Vendor", name: "James Chen", email: "james.chen@example.com", role: "Fractional Controller", hourlyRate: "$120/hr", hoursPerMonth: "30", skills: ["QBO", "Xero", "Bill.com"], sectors: ["Family Office", "Financial Services"], certifications: [cpa] } },
    { status: "applied", input: { vendorTypeLabel: "Marketing Vendor", name: "Priya Patel", email: "priya.patel@example.com", role: "Growth & SEO Strategist", hourlyRate: "$95/hr", hoursPerMonth: "20", skills: ["Salesforce", "Hubspot", "Semrush"], sectors: ["E-Commerce", "Start-Ups"] } },
    { status: "onboarded", input: { vendorTypeLabel: "Technology Vendor", name: "David Okafor", email: "david.okafor@example.com", role: "Data & BI Engineer", hourlyRate: "$160/hr", hoursPerMonth: "50", skills: ["Python", "AWS", "Power BI", "Tableau"], sectors: ["Financial Services"], certifications: [aws, { name: "Power BI Data Analyst", isCurrent: true, provider: "Microsoft" }] } },
    { status: "approved", input: { vendorTypeLabel: "Family Office Vendor", name: "Sofia Rossi", email: "sofia.rossi@example.com", role: "Family Office Operations Lead", hourlyRate: "$200/hr", hoursPerMonth: "15", skills: ["Addepar", "Excel"], sectors: ["Family Office"] } },
  ];
  seeds.forEach((seed, i) => {
    const record = buildDevRecord(seed.input);
    record.status = seed.status;
    record.createdAt = new Date(Date.now() - i * 36e5);
    devStore.push(record);
  });
}
