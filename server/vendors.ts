/**
 * Vendor inventory data-access layer.
 *
 * This site's MySQL DB is the system of record for the vendor (SME resource)
 * inventory the admin searches when assembling project teams. The public
 * vendor application form persists here via `createVendorApplication`; the
 * admin console reads through `searchVendors` / `getVendorById` / facets.
 *
 * Mirrors the conventions in ./db.ts: lazy `getDb()`, graceful degradation
 * when the DB is unavailable (returns null/empty rather than throwing, so the
 * public submission path never 500s), and try/catch with console.warn.
 */
import { and, asc, desc, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import {
  vendorCaseStudies,
  vendorCertifications,
  vendorFiles,
  vendorSectors,
  vendorSkills,
  vendorTeamMembers,
  vendors,
  vendorStatusValues,
  type Vendor,
  type VendorCaseStudy,
  type VendorCertification,
  type VendorFile,
  type VendorSector,
  type VendorSkill,
  type VendorTeamMember,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getDb } from "./db";

export type VendorStatus = (typeof vendorStatusValues)[number];

/**
 * Structural shape of a parsed vendor application (matches the zod-inferred
 * `vendorApplicationInput` in routers.ts). Declared locally to avoid a circular
 * import — routers.ts imports this module.
 */
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
  ndaBusinessName?: string;
  ndaEntityDescriptor?: string;
  ndaAddress?: string;
  ndaSignerName?: string;
  ndaSignerTitle?: string;
  ndaSignerPhone?: string;
  ndaSignerEmail?: string;
  ndaSignatureText?: string;
  ndaSignatureDate?: string;
  ndaEffectiveDate?: string;
  ndaRequestCopy?: boolean;
  context?: string;
  sourcePage?: string;
  files?: { field: "resume" | "w9" | "headshot"; filename: string; mimeType: string; dataBase64: string }[];
};

/** Extract the first integer from a free-text rate/hours string ("$150/hr" -> 150). */
export function parseFirstInt(value: string | undefined | null): number | null {
  if (!value) return null;
  const match = value.replace(/,/g, "").match(/\d+/);
  if (!match) return null;
  const n = Number.parseInt(match[0], 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Turn free-text `additionalSkills` into discrete, searchable skill tags.
 * Splits on common delimiters, trims, drops empties, dedupes case-insensitively
 * (including against the checkbox skills already captured), and caps the count.
 */
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

/**
 * Persist a vendor application and all its searchable child rows in one
 * transaction. Returns the new vendor id, or null if the DB is unavailable or
 * the write fails (caller treats this as non-fatal).
 */
export async function createVendorApplication(
  input: VendorApplicationData,
  opts: { portalForwarded?: boolean } = {},
): Promise<{ id: number } | null> {
  const db = await getDb();
  if (!db) {
    if (ENV.devPreview) return devCreateVendor(input, opts);
    console.warn("[Vendors] Cannot persist vendor: database not available");
    return null;
  }

  try {
    return await db.transaction(async (tx) => {
      const insertedIds = await tx
        .insert(vendors)
        .values({
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
          marketingConsent: input.marketingConsent ?? false,
          nameUsageConsent: input.nameUsageConsent ?? false,
          signature: input.signature || null,
          ndaBusinessName: input.ndaBusinessName || null,
          ndaEntityDescriptor: input.ndaEntityDescriptor || null,
          ndaAddress: input.ndaAddress || null,
          ndaSignerName: input.ndaSignerName || null,
          ndaSignerTitle: input.ndaSignerTitle || null,
          ndaSignerPhone: input.ndaSignerPhone || null,
          ndaSignerEmail: input.ndaSignerEmail || null,
          ndaSignatureText: input.ndaSignatureText || null,
          ndaSignatureDate: input.ndaSignatureDate || null,
          ndaEffectiveDate: input.ndaEffectiveDate || null,
          ndaRequestCopy: input.ndaRequestCopy ?? false,
          context: input.context || null,
          sourcePage: input.sourcePage || null,
          portalForwarded: opts.portalForwarded ?? false,
        })
        .$returningId();

      const vendorId = insertedIds[0].id;

      // Skills: checkbox selections (source 'form') + parsed free-text (source 'parsed').
      const formSkills = (input.skills ?? []).map((skill) => ({ vendorId, skill, source: "form" as const }));
      const parsedSkills = parseSkillTags(input.additionalSkills ?? "", input.skills ?? []).map((skill) => ({
        vendorId,
        skill,
        source: "parsed" as const,
      }));
      const allSkills = [...formSkills, ...parsedSkills];
      if (allSkills.length) await tx.insert(vendorSkills).values(allSkills);

      const sectorRows = (input.sectors ?? []).map((sector) => ({ vendorId, sector }));
      if (sectorRows.length) await tx.insert(vendorSectors).values(sectorRows);

      const certRows = (input.certifications ?? [])
        .filter((c) => c.name?.trim())
        .map((c) => ({ vendorId, name: c.name, provider: c.provider || null, isCurrent: c.isCurrent ?? true }));
      if (certRows.length) await tx.insert(vendorCertifications).values(certRows);

      const teamRows = (input.teamMembers ?? []).map((m) => ({
        vendorId,
        fullName: m.fullName || null,
        title: m.title || null,
        roleSkills: m.roleSkills || null,
        location: m.location || null,
        yearsTogether: m.yearsTogether || null,
      }));
      if (teamRows.length) await tx.insert(vendorTeamMembers).values(teamRows);

      const fileRows = (input.files ?? []).map((f) => ({
        vendorId,
        field: f.field,
        filename: f.filename,
        mimeType: f.mimeType || null,
        // Derive byte size from the base64 payload without storing the binary.
        sizeBytes: f.dataBase64 ? Buffer.from(f.dataBase64, "base64").length : null,
        storageRef: null,
      }));
      if (fileRows.length) await tx.insert(vendorFiles).values(fileRows);

      return { id: vendorId };
    });
  } catch (error) {
    console.warn("[Vendors] Failed to persist vendor application:", error);
    return null;
  }
}

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
  id: number;
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

/**
 * Search the vendor inventory with AND-matching across skills/certs/sectors,
 * a text query, equality + range filters, sorting and pagination.
 */
export async function searchVendors(
  filters: VendorSearchFilters,
): Promise<{ rows: VendorListRow[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 25));
  const db = await getDb();
  if (!db) return ENV.devPreview ? devSearchVendors(filters, page, pageSize) : { rows: [], total: 0, page, pageSize };

  const conditions = [];

  if (filters.query?.trim()) {
    const q = `%${filters.query.trim()}%`;
    conditions.push(
      or(like(vendors.name, q), like(vendors.email, q), like(vendors.personalBio, q), like(vendors.companyCv, q)),
    );
  }
  if (filters.vendorType) conditions.push(eq(vendors.vendorTypeLabel, filters.vendorType));
  if (filters.status) conditions.push(eq(vendors.status, filters.status));
  if (filters.rateMin != null) conditions.push(gte(vendors.hourlyRateNumeric, filters.rateMin));
  if (filters.rateMax != null) conditions.push(lte(vendors.hourlyRateNumeric, filters.rateMax));
  if (filters.hoursMin != null) conditions.push(gte(vendors.hoursPerMonthNumeric, filters.hoursMin));
  if (filters.hoursMax != null) conditions.push(lte(vendors.hoursPerMonthNumeric, filters.hoursMax));

  // AND-match each multi-value dimension: a vendor must carry ALL requested
  // values. One id-subquery per dimension, combined via `id IN (...)`.
  const skills = (filters.skills ?? []).filter(Boolean);
  if (skills.length) {
    conditions.push(
      inArray(
        vendors.id,
        db
          .select({ id: vendorSkills.vendorId })
          .from(vendorSkills)
          .where(inArray(vendorSkills.skill, skills))
          .groupBy(vendorSkills.vendorId)
          .having(sql`count(distinct ${vendorSkills.skill}) = ${skills.length}`),
      ),
    );
  }
  const certs = (filters.certifications ?? []).filter(Boolean);
  if (certs.length) {
    conditions.push(
      inArray(
        vendors.id,
        db
          .select({ id: vendorCertifications.vendorId })
          .from(vendorCertifications)
          .where(inArray(vendorCertifications.name, certs))
          .groupBy(vendorCertifications.vendorId)
          .having(sql`count(distinct ${vendorCertifications.name}) = ${certs.length}`),
      ),
    );
  }
  const sectors = (filters.sectors ?? []).filter(Boolean);
  if (sectors.length) {
    conditions.push(
      inArray(
        vendors.id,
        db
          .select({ id: vendorSectors.vendorId })
          .from(vendorSectors)
          .where(inArray(vendorSectors.sector, sectors))
          .groupBy(vendorSectors.vendorId)
          .having(sql`count(distinct ${vendorSectors.sector}) = ${sectors.length}`),
      ),
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const sortColumns = {
    createdAt: vendors.createdAt,
    name: vendors.name,
    hourlyRateNumeric: vendors.hourlyRateNumeric,
    status: vendors.status,
  } as const;
  const sortColumn = sortColumns[filters.sort ?? "createdAt"];
  const orderBy = (filters.sortDir ?? "desc") === "asc" ? asc(sortColumn) : desc(sortColumn);

  const pageRows = await db
    .select({
      id: vendors.id,
      name: vendors.name,
      email: vendors.email,
      vendorTypeLabel: vendors.vendorTypeLabel,
      status: vendors.status,
      hourlyRate: vendors.hourlyRate,
      hoursPerMonth: vendors.hoursPerMonth,
      createdAt: vendors.createdAt,
    })
    .from(vendors)
    .where(where)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const totalRows = await db.select({ value: sql<number>`count(*)` }).from(vendors).where(where);
  const total = Number(totalRows[0]?.value ?? 0);

  const ids = pageRows.map((r) => r.id);
  const [skillsByVendor, certsByVendor, sectorsByVendor] = await Promise.all([
    ids.length
      ? db.select().from(vendorSkills).where(inArray(vendorSkills.vendorId, ids))
      : Promise.resolve([]),
    ids.length
      ? db.select().from(vendorCertifications).where(inArray(vendorCertifications.vendorId, ids))
      : Promise.resolve([]),
    ids.length
      ? db.select().from(vendorSectors).where(inArray(vendorSectors.vendorId, ids))
      : Promise.resolve([]),
  ]);

  const group = <T extends { vendorId: number }>(items: T[], pick: (item: T) => string) => {
    const map = new Map<number, string[]>();
    for (const item of items) {
      const list = map.get(item.vendorId) ?? [];
      list.push(pick(item));
      map.set(item.vendorId, list);
    }
    return map;
  };
  const skillMap = group(skillsByVendor, (s) => s.skill);
  const certMap = group(certsByVendor, (c) => c.name);
  const sectorMap = group(sectorsByVendor, (s) => s.sector);

  const rows: VendorListRow[] = pageRows.map((r) => ({
    ...r,
    skills: skillMap.get(r.id) ?? [],
    certifications: certMap.get(r.id) ?? [],
    sectors: sectorMap.get(r.id) ?? [],
  }));

  return { rows, total, page, pageSize };
}

/** Full vendor profile with all child rows, plus a re-application count hint. */
export async function getVendorById(id: number) {
  const db = await getDb();
  if (!db) return ENV.devPreview ? devGetVendor(id) : null;

  const vendorRows = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
  const vendor = vendorRows[0];
  if (!vendor) return null;

  const [skills, sectors, certifications, teamMembers, files, caseStudies, sameEmail] = await Promise.all([
    db.select().from(vendorSkills).where(eq(vendorSkills.vendorId, id)),
    db.select().from(vendorSectors).where(eq(vendorSectors.vendorId, id)),
    db.select().from(vendorCertifications).where(eq(vendorCertifications.vendorId, id)),
    db.select().from(vendorTeamMembers).where(eq(vendorTeamMembers.vendorId, id)),
    db.select().from(vendorFiles).where(eq(vendorFiles.vendorId, id)),
    db.select().from(vendorCaseStudies).where(eq(vendorCaseStudies.vendorId, id)),
    db.select({ value: sql<number>`count(*)` }).from(vendors).where(eq(vendors.email, vendor.email)),
  ]);

  return {
    vendor,
    skills,
    sectors,
    certifications,
    teamMembers,
    files,
    caseStudies,
    applicationsFromEmail: Number(sameEmail[0]?.value ?? 1),
  };
}

export async function updateVendorStatus(id: number, status: VendorStatus, statusNotes?: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return ENV.devPreview ? devUpdateStatus(id, status, statusNotes) : false;
  try {
    await db
      .update(vendors)
      .set({ status, ...(statusNotes !== undefined ? { statusNotes: statusNotes || null } : {}) })
      .where(eq(vendors.id, id));
    return true;
  } catch (error) {
    console.warn("[Vendors] Failed to update vendor status:", error);
    return false;
  }
}

/** Distinct skills / certifications / sectors (with vendor counts) for the filter UI. */
export async function getVendorFacets(): Promise<{
  skills: { value: string; count: number }[];
  certifications: { value: string; count: number }[];
  sectors: { value: string; count: number }[];
}> {
  const db = await getDb();
  if (!db) return ENV.devPreview ? devFacets() : { skills: [], certifications: [], sectors: [] };

  const [skills, certifications, sectors] = await Promise.all([
    db
      .select({ value: vendorSkills.skill, count: sql<number>`count(distinct ${vendorSkills.vendorId})` })
      .from(vendorSkills)
      .groupBy(vendorSkills.skill)
      .orderBy(desc(sql`count(distinct ${vendorSkills.vendorId})`)),
    db
      .select({ value: vendorCertifications.name, count: sql<number>`count(distinct ${vendorCertifications.vendorId})` })
      .from(vendorCertifications)
      .groupBy(vendorCertifications.name)
      .orderBy(desc(sql`count(distinct ${vendorCertifications.vendorId})`)),
    db
      .select({ value: vendorSectors.sector, count: sql<number>`count(distinct ${vendorSectors.vendorId})` })
      .from(vendorSectors)
      .groupBy(vendorSectors.sector)
      .orderBy(desc(sql`count(distinct ${vendorSectors.vendorId})`)),
  ]);

  const normalize = (rows: { value: string; count: number }[]) =>
    rows.map((r) => ({ value: r.value, count: Number(r.count) }));

  return {
    skills: normalize(skills),
    certifications: normalize(certifications),
    sectors: normalize(sectors),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEV PREVIEW — in-memory vendor store
//
// Active only when ENV.devPreview is true (local, NODE_ENV !== production, no
// DATABASE_URL). Lets the /admin console work end-to-end with zero installs.
// State lives in this process and resets on restart. Once a real DATABASE_URL
// is set, getDb() returns a connection and none of this runs. Safe to delete
// this whole section once you're on a real database.
// ─────────────────────────────────────────────────────────────────────────────

type DevRecord = {
  vendor: Vendor;
  skills: VendorSkill[];
  sectors: VendorSector[];
  certifications: VendorCertification[];
  teamMembers: VendorTeamMember[];
  files: VendorFile[];
  caseStudies: VendorCaseStudy[];
};

let devSeq = 0;
let devChildSeq = 0;
const devStore: DevRecord[] = [];
let devSeeded = false;

function buildDevRecord(input: VendorApplicationData, opts: { portalForwarded?: boolean }): DevRecord {
  const id = ++devSeq;
  const now = new Date();
  const vendor: Vendor = {
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
    marketingConsent: input.marketingConsent ?? false,
    nameUsageConsent: input.nameUsageConsent ?? false,
    signature: input.signature || null,
    ndaBusinessName: input.ndaBusinessName || null,
    ndaEntityDescriptor: input.ndaEntityDescriptor || null,
    ndaAddress: input.ndaAddress || null,
    ndaSignerName: input.ndaSignerName || null,
    ndaSignerTitle: input.ndaSignerTitle || null,
    ndaSignerPhone: input.ndaSignerPhone || null,
    ndaSignerEmail: input.ndaSignerEmail || null,
    ndaSignatureText: input.ndaSignatureText || null,
    ndaSignatureDate: input.ndaSignatureDate || null,
    ndaEffectiveDate: input.ndaEffectiveDate || null,
    ndaRequestCopy: input.ndaRequestCopy ?? false,
    context: input.context || null,
    sourcePage: input.sourcePage || null,
    status: "applied",
    statusNotes: null,
    portalForwarded: opts.portalForwarded ?? false,
    createdAt: now,
    updatedAt: now,
  };
  const skills: VendorSkill[] = [
    ...(input.skills ?? []).map((skill) => ({ id: ++devChildSeq, vendorId: id, skill, source: "form" as const })),
    ...parseSkillTags(input.additionalSkills ?? "", input.skills ?? []).map((skill) => ({
      id: ++devChildSeq,
      vendorId: id,
      skill,
      source: "parsed" as const,
    })),
  ];
  const sectors: VendorSector[] = (input.sectors ?? []).map((sector) => ({ id: ++devChildSeq, vendorId: id, sector }));
  const certifications: VendorCertification[] = (input.certifications ?? [])
    .filter((c) => c.name?.trim())
    .map((c) => ({ id: ++devChildSeq, vendorId: id, name: c.name, provider: c.provider || null, isCurrent: c.isCurrent ?? true }));
  const teamMembers: VendorTeamMember[] = (input.teamMembers ?? []).map((m) => ({
    id: ++devChildSeq,
    vendorId: id,
    fullName: m.fullName || null,
    title: m.title || null,
    roleSkills: m.roleSkills || null,
    location: m.location || null,
    yearsTogether: m.yearsTogether || null,
  }));
  const files: VendorFile[] = (input.files ?? []).map((f) => ({
    id: ++devChildSeq,
    vendorId: id,
    field: f.field,
    filename: f.filename,
    mimeType: f.mimeType || null,
    sizeBytes: f.dataBase64 ? Buffer.from(f.dataBase64, "base64").length : null,
    storageRef: null,
  }));
  return { vendor, skills, sectors, certifications, teamMembers, files, caseStudies: [] };
}

function devCreateVendor(input: VendorApplicationData, opts: { portalForwarded?: boolean }): { id: number } {
  ensureDevSeeded();
  const record = buildDevRecord(input, opts);
  devStore.push(record);
  return { id: record.vendor.id };
}

function devSearchVendors(
  filters: VendorSearchFilters,
  page: number,
  pageSize: number,
): { rows: VendorListRow[]; total: number; page: number; pageSize: number } {
  ensureDevSeeded();
  let records = devStore.slice();

  const q = filters.query?.trim().toLowerCase();
  if (q) {
    records = records.filter((r) =>
      [r.vendor.name, r.vendor.email, r.vendor.personalBio, r.vendor.companyCv].some((v) =>
        (v ?? "").toLowerCase().includes(q),
      ),
    );
  }
  if (filters.vendorType) records = records.filter((r) => r.vendor.vendorTypeLabel === filters.vendorType);
  if (filters.status) records = records.filter((r) => r.vendor.status === filters.status);
  if (filters.rateMin != null)
    records = records.filter((r) => r.vendor.hourlyRateNumeric != null && r.vendor.hourlyRateNumeric >= filters.rateMin!);
  if (filters.rateMax != null)
    records = records.filter((r) => r.vendor.hourlyRateNumeric != null && r.vendor.hourlyRateNumeric <= filters.rateMax!);
  if (filters.hoursMin != null)
    records = records.filter((r) => r.vendor.hoursPerMonthNumeric != null && r.vendor.hoursPerMonthNumeric >= filters.hoursMin!);
  if (filters.hoursMax != null)
    records = records.filter((r) => r.vendor.hoursPerMonthNumeric != null && r.vendor.hoursPerMonthNumeric <= filters.hoursMax!);

  const skills = (filters.skills ?? []).filter(Boolean);
  if (skills.length) records = records.filter((r) => skills.every((s) => r.skills.some((x) => x.skill === s)));
  const certs = (filters.certifications ?? []).filter(Boolean);
  if (certs.length) records = records.filter((r) => certs.every((c) => r.certifications.some((x) => x.name === c)));
  const sectors = (filters.sectors ?? []).filter(Boolean);
  if (sectors.length) records = records.filter((r) => sectors.every((s) => r.sectors.some((x) => x.sector === s)));

  const sort = filters.sort ?? "createdAt";
  const dir = (filters.sortDir ?? "desc") === "asc" ? 1 : -1;
  records.sort((a, b) => {
    let av: string | number;
    let bv: string | number;
    switch (sort) {
      case "name":
        av = a.vendor.name;
        bv = b.vendor.name;
        break;
      case "hourlyRateNumeric":
        av = a.vendor.hourlyRateNumeric ?? -1;
        bv = b.vendor.hourlyRateNumeric ?? -1;
        break;
      case "status":
        av = a.vendor.status;
        bv = b.vendor.status;
        break;
      default:
        av = a.vendor.createdAt.getTime();
        bv = b.vendor.createdAt.getTime();
    }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  const total = records.length;
  const pageRecords = records.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
  const rows: VendorListRow[] = pageRecords.map((r) => ({
    id: r.vendor.id,
    name: r.vendor.name,
    email: r.vendor.email,
    vendorTypeLabel: r.vendor.vendorTypeLabel,
    status: r.vendor.status,
    hourlyRate: r.vendor.hourlyRate,
    hoursPerMonth: r.vendor.hoursPerMonth,
    createdAt: r.vendor.createdAt,
    skills: r.skills.map((s) => s.skill),
    certifications: r.certifications.map((c) => c.name),
    sectors: r.sectors.map((s) => s.sector),
  }));
  return { rows, total, page, pageSize };
}

function devGetVendor(id: number) {
  ensureDevSeeded();
  const r = devStore.find((x) => x.vendor.id === id);
  if (!r) return null;
  return {
    vendor: r.vendor,
    skills: r.skills,
    sectors: r.sectors,
    certifications: r.certifications,
    teamMembers: r.teamMembers,
    files: r.files,
    caseStudies: r.caseStudies,
    applicationsFromEmail: devStore.filter((x) => x.vendor.email === r.vendor.email).length,
  };
}

function devUpdateStatus(id: number, status: VendorStatus, statusNotes?: string): boolean {
  const r = devStore.find((x) => x.vendor.id === id);
  if (!r) return false;
  r.vendor.status = status;
  if (statusNotes !== undefined) r.vendor.statusNotes = statusNotes || null;
  r.vendor.updatedAt = new Date();
  return true;
}

function devFacets() {
  ensureDevSeeded();
  const facet = (pick: (r: DevRecord) => string[]) => {
    const byVendor = new Map<string, Set<number>>();
    for (const r of devStore) {
      for (const value of pick(r)) {
        if (!byVendor.has(value)) byVendor.set(value, new Set());
        byVendor.get(value)!.add(r.vendor.id);
      }
    }
    return Array.from(byVendor.entries())
      .map(([value, ids]) => ({ value, count: ids.size }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  };
  return {
    skills: facet((r) => r.skills.map((s) => s.skill)),
    certifications: facet((r) => r.certifications.map((c) => c.name)),
    sectors: facet((r) => r.sectors.map((s) => s.sector)),
  };
}

function ensureDevSeeded() {
  if (devSeeded) return;
  devSeeded = true;
  const cpa = { name: "CPA", provider: "AICPA", isCurrent: true };
  const aws = { name: "AWS Solutions Architect", provider: "Amazon Web Services", isCurrent: true };
  const seeds: { input: VendorApplicationData; status: VendorStatus }[] = [
    {
      status: "approved",
      input: {
        vendorTypeLabel: "Technology Vendor",
        name: "Maria Alvarez",
        email: "maria.alvarez@example.com",
        role: "Senior Full-Stack Engineer",
        companyName: "Alvarez Data Labs",
        websiteUrl: "https://alvarezdatalabs.com",
        personalLinkedin: "https://linkedin.com/in/maria-alvarez",
        companySocial: "https://linkedin.com/company/alvarez-data-labs",
        personalBio: "12 years building data platforms and AI integrations for fintech and healthcare.",
        hourlyRate: "$150/hr",
        hoursPerMonth: "40",
        skills: ["AWS", "Python", "React", "Node.js", "SQL"],
        sectors: ["Technology", "Healthcare"],
        certifications: [aws],
      },
    },
    {
      status: "screening",
      input: {
        vendorTypeLabel: "Finance & Accounting Vendor",
        name: "James Chen",
        email: "james.chen@example.com",
        role: "Fractional Controller",
        personalBio: "Close-cycle leader and CPA serving family offices and SaaS companies.",
        hourlyRate: "$120/hr",
        hoursPerMonth: "30",
        skills: ["QBO", "Xero", "Bill.com"],
        sectors: ["Family Office", "Financial Services"],
        certifications: [cpa],
      },
    },
    {
      status: "applied",
      input: {
        vendorTypeLabel: "Marketing Vendor",
        name: "Priya Patel",
        email: "priya.patel@example.com",
        role: "Growth & SEO Strategist",
        personalBio: "Demand-gen and SEO operator for early-stage commerce brands.",
        hourlyRate: "$95/hr",
        hoursPerMonth: "20",
        skills: ["Salesforce", "Hubspot", "Semrush"],
        sectors: ["E-Commerce", "Start-Ups"],
      },
    },
    {
      status: "onboarded",
      input: {
        vendorTypeLabel: "Technology Vendor",
        name: "David Okafor",
        email: "david.okafor@example.com",
        role: "Data & BI Engineer",
        personalBio: "Builds analytics warehouses and dashboards; ex-Big-4 data practice.",
        hourlyRate: "$160/hr",
        hoursPerMonth: "50",
        skills: ["Python", "AWS", "Power BI", "Tableau"],
        sectors: ["Financial Services"],
        certifications: [aws, { name: "Power BI Data Analyst", provider: "Microsoft", isCurrent: true }],
      },
    },
    {
      status: "approved",
      input: {
        vendorTypeLabel: "Family Office Vendor",
        name: "Sofia Rossi",
        email: "sofia.rossi@example.com",
        role: "Family Office Operations Lead",
        personalBio: "Governance and reporting specialist; Addepar power user.",
        hourlyRate: "$200/hr",
        hoursPerMonth: "15",
        skills: ["Addepar", "Excel"],
        sectors: ["Family Office"],
      },
    },
    {
      status: "applied",
      input: {
        vendorTypeLabel: "Finance & Accounting Vendor",
        name: "Liam Murphy",
        email: "liam.murphy@example.com",
        role: "ERP & Accounting Consultant",
        personalBio: "NetSuite and SAP implementations for manufacturing and real estate.",
        hourlyRate: "$110/hr",
        hoursPerMonth: "35",
        skills: ["Netsuite", "SAP", "QBD"],
        sectors: ["Manufacturing", "Real Estate"],
        certifications: [{ name: "CPA", provider: "AICPA", isCurrent: false }],
      },
    },
    {
      status: "screening",
      input: {
        vendorTypeLabel: "Marketing Vendor",
        name: "Aisha Khan",
        email: "aisha.khan@example.com",
        role: "Brand & Content Lead",
        personalBio: "Brand strategy and content for healthcare and life-sciences.",
        hourlyRate: "$85/hr",
        hoursPerMonth: "25",
        skills: ["Hubspot", "Wordpress", "Google Ads"],
        sectors: ["Healthcare", "Pharma / Bio-Tech"],
      },
    },
    {
      status: "approved",
      input: {
        vendorTypeLabel: "Technology Vendor",
        name: "Tom Becker",
        email: "tom.becker@example.com",
        role: "Founding Engineer (RPA/AI)",
        companyName: "Becker Automation Studio",
        websiteUrl: "https://beckerautomation.io",
        personalLinkedin: "https://linkedin.com/in/tom-becker",
        companySocial: "https://instagram.com/beckerautomation",
        personalBio: "Automation and RPA builder; small studio of three engineers.",
        hourlyRate: "$140/hr",
        hoursPerMonth: "40",
        additionalSkills: "GoLang, Rust, Snowflake",
        skills: ["React", "Node.js", "MongoDB", "AWS"],
        sectors: ["Start-Ups", "Technology"],
        teamMembers: [
          { fullName: "Nina Becker", title: "Engineer", roleSkills: "Frontend, React", location: "Berlin, DE", yearsTogether: "4" },
        ],
      },
    },
  ];
  seeds.forEach((seed, i) => {
    const record = buildDevRecord(seed.input, { portalForwarded: false });
    record.vendor.status = seed.status;
    record.vendor.createdAt = new Date(Date.now() - i * 36e5);
    record.vendor.updatedAt = record.vendor.createdAt;
    devStore.push(record);
  });
}
