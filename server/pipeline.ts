/**
 * Pipeline: opportunities (new-project for existing clients OR new-client
 * conversions for prospects). Stored alongside clients/projects in the same
 * Postgres `dt_site` schema and reuses the same pool.
 *
 * On close-won, an opportunity promotes itself: for `new_project` kind it
 * calls createProject on its already-linked client; for `new_client` kind it
 * calls createClient first, then createProject. The resulting IDs are stamped
 * back on the row so the pipeline retains a permanent link to what shipped.
 */
import { createClient, createProject } from "./engagements";
import { getPool } from "./vendors";

export const OPPORTUNITY_KINDS = ["new_project", "new_client"] as const;
export type OpportunityKind = (typeof OPPORTUNITY_KINDS)[number];

export const OPPORTUNITY_STAGES = [
  "intake",
  "qualified",
  "discovery",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
] as const;
export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number];

export const ACTIVITY_KINDS = ["note", "call", "email", "meeting", "stage_change", "system"] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export type Opportunity = {
  id: number;
  kind: OpportunityKind;
  clientId: number | null;
  prospectName: string | null;
  prospectCompany: string | null;
  prospectEmail: string | null;
  prospectPhone: string | null;
  prospectSource: string | null;
  title: string;
  stage: OpportunityStage;
  estValueCents: number | null;
  estCloseDate: string | null;
  probabilityPct: number | null;
  ownerEmail: string | null;
  nextStep: string | null;
  nextStepDue: string | null;
  notes: string | null;
  lossReason: string | null;
  resultingClientId: number | null;
  resultingProjectId: number | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OpportunityActivity = {
  id: number;
  opportunityId: number;
  kind: ActivityKind;
  body: string | null;
  occurredAt: string;
  authorEmail: string | null;
};

export type OpportunityWithJoins = Opportunity & {
  clientName: string | null;
  resultingClientName: string | null;
  resultingProjectName: string | null;
};

let _ready = false;
async function ensureTables() {
  const pool = getPool();
  if (!pool) return null;
  if (_ready) return pool;
  await pool.query(`CREATE SCHEMA IF NOT EXISTS dt_site`);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.opportunity (
       id serial PRIMARY KEY,
       kind text NOT NULL,
       client_id integer REFERENCES dt_site.client(id) ON DELETE SET NULL,
       prospect_name text,
       prospect_company text,
       prospect_email text,
       prospect_phone text,
       prospect_source text,
       title text NOT NULL,
       stage text NOT NULL DEFAULT 'intake',
       est_value_cents bigint,
       est_close_date text,
       probability_pct smallint,
       owner_email text,
       next_step text,
       next_step_due text,
       notes text,
       loss_reason text,
       resulting_client_id integer REFERENCES dt_site.client(id) ON DELETE SET NULL,
       resulting_project_id integer REFERENCES dt_site.project(id) ON DELETE SET NULL,
       closed_at timestamptz,
       created_at timestamptz NOT NULL DEFAULT now(),
       updated_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  await pool.query(`CREATE INDEX IF NOT EXISTS opportunity_stage_idx ON dt_site.opportunity (stage)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS opportunity_client_idx ON dt_site.opportunity (client_id)`);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.opportunity_activity (
       id serial PRIMARY KEY,
       opportunity_id integer NOT NULL REFERENCES dt_site.opportunity(id) ON DELETE CASCADE,
       kind text NOT NULL,
       body text,
       occurred_at timestamptz NOT NULL DEFAULT now(),
       author_email text,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  await pool.query(`CREATE INDEX IF NOT EXISTS opportunity_activity_opp_idx ON dt_site.opportunity_activity (opportunity_id)`);
  _ready = true;
  return pool;
}

const OPPORTUNITY_COLUMNS = `
  o.id, o.kind, o.client_id, o.prospect_name, o.prospect_company, o.prospect_email,
  o.prospect_phone, o.prospect_source, o.title, o.stage, o.est_value_cents,
  o.est_close_date, o.probability_pct, o.owner_email, o.next_step, o.next_step_due,
  o.notes, o.loss_reason, o.resulting_client_id, o.resulting_project_id,
  o.closed_at, o.created_at, o.updated_at,
  c.name AS client_name,
  rc.name AS resulting_client_name,
  rp.name AS resulting_project_name
`;

const OPPORTUNITY_JOINS = `
  FROM dt_site.opportunity o
  LEFT JOIN dt_site.client  c  ON c.id  = o.client_id
  LEFT JOIN dt_site.client  rc ON rc.id = o.resulting_client_id
  LEFT JOIN dt_site.project rp ON rp.id = o.resulting_project_id
`;

function asString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function asNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function isStage(value: unknown): value is OpportunityStage {
  return typeof value === "string" && (OPPORTUNITY_STAGES as readonly string[]).includes(value);
}

function isKind(value: unknown): value is OpportunityKind {
  return typeof value === "string" && (OPPORTUNITY_KINDS as readonly string[]).includes(value);
}

function mapOpportunityRow(r: Record<string, unknown>): OpportunityWithJoins {
  return {
    id: r.id as number,
    kind: isKind(r.kind) ? r.kind : "new_project",
    clientId: asNumber(r.client_id),
    prospectName: asString(r.prospect_name),
    prospectCompany: asString(r.prospect_company),
    prospectEmail: asString(r.prospect_email),
    prospectPhone: asString(r.prospect_phone),
    prospectSource: asString(r.prospect_source),
    title: r.title as string,
    stage: isStage(r.stage) ? r.stage : "intake",
    estValueCents: asNumber(r.est_value_cents),
    estCloseDate: asString(r.est_close_date),
    probabilityPct: asNumber(r.probability_pct),
    ownerEmail: asString(r.owner_email),
    nextStep: asString(r.next_step),
    nextStepDue: asString(r.next_step_due),
    notes: asString(r.notes),
    lossReason: asString(r.loss_reason),
    resultingClientId: asNumber(r.resulting_client_id),
    resultingProjectId: asNumber(r.resulting_project_id),
    closedAt: asString(r.closed_at),
    createdAt: asString(r.created_at) ?? "",
    updatedAt: asString(r.updated_at) ?? "",
    clientName: asString(r.client_name),
    resultingClientName: asString(r.resulting_client_name),
    resultingProjectName: asString(r.resulting_project_name),
  };
}

function mapActivityRow(r: Record<string, unknown>): OpportunityActivity {
  const kind = typeof r.kind === "string" && (ACTIVITY_KINDS as readonly string[]).includes(r.kind)
    ? (r.kind as ActivityKind)
    : "note";
  return {
    id: r.id as number,
    opportunityId: r.opportunity_id as number,
    kind,
    body: asString(r.body),
    occurredAt: asString(r.occurred_at) ?? "",
    authorEmail: asString(r.author_email),
  };
}

export async function listOpportunities(): Promise<OpportunityWithJoins[]> {
  const pool = await ensureTables();
  if (!pool) return [];
  const r = await pool.query(
    `SELECT ${OPPORTUNITY_COLUMNS} ${OPPORTUNITY_JOINS}
     ORDER BY
       CASE o.stage
         WHEN 'intake' THEN 1
         WHEN 'qualified' THEN 2
         WHEN 'discovery' THEN 3
         WHEN 'proposal' THEN 4
         WHEN 'negotiation' THEN 5
         WHEN 'closed_won' THEN 6
         WHEN 'closed_lost' THEN 7
         ELSE 99
       END,
       o.updated_at DESC`,
  );
  return r.rows.map(mapOpportunityRow);
}

export async function getOpportunity(
  id: number,
): Promise<(OpportunityWithJoins & { activities: OpportunityActivity[] }) | null> {
  const pool = await ensureTables();
  if (!pool) return null;
  const r = await pool.query(`SELECT ${OPPORTUNITY_COLUMNS} ${OPPORTUNITY_JOINS} WHERE o.id = $1`, [id]);
  if (!r.rows.length) return null;
  const a = await pool.query(
    `SELECT id, opportunity_id, kind, body, occurred_at, author_email
       FROM dt_site.opportunity_activity
      WHERE opportunity_id = $1
      ORDER BY occurred_at DESC, id DESC`,
    [id],
  );
  return { ...mapOpportunityRow(r.rows[0]), activities: a.rows.map(mapActivityRow) };
}

export type OpportunityCreateInput = {
  kind: OpportunityKind;
  title: string;
  clientId?: number | null;
  prospectName?: string;
  prospectCompany?: string;
  prospectEmail?: string;
  prospectPhone?: string;
  prospectSource?: string;
  stage?: OpportunityStage;
  estValueCents?: number | null;
  estCloseDate?: string;
  probabilityPct?: number | null;
  ownerEmail?: string;
  nextStep?: string;
  nextStepDue?: string;
  notes?: string;
};

export async function createOpportunity(
  input: OpportunityCreateInput,
  authorEmail: string | null,
): Promise<OpportunityWithJoins | null> {
  const pool = await ensureTables();
  if (!pool) return null;
  const stage: OpportunityStage = input.stage && isStage(input.stage) ? input.stage : "intake";
  const r = await pool.query(
    `INSERT INTO dt_site.opportunity
       (kind, client_id, prospect_name, prospect_company, prospect_email, prospect_phone,
        prospect_source, title, stage, est_value_cents, est_close_date, probability_pct,
        owner_email, next_step, next_step_due, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING id`,
    [
      input.kind,
      input.clientId ?? null,
      input.prospectName ?? null,
      input.prospectCompany ?? null,
      input.prospectEmail ?? null,
      input.prospectPhone ?? null,
      input.prospectSource ?? null,
      input.title,
      stage,
      input.estValueCents ?? null,
      input.estCloseDate ?? null,
      input.probabilityPct ?? null,
      input.ownerEmail ?? authorEmail ?? null,
      input.nextStep ?? null,
      input.nextStepDue ?? null,
      input.notes ?? null,
    ],
  );
  const id = r.rows[0].id as number;
  await pool.query(
    `INSERT INTO dt_site.opportunity_activity (opportunity_id, kind, body, author_email)
     VALUES ($1, 'system', $2, $3)`,
    [id, "Opportunity created", authorEmail],
  );
  const created = await getOpportunity(id);
  return created;
}

export type OpportunityUpdateInput = {
  clientId?: number | null;
  prospectName?: string;
  prospectCompany?: string;
  prospectEmail?: string;
  prospectPhone?: string;
  prospectSource?: string;
  title?: string;
  estValueCents?: number | null;
  estCloseDate?: string;
  probabilityPct?: number | null;
  ownerEmail?: string;
  nextStep?: string;
  nextStepDue?: string;
  notes?: string;
};

const UPDATE_COL_BY_FIELD: Record<keyof OpportunityUpdateInput, string> = {
  clientId: "client_id",
  prospectName: "prospect_name",
  prospectCompany: "prospect_company",
  prospectEmail: "prospect_email",
  prospectPhone: "prospect_phone",
  prospectSource: "prospect_source",
  title: "title",
  estValueCents: "est_value_cents",
  estCloseDate: "est_close_date",
  probabilityPct: "probability_pct",
  ownerEmail: "owner_email",
  nextStep: "next_step",
  nextStepDue: "next_step_due",
  notes: "notes",
};

export async function updateOpportunity(id: number, fields: OpportunityUpdateInput): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [field, col] of Object.entries(UPDATE_COL_BY_FIELD)) {
    const value = (fields as Record<string, unknown>)[field];
    if (value !== undefined) {
      sets.push(`${col} = $${sets.length + 1}`);
      vals.push(value === "" ? null : value);
    }
  }
  if (!sets.length) return true;
  sets.push(`updated_at = now()`);
  vals.push(id);
  await pool.query(`UPDATE dt_site.opportunity SET ${sets.join(", ")} WHERE id = $${vals.length}`, vals);
  return true;
}

export async function setStage(id: number, stage: OpportunityStage, authorEmail: string | null): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(
    `UPDATE dt_site.opportunity SET stage = $1, updated_at = now() WHERE id = $2`,
    [stage, id],
  );
  await pool.query(
    `INSERT INTO dt_site.opportunity_activity (opportunity_id, kind, body, author_email)
     VALUES ($1, 'stage_change', $2, $3)`,
    [id, `Moved to ${stage.replace("_", " ")}`, authorEmail],
  );
  return true;
}

export async function addActivity(
  opportunityId: number,
  kind: ActivityKind,
  body: string,
  authorEmail: string | null,
  occurredAt?: string,
): Promise<OpportunityActivity | null> {
  const pool = await ensureTables();
  if (!pool) return null;
  const r = await pool.query(
    `INSERT INTO dt_site.opportunity_activity (opportunity_id, kind, body, author_email, occurred_at)
     VALUES ($1, $2, $3, $4, COALESCE($5::timestamptz, now()))
     RETURNING id, opportunity_id, kind, body, occurred_at, author_email`,
    [opportunityId, kind, body, authorEmail, occurredAt ?? null],
  );
  await pool.query(`UPDATE dt_site.opportunity SET updated_at = now() WHERE id = $1`, [opportunityId]);
  return mapActivityRow(r.rows[0]);
}

export async function deleteOpportunity(id: number): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(`DELETE FROM dt_site.opportunity WHERE id = $1`, [id]);
  return true;
}

export type CloseWonInput = {
  /** Project name to create on the client. Defaults to the opportunity title. */
  projectName?: string;
  /** When kind=new_client, the client name to create. Defaults to prospect_company. */
  clientName?: string;
};

export type CloseWonResult = {
  ok: boolean;
  clientId: number | null;
  projectId: number | null;
  reason?: string;
};

/** Close-won: promote the opportunity to a real client (if needed) + project. */
export async function closeWon(
  id: number,
  input: CloseWonInput,
  authorEmail: string | null,
): Promise<CloseWonResult> {
  const opp = await getOpportunity(id);
  if (!opp) return { ok: false, clientId: null, projectId: null, reason: "Opportunity not found." };
  const pool = await ensureTables();
  if (!pool) return { ok: false, clientId: null, projectId: null, reason: "Database not available." };

  let clientId = opp.clientId;
  if (opp.kind === "new_client") {
    const name = (input.clientName ?? opp.prospectCompany ?? opp.prospectName ?? "").trim();
    if (!name) {
      return {
        ok: false,
        clientId: null,
        projectId: null,
        reason: "Client name is required to close-won a new-client opportunity.",
      };
    }
    const newClient = await createClient(name);
    if (!newClient) return { ok: false, clientId: null, projectId: null, reason: "Could not create client." };
    clientId = newClient.id;
  }

  if (clientId == null) {
    return {
      ok: false,
      clientId: null,
      projectId: null,
      reason: "Existing client must be selected before closing a new-project opportunity.",
    };
  }

  const projectName = (input.projectName ?? opp.title).trim();
  if (!projectName) {
    return { ok: false, clientId, projectId: null, reason: "Project name is required." };
  }
  const project = await createProject(clientId, projectName);
  if (!project) return { ok: false, clientId, projectId: null, reason: "Could not create project." };

  await pool.query(
    `UPDATE dt_site.opportunity
       SET stage = 'closed_won',
           closed_at = now(),
           updated_at = now(),
           client_id = COALESCE(client_id, $2),
           resulting_client_id = $2,
           resulting_project_id = $3
     WHERE id = $1`,
    [id, clientId, project.id],
  );
  await pool.query(
    `INSERT INTO dt_site.opportunity_activity (opportunity_id, kind, body, author_email)
     VALUES ($1, 'system', $2, $3)`,
    [id, `Closed-won → created project "${projectName}".`, authorEmail],
  );
  return { ok: true, clientId, projectId: project.id };
}

export async function closeLost(id: number, reason: string | null, authorEmail: string | null): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(
    `UPDATE dt_site.opportunity
       SET stage = 'closed_lost', closed_at = now(), updated_at = now(), loss_reason = $2
     WHERE id = $1`,
    [id, reason ?? null],
  );
  await pool.query(
    `INSERT INTO dt_site.opportunity_activity (opportunity_id, kind, body, author_email)
     VALUES ($1, 'system', $2, $3)`,
    [id, reason ? `Closed-lost — ${reason}` : "Closed-lost", authorEmail],
  );
  return true;
}
