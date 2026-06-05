/**
 * Engagements: clients, their projects, vendor-to-project assignments, and the
 * compensation arrangements per vendor-project. All in our isolated dt_site
 * schema (the portal's tables are never touched). Reuses the vendors.ts pool.
 */
import { getPool } from "./vendors";

export const COMP_TYPES = ["fixed_fee", "fixed_hours", "time_materials", "success_fee"] as const;
export type CompType = (typeof COMP_TYPES)[number];

export type ClientContact = {
  id: number;
  clientId: number;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
};
export type Client = {
  id: number;
  name: string;
  active: boolean;
  ndaWall: boolean;
  legalName: string | null;
  address: string | null;
  website: string | null;
  originator: string | null;
  intakeDate: string | null;
  referrer: string | null;
};
export type Project = { id: number; clientId: number; name: string; active: boolean };
export type CompLine = { id: number; type: string; details: Record<string, unknown> };

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = map.get(k);
    if (list) list.push(item);
    else map.set(k, [item]);
  }
  return map;
}

let _ready = false;
async function ensureTables() {
  const pool = getPool();
  if (!pool) return null;
  if (_ready) return pool;
  await pool.query(`CREATE SCHEMA IF NOT EXISTS dt_site`);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.client (
       id serial PRIMARY KEY,
       name text NOT NULL,
       active boolean NOT NULL DEFAULT true,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  // Client-NDA Wall: this client requires a tri-party (Client + Digital Therapy
  // + Vendor) NDA from every vendor who could touch their PII. Idempotent.
  await pool.query(`ALTER TABLE dt_site.client ADD COLUMN IF NOT EXISTS nda_wall boolean NOT NULL DEFAULT false`);
  // Company detail fields for the client (used to fill the tri-party NDA). Idempotent.
  await pool.query(
    `ALTER TABLE dt_site.client
       ADD COLUMN IF NOT EXISTS legal_name text,
       ADD COLUMN IF NOT EXISTS address text,
       ADD COLUMN IF NOT EXISTS website text,
       ADD COLUMN IF NOT EXISTS originator text,
       ADD COLUMN IF NOT EXISTS intake_date text,
       ADD COLUMN IF NOT EXISTS referrer text`,
  );
  // Client-level resource roster: which vendors (incl. core team) are assigned
  // to this client overall. vendor_application_id references the portal's
  // VendorApplication.id (text); no FK since that table is the portal's.
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.client_resource (
       id serial PRIMARY KEY,
       client_id integer NOT NULL REFERENCES dt_site.client(id) ON DELETE CASCADE,
       vendor_application_id text NOT NULL,
       created_at timestamptz NOT NULL DEFAULT now(),
       UNIQUE (client_id, vendor_application_id)
     )`,
  );
  await pool.query(`CREATE INDEX IF NOT EXISTS client_resource_client_idx ON dt_site.client_resource (client_id)`);
  // Tri-party NDA tracker per vendor<->client. 'pending' = required but not yet
  // sent/signed; the signing workflow (later) advances this to sent/signed.
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.vendor_nda (
       id serial PRIMARY KEY,
       vendor_application_id text NOT NULL,
       client_id integer NOT NULL REFERENCES dt_site.client(id) ON DELETE CASCADE,
       status text NOT NULL DEFAULT 'pending',
       created_at timestamptz NOT NULL DEFAULT now(),
       UNIQUE (vendor_application_id, client_id)
     )`,
  );
  // People we deal with at each client; one markable as the primary signer.
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.client_contact (
       id serial PRIMARY KEY,
       client_id integer NOT NULL REFERENCES dt_site.client(id) ON DELETE CASCADE,
       name text NOT NULL,
       title text,
       email text,
       phone text,
       is_primary boolean NOT NULL DEFAULT false,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  await pool.query(`CREATE INDEX IF NOT EXISTS client_contact_client_idx ON dt_site.client_contact (client_id)`);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.project (
       id serial PRIMARY KEY,
       client_id integer NOT NULL REFERENCES dt_site.client(id) ON DELETE CASCADE,
       name text NOT NULL,
       active boolean NOT NULL DEFAULT true,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.vendor_project (
       id serial PRIMARY KEY,
       vendor_application_id text NOT NULL,
       project_id integer NOT NULL REFERENCES dt_site.project(id) ON DELETE CASCADE,
       created_at timestamptz NOT NULL DEFAULT now(),
       UNIQUE (vendor_application_id, project_id)
     )`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.vendor_project_comp (
       id serial PRIMARY KEY,
       vendor_project_id integer NOT NULL REFERENCES dt_site.vendor_project(id) ON DELETE CASCADE,
       type text NOT NULL,
       details jsonb NOT NULL DEFAULT '{}'::jsonb,
       created_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  await seedSampleClients(pool);
  _ready = true;
  return pool;
}

async function seedSampleClients(pool: NonNullable<ReturnType<typeof getPool>>) {
  const { rows } = await pool.query(`SELECT count(*)::int AS n FROM dt_site.client`);
  if (rows[0].n > 0) return;
  const samples = [
    { name: "Aspen Family Office", projects: ["Data Warehouse Buildout", "Monthly Reporting Automation"] },
    { name: "Northwind Capital", projects: ["AP/AR Automation", "Salesforce Migration"] },
  ];
  for (const s of samples) {
    const c = await pool.query(`INSERT INTO dt_site.client (name) VALUES ($1) RETURNING id`, [s.name]);
    for (const p of s.projects) {
      await pool.query(`INSERT INTO dt_site.project (client_id, name) VALUES ($1, $2)`, [c.rows[0].id, p]);
    }
  }
}

// ── Clients & projects management ────────────────────────────────────────────

function mapClientRow(c: Record<string, unknown>): Client {
  return {
    id: c.id as number,
    name: c.name as string,
    active: c.active === true,
    ndaWall: c.nda_wall === true,
    legalName: (c.legal_name as string) ?? null,
    address: (c.address as string) ?? null,
    website: (c.website as string) ?? null,
    originator: (c.originator as string) ?? null,
    intakeDate: (c.intake_date as string) ?? null,
    referrer: (c.referrer as string) ?? null,
  };
}

function mapContactRow(c: Record<string, unknown>): ClientContact {
  return {
    id: c.id as number,
    clientId: c.client_id as number,
    name: c.name as string,
    title: (c.title as string) ?? null,
    email: (c.email as string) ?? null,
    phone: (c.phone as string) ?? null,
    isPrimary: c.is_primary === true,
  };
}

export async function listClients(): Promise<
  (Client & { projects: Project[]; contacts: ClientContact[]; resourceIds: string[] })[]
> {
  const pool = await ensureTables();
  if (!pool) return [];
  const clients = await pool.query(
    `SELECT id, name, active, nda_wall, legal_name, address, website, originator, intake_date, referrer
       FROM dt_site.client ORDER BY name`,
  );
  const projects = await pool.query(`SELECT id, client_id, name, active FROM dt_site.project ORDER BY name`);
  const contacts = await pool.query(
    `SELECT id, client_id, name, title, email, phone, is_primary FROM dt_site.client_contact
     ORDER BY is_primary DESC, name`,
  );
  const resources = await pool.query(`SELECT client_id, vendor_application_id FROM dt_site.client_resource`);
  const projByClient = groupBy(projects.rows, (p) => p.client_id as number);
  const contactsByClient = groupBy(contacts.rows, (c) => c.client_id as number);
  const resByClient = groupBy(resources.rows, (r) => r.client_id as number);
  return clients.rows.map((c) => ({
    ...mapClientRow(c),
    projects: (projByClient.get(c.id) ?? []).map((p) => ({
      id: p.id,
      clientId: p.client_id,
      name: p.name,
      active: p.active,
    })),
    contacts: (contactsByClient.get(c.id) ?? []).map(mapContactRow),
    resourceIds: (resByClient.get(c.id) ?? []).map((r) => String(r.vendor_application_id)),
  }));
}

export async function createClient(name: string): Promise<Client | null> {
  const pool = await ensureTables();
  if (!pool) return null;
  const r = await pool.query(
    `INSERT INTO dt_site.client (name) VALUES ($1)
     RETURNING id, name, active, nda_wall, legal_name, address, website, originator, intake_date, referrer`,
    [name],
  );
  return mapClientRow(r.rows[0]);
}

export async function updateClient(
  id: number,
  fields: {
    name?: string;
    active?: boolean;
    ndaWall?: boolean;
    legalName?: string;
    address?: string;
    website?: string;
    originator?: string;
    intakeDate?: string;
    referrer?: string;
  },
): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  const colByField: Record<string, string> = {
    name: "name",
    active: "active",
    ndaWall: "nda_wall",
    legalName: "legal_name",
    address: "address",
    website: "website",
    originator: "originator",
    intakeDate: "intake_date",
    referrer: "referrer",
  };
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [field, col] of Object.entries(colByField)) {
    const value = (fields as Record<string, unknown>)[field];
    if (value !== undefined) {
      sets.push(`${col} = $${sets.length + 1}`);
      vals.push(value);
    }
  }
  if (!sets.length) return true;
  vals.push(id);
  await pool.query(`UPDATE dt_site.client SET ${sets.join(", ")} WHERE id = $${vals.length}`, vals);
  return true;
}

/** Assign/unassign a vendor (team member or vendor) to a client's roster. */
export async function setClientResource(
  clientId: number,
  vendorApplicationId: string,
  assigned: boolean,
): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  if (assigned) {
    await pool.query(
      `INSERT INTO dt_site.client_resource (client_id, vendor_application_id)
       VALUES ($1, $2) ON CONFLICT (client_id, vendor_application_id) DO NOTHING`,
      [clientId, vendorApplicationId],
    );
  } else {
    await pool.query(`DELETE FROM dt_site.client_resource WHERE client_id = $1 AND vendor_application_id = $2`, [
      clientId,
      vendorApplicationId,
    ]);
  }
  return true;
}

// ── Client contacts ──────────────────────────────────────────────────────────

export async function addContact(
  clientId: number,
  fields: { name: string; title?: string; email?: string; phone?: string },
): Promise<ClientContact | null> {
  const pool = await ensureTables();
  if (!pool) return null;
  const r = await pool.query(
    `INSERT INTO dt_site.client_contact (client_id, name, title, email, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, client_id, name, title, email, phone, is_primary`,
    [clientId, fields.name, fields.title || null, fields.email || null, fields.phone || null],
  );
  return mapContactRow(r.rows[0]);
}

export async function updateContact(
  id: number,
  fields: { name?: string; title?: string; email?: string; phone?: string },
): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  const colByField: Record<string, string> = { name: "name", title: "title", email: "email", phone: "phone" };
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [field, col] of Object.entries(colByField)) {
    const value = (fields as Record<string, unknown>)[field];
    if (value !== undefined) {
      sets.push(`${col} = $${sets.length + 1}`);
      vals.push(value === "" ? null : value);
    }
  }
  if (!sets.length) return true;
  vals.push(id);
  await pool.query(`UPDATE dt_site.client_contact SET ${sets.join(", ")} WHERE id = $${vals.length}`, vals);
  return true;
}

export async function removeContact(id: number): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(`DELETE FROM dt_site.client_contact WHERE id = $1`, [id]);
  return true;
}

/** Make one contact the client's primary (signer); clears any other primary. */
export async function setPrimaryContact(clientId: number, contactId: number): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(
    `UPDATE dt_site.client_contact
       SET is_primary = (id = $2)
     WHERE client_id = $1`,
    [clientId, contactId],
  );
  return true;
}

export async function deleteClient(id: number): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(`DELETE FROM dt_site.client WHERE id = $1`, [id]);
  return true;
}

/** Inline from a vendor profile: mark a client as NDA-walled AND record that
 * THIS vendor needs the tri-party NDA for it (status 'pending'). The actual
 * document generation + send is wired when the NDA workflow + email go live. */
export async function requireClientNda(vendorAppId: string, clientId: number): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(`UPDATE dt_site.client SET nda_wall = true WHERE id = $1`, [clientId]);
  await pool.query(
    `INSERT INTO dt_site.vendor_nda (vendor_application_id, client_id, status)
     VALUES ($1, $2, 'pending') ON CONFLICT (vendor_application_id, client_id) DO NOTHING`,
    [vendorAppId, clientId],
  );
  return true;
}

export async function createProject(clientId: number, name: string): Promise<Project | null> {
  const pool = await ensureTables();
  if (!pool) return null;
  const r = await pool.query(
    `INSERT INTO dt_site.project (client_id, name) VALUES ($1, $2) RETURNING id, client_id, name, active`,
    [clientId, name],
  );
  const p = r.rows[0];
  return { id: p.id, clientId: p.client_id, name: p.name, active: p.active };
}

export async function updateProject(id: number, fields: { name?: string; active?: boolean }): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  const sets: string[] = [];
  const vals: unknown[] = [];
  if (fields.name !== undefined) {
    sets.push(`name = $${sets.length + 1}`);
    vals.push(fields.name);
  }
  if (fields.active !== undefined) {
    sets.push(`active = $${sets.length + 1}`);
    vals.push(fields.active);
  }
  if (!sets.length) return true;
  vals.push(id);
  await pool.query(`UPDATE dt_site.project SET ${sets.join(", ")} WHERE id = $${vals.length}`, vals);
  return true;
}

export async function deleteProject(id: number): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(`DELETE FROM dt_site.project WHERE id = $1`, [id]);
  return true;
}

// ── Vendor assignments & compensation ────────────────────────────────────────

export async function setVendorProject(vendorAppId: string, projectId: number, assigned: boolean): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  if (assigned) {
    await pool.query(
      `INSERT INTO dt_site.vendor_project (vendor_application_id, project_id)
       VALUES ($1, $2) ON CONFLICT (vendor_application_id, project_id) DO NOTHING`,
      [vendorAppId, projectId],
    );
  } else {
    await pool.query(`DELETE FROM dt_site.vendor_project WHERE vendor_application_id = $1 AND project_id = $2`, [
      vendorAppId,
      projectId,
    ]);
  }
  return true;
}

export async function addComp(vendorProjectId: number, type: string, details: Record<string, unknown>): Promise<CompLine | null> {
  const pool = await ensureTables();
  if (!pool) return null;
  const r = await pool.query(
    `INSERT INTO dt_site.vendor_project_comp (vendor_project_id, type, details)
     VALUES ($1, $2, $3) RETURNING id, type, details`,
    [vendorProjectId, type, JSON.stringify(details ?? {})],
  );
  return r.rows[0];
}

export async function updateComp(id: number, type: string, details: Record<string, unknown>): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(`UPDATE dt_site.vendor_project_comp SET type = $1, details = $2 WHERE id = $3`, [
    type,
    JSON.stringify(details ?? {}),
    id,
  ]);
  return true;
}

export async function removeComp(id: number): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(`DELETE FROM dt_site.vendor_project_comp WHERE id = $1`, [id]);
  return true;
}

/** Everything the vendor detail engagement section needs, in one read. */
export async function getVendorEngagements(vendorAppId: string) {
  const pool = await ensureTables();
  if (!pool) return { clients: [] };
  const clients = await pool.query(`SELECT id, name, nda_wall FROM dt_site.client WHERE active = true ORDER BY name`);
  const projects = await pool.query(`SELECT id, client_id, name FROM dt_site.project WHERE active = true ORDER BY name`);
  const vps = await pool.query(`SELECT id, project_id FROM dt_site.vendor_project WHERE vendor_application_id = $1`, [
    vendorAppId,
  ]);
  const vpByProject = new Map<number, number>();
  for (const v of vps.rows) vpByProject.set(v.project_id, v.id);
  const vpIds = vps.rows.map((v) => v.id);
  const comps = vpIds.length
    ? await pool.query(
        `SELECT id, vendor_project_id, type, details FROM dt_site.vendor_project_comp
         WHERE vendor_project_id = ANY($1::int[]) ORDER BY id`,
        [vpIds],
      )
    : { rows: [] as { id: number; vendor_project_id: number; type: string; details: Record<string, unknown> }[] };
  const ndas = await pool.query(
    `SELECT client_id, status FROM dt_site.vendor_nda WHERE vendor_application_id = $1`,
    [vendorAppId],
  );
  const ndaStatusByClient = new Map<number, string>(ndas.rows.map((r) => [r.client_id as number, r.status as string]));
  const compsByVp = groupBy(comps.rows, (c) => c.vendor_project_id);
  const projByClient = groupBy(projects.rows, (p) => p.client_id as number);

  return {
    clients: clients.rows.map((c) => ({
      id: c.id,
      name: c.name,
      ndaWall: c.nda_wall === true,
      ndaStatus: ndaStatusByClient.get(c.id) ?? null,
      projects: (projByClient.get(c.id) ?? []).map((p) => {
        const vpId = vpByProject.get(p.id) ?? null;
        return {
          id: p.id,
          name: p.name,
          assigned: vpId != null,
          vendorProjectId: vpId,
          comps: vpId != null ? (compsByVp.get(vpId) ?? []).map((c) => ({ id: c.id, type: c.type, details: c.details })) : [],
        };
      }),
    })),
  };
}
