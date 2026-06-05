/**
 * Engagements: clients, their projects, vendor-to-project assignments, and the
 * compensation arrangements per vendor-project. All in our isolated dt_site
 * schema (the portal's tables are never touched). Reuses the vendors.ts pool.
 */
import { getPool } from "./vendors";

export const COMP_TYPES = ["fixed_fee", "fixed_hours", "time_materials", "success_fee"] as const;
export type CompType = (typeof COMP_TYPES)[number];

export type Client = { id: number; name: string; active: boolean; ndaWall: boolean };
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

export async function listClients(): Promise<(Client & { projects: Project[] })[]> {
  const pool = await ensureTables();
  if (!pool) return [];
  const clients = await pool.query(`SELECT id, name, active, nda_wall FROM dt_site.client ORDER BY name`);
  const projects = await pool.query(`SELECT id, client_id, name, active FROM dt_site.project ORDER BY name`);
  const byClient = groupBy(projects.rows, (p) => p.client_id as number);
  return clients.rows.map((c) => ({
    id: c.id,
    name: c.name,
    active: c.active,
    ndaWall: c.nda_wall === true,
    projects: (byClient.get(c.id) ?? []).map((p) => ({ id: p.id, clientId: p.client_id, name: p.name, active: p.active })),
  }));
}

export async function createClient(name: string): Promise<Client | null> {
  const pool = await ensureTables();
  if (!pool) return null;
  const r = await pool.query(`INSERT INTO dt_site.client (name) VALUES ($1) RETURNING id, name, active, nda_wall`, [name]);
  const c = r.rows[0];
  return { id: c.id, name: c.name, active: c.active, ndaWall: c.nda_wall === true };
}

export async function updateClient(
  id: number,
  fields: { name?: string; active?: boolean; ndaWall?: boolean },
): Promise<boolean> {
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
  if (fields.ndaWall !== undefined) {
    sets.push(`nda_wall = $${sets.length + 1}`);
    vals.push(fields.ndaWall);
  }
  if (!sets.length) return true;
  vals.push(id);
  await pool.query(`UPDATE dt_site.client SET ${sets.join(", ")} WHERE id = $${vals.length}`, vals);
  return true;
}

export async function deleteClient(id: number): Promise<boolean> {
  const pool = await ensureTables();
  if (!pool) return false;
  await pool.query(`DELETE FROM dt_site.client WHERE id = $1`, [id]);
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
  const compsByVp = groupBy(comps.rows, (c) => c.vendor_project_id);
  const projByClient = groupBy(projects.rows, (p) => p.client_id as number);

  return {
    clients: clients.rows.map((c) => ({
      id: c.id,
      name: c.name,
      ndaWall: c.nda_wall === true,
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
