/**
 * Needs Assessments — structured intake forms collected from the public Get
 * Started page. Each submission is persisted to dt_site.needs_assessment and
 * forwarded to the DT Portal, which stores it and emails the team
 * (vendors@/hello@) — the same path as contact + vendor submissions.
 *
 * Currently supports one kind ("outsourced_accounting"); the table carries a
 * kind column so additional assessment types can be added without schema churn.
 * The full structured answer set is persisted as JSONB so the form can evolve
 * without migrations.
 */
import { forwardAssessmentToPortal } from "./portal";
import { getPool } from "./vendors";

export const NEEDS_ASSESSMENT_KINDS = ["outsourced_accounting"] as const;
export type NeedsAssessmentKind = (typeof NEEDS_ASSESSMENT_KINDS)[number];

export type AccountingAssessmentInput = {
  // Profile
  familyOfficeName: string;
  contactName: string;
  contactRole?: string;
  websiteUrl?: string;
  additionalWebsites?: string[];
  contactEmail: string;
  contactPhone?: string;
  hqLocation?: string;
  // Scale
  annualRevenue?: string;
  backOfficeSize?: string;
  entityCount?: string;
  operatingBusinesses?: string;
  // Composition
  owns501c3?: string;
  jurisdictions?: string[];
  // Current systems
  generalLedgerSystems?: string[];
  generalLedgerSystemOther?: string;
  billPaySystems?: string[];
  billPaySystemOther?: string;
  usesErp?: string;
  erpPlatforms?: string[];
  erpPlatformOther?: string;
  payrollSystems?: string[];
  payrollSystemOther?: string;
  // Close, reporting & volume
  monthEndCloseTimeline?: string;
  monthlyBillVolume?: string;
  accountsToReconcile?: string;
  payrollHeadcount?: string;
  // Goals & timing
  painPoints?: string;
  primaryGoals?: string[];
  timeline?: string;
  // Meta
  sourcePage?: string;
};

let _ready = false;
async function ensureTables() {
  const pool = getPool();
  if (!pool) return null;
  if (_ready) return pool;
  await pool.query(`CREATE SCHEMA IF NOT EXISTS dt_site`);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.needs_assessment (
       id serial PRIMARY KEY,
       kind text NOT NULL,
       family_office_name text,
       contact_name text,
       contact_role text,
       contact_email text,
       contact_phone text,
       payload jsonb NOT NULL DEFAULT '{}'::jsonb,
       source_page text,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  await pool.query(`CREATE INDEX IF NOT EXISTS needs_assessment_kind_idx ON dt_site.needs_assessment (kind)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS needs_assessment_email_idx ON dt_site.needs_assessment (contact_email)`);
  _ready = true;
  return pool;
}

export async function submitAccountingAssessment(input: AccountingAssessmentInput): Promise<{ id: number | null }> {
  const pool = await ensureTables();
  const kind: NeedsAssessmentKind = "outsourced_accounting";
  let id: number | null = null;
  if (pool) {
    const r = await pool.query(
      `INSERT INTO dt_site.needs_assessment
         (kind, family_office_name, contact_name, contact_role, contact_email, contact_phone, payload, source_page)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [
        kind,
        input.familyOfficeName || null,
        input.contactName || null,
        input.contactRole || null,
        input.contactEmail || null,
        input.contactPhone || null,
        JSON.stringify(input),
        input.sourcePage || null,
      ],
    );
    id = r.rows[0]?.id ?? null;
  }

  // Forward to the DT Portal (system of record alongside contact + vendor
  // submissions); the portal stores it and emails the team. Best-effort: the
  // dt_site write above is the primary path, so a portal outage never fails the
  // public submission.
  await forwardAssessmentToPortal({ kind, ...input }).catch((err) => {
    console.warn("[Assessments] Portal forward failed:", err);
    return false;
  });

  return { id };
}
