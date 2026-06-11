/**
 * Tri-party NDA workflow (Client · Digital Therapy · Vendor): generate the named
 * NDA, issue per-party signing tokens, collect in-app typed signatures with an
 * audit trail, and on completion produce + email the executed PDF. All state is
 * in our isolated dt_site schema; email goes through the portal relay
 * (best-effort). Reuses the vendors.ts pg pool.
 */
import crypto from "crypto";
import { jsPDF } from "jspdf";
import {
  DT_ENTITY,
  applyNdaPlaceholders,
  ndaBodyParagraphs,
  ndaHeadingSplit,
  renderDefaultBody,
  type NdaParties,
} from "../shared/ndaTemplate";
import { getClientById } from "./engagements";
import { sendEmailViaRelay } from "./portal";
import { getPool, getVendorById } from "./vendors";

const SIGNING_BASE = (process.env.PUBLIC_BASE_URL || "https://www.digitaltherapy.io").replace(/\/$/, "");
const signLink = (token: string) => `${SIGNING_BASE}/nda/sign/${token}`;
const newToken = () => crypto.randomUUID().replace(/-/g, "");

// Dates on a legal document must be unambiguous and not depend on the server's
// timezone. Pin to a fixed business timezone and always show the zone.
const NDA_TZ = "America/New_York";
const fmtDate = (d: Date | string | number) =>
  new Date(d).toLocaleDateString("en-US", { timeZone: NDA_TZ, year: "numeric", month: "long", day: "numeric" });
const fmtDateTime = (d: Date | string | number) =>
  new Date(d).toLocaleString("en-US", { timeZone: NDA_TZ, timeZoneName: "short" });

let _ndaReady = false;
async function ensureNdaSchema(pool: NonNullable<ReturnType<typeof getPool>>) {
  if (_ndaReady) return;
  await pool.query(`CREATE SCHEMA IF NOT EXISTS dt_site`);
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.client (
       id serial PRIMARY KEY, name text NOT NULL, active boolean NOT NULL DEFAULT true,
       created_at timestamptz NOT NULL DEFAULT now())`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.vendor_nda (
       id serial PRIMARY KEY,
       vendor_application_id text NOT NULL,
       client_id integer NOT NULL REFERENCES dt_site.client(id) ON DELETE CASCADE,
       status text NOT NULL DEFAULT 'pending',
       created_at timestamptz NOT NULL DEFAULT now(),
       UNIQUE (vendor_application_id, client_id))`,
  );
  await pool.query(
    `ALTER TABLE dt_site.vendor_nda
       ADD COLUMN IF NOT EXISTS effective_date text,
       ADD COLUMN IF NOT EXISTS sent_at timestamptz,
       ADD COLUMN IF NOT EXISTS completed_at timestamptz,
       ADD COLUMN IF NOT EXISTS client_legal_name text,
       ADD COLUMN IF NOT EXISTS client_address text,
       ADD COLUMN IF NOT EXISTS vendor_company text,
       ADD COLUMN IF NOT EXISTS vendor_name text,
       ADD COLUMN IF NOT EXISTS vendor_address text,
       ADD COLUMN IF NOT EXISTS body_text text`,
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS dt_site.nda_signer (
       id serial PRIMARY KEY,
       nda_id integer NOT NULL REFERENCES dt_site.vendor_nda(id) ON DELETE CASCADE,
       party text NOT NULL,
       name text,
       email text,
       title text,
       token text NOT NULL UNIQUE,
       signed_at timestamptz,
       signature_text text,
       signed_ip text,
       signed_user_agent text,
       created_at timestamptz NOT NULL DEFAULT now(),
       UNIQUE (nda_id, party))`,
  );
  // Vendor signer certifies (at execution) they're authorized to sign for and
  // own >= 20% of their company. Idempotent for already-created tables.
  await pool.query(`ALTER TABLE dt_site.nda_signer ADD COLUMN IF NOT EXISTS authority_certified boolean`);
  await pool.query(`CREATE INDEX IF NOT EXISTS nda_signer_nda_idx ON dt_site.nda_signer (nda_id)`);
  _ndaReady = true;
}

const PARTY_LABEL: Record<string, string> = {
  client: "For the Company (Client)",
  dt: "For Digital Therapy LLC",
  vendor: "For the Counterparty (Vendor)",
};

/** Signature-block headings keyed to the actual entity names on this NDA. */
function signerLabels(nda: Record<string, any>): Record<string, string> {
  return {
    client: nda.client_legal_name || "The Company",
    dt: DT_ENTITY.name,
    vendor: nda.vendor_company || "The Counterparty (Vendor)",
  };
}

/** The exact agreement body for this NDA: the snapshot taken at send time, or
 * the default template rendered on the fly for pre-snapshot records. */
function ndaBody(nda: Record<string, any>): string {
  return (nda.body_text as string) || renderDefaultBody(partiesFromNda(nda));
}

function partiesFromNda(nda: Record<string, any>): NdaParties {
  return {
    clientLegalName: nda.client_legal_name ?? "",
    clientAddress: nda.client_address ?? "",
    vendorCompany: nda.vendor_company ?? "",
    vendorName: nda.vendor_name ?? "",
    vendorAddress: nda.vendor_address ?? "",
    effectiveDate: nda.effective_date ?? "",
  };
}

/** Generate (or refresh) the NDA + signing tokens and email the client + vendor
 * their links. Idempotent: re-running keeps existing tokens (acts as a resend). */
export async function sendNda(vendorAppId: string, clientId: number) {
  const pool = getPool();
  if (!pool) return null;
  const client = await getClientById(clientId);
  const vendor = await getVendorById(vendorAppId);
  if (!client || !vendor) return null;
  // The Digital Therapy owner is already a party to every tri-party NDA, so they
  // are exempt from client NDA walls — never generate a vendor NDA for them.
  if (vendor.vendor.owner) return { ndaId: 0, status: "waived", invited: [], missingEmail: [], signers: [] };
  await ensureNdaSchema(pool);

  const primary = client.contacts.find((c) => c.isPrimary) ?? client.contacts[0] ?? null;
  const vendorCompany = vendor.vendor.companyName || vendor.vendor.name;
  const effectiveDate = fmtDate(new Date());

  // The exact NDA wording is snapshotted onto the record at first send so the
  // executed document is immutable even if the client/vendor records change
  // later. A client-specific template (e.g. Chapman's client-provided form)
  // wins; otherwise the default mutual-NDA template is rendered. Body ends at
  // the IN WITNESS line — signature blocks are appended at render.
  const vendorAddress = vendor.vendor.companyAddress ?? "";
  const parties: NdaParties = {
    clientLegalName: client.legalName ?? client.name,
    clientAddress: client.address ?? "",
    vendorCompany,
    vendorName: vendor.vendor.name,
    vendorAddress,
    effectiveDate,
  };
  const bodyText = client.ndaTemplate
    ? applyNdaPlaceholders(client.ndaTemplate, {
        vendorCompany,
        vendorAddress: vendor.vendor.companyAddress ?? "",
        effectiveDate,
      })
    : renderDefaultBody(parties);

  const up = await pool.query(
    `INSERT INTO dt_site.vendor_nda
       (vendor_application_id, client_id, status, effective_date, sent_at,
        client_legal_name, client_address, vendor_company, vendor_name, vendor_address, body_text)
     VALUES ($1,$2,'sent',$3, now(), $4,$5,$6,$7,$8,$9)
     ON CONFLICT (vendor_application_id, client_id) DO UPDATE SET
        status = CASE WHEN dt_site.vendor_nda.status = 'completed' THEN 'completed' ELSE 'sent' END,
        effective_date = COALESCE(dt_site.vendor_nda.effective_date, EXCLUDED.effective_date),
        sent_at = COALESCE(dt_site.vendor_nda.sent_at, now()),
        client_legal_name = EXCLUDED.client_legal_name,
        client_address = EXCLUDED.client_address,
        vendor_company = EXCLUDED.vendor_company,
        vendor_name = EXCLUDED.vendor_name,
        vendor_address = EXCLUDED.vendor_address,
        body_text = COALESCE(dt_site.vendor_nda.body_text, EXCLUDED.body_text)
     RETURNING id, status`,
    [
      vendorAppId,
      clientId,
      effectiveDate,
      client.legalName ?? client.name,
      client.address ?? "",
      vendorCompany,
      vendor.vendor.name,
      vendorAddress,
      bodyText,
    ],
  );
  const ndaId = up.rows[0].id as number;

  const seed = [
    { party: "client", name: primary?.name ?? client.legalName ?? client.name, email: primary?.email ?? "", title: primary?.title ?? "" },
    { party: "dt", name: DT_ENTITY.signerName, email: DT_ENTITY.signerEmail, title: DT_ENTITY.signerTitle },
    { party: "vendor", name: vendor.vendor.name, email: vendor.vendor.email, title: vendor.vendor.title || vendor.vendor.role || "" },
  ];
  for (const s of seed) {
    await pool.query(
      `INSERT INTO dt_site.nda_signer (nda_id, party, name, email, title, token)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (nda_id, party) DO NOTHING`,
      [ndaId, s.party, s.name, s.email || null, s.title || null, newToken()],
    );
  }

  const signers = (
    await pool.query(`SELECT party, name, email, token, signed_at FROM dt_site.nda_signer WHERE nda_id=$1`, [ndaId])
  ).rows;
  const byParty = Object.fromEntries(signers.map((s) => [s.party, s]));

  // Email each party their signing link (best-effort). DT can also sign from the
  // admin via the "Sign as Digital Therapy" button.
  const subject = `Please sign: Mutual NDA — ${client.legalName ?? client.name}`;
  const invited: string[] = [];
  const missingEmail: string[] = [];
  for (const party of ["client", "dt", "vendor"]) {
    const s = byParty[party];
    if (!s || s.signed_at) continue;
    if (!s.email) {
      // No address on file -> can't invite. Surfaced to the admin so they fill
      // it in or hand the party their link manually (returned in `signers`).
      missingEmail.push(party);
      continue;
    }
    const link = signLink(s.token);
    invited.push(party);
    await sendEmailViaRelay({
      to: s.email,
      cc: party === "dt" ? undefined : DT_ENTITY.signerEmail,
      subject,
      html:
        `<p>Hello ${s.name ?? ""},</p>` +
        `<p>${client.legalName ?? client.name}, ${DT_ENTITY.name}, and ${vendorCompany} are entering a mutual non-disclosure agreement for an engagement. Please review and sign your copy:</p>` +
        `<p><a href="${link}">${link}</a></p><p>Thank you,<br/>Digital Therapy</p>`,
      text: `Please review and sign the mutual NDA: ${link}`,
      replyTo: DT_ENTITY.signerEmail,
      tags: ["nda", "invite"],
    });
  }

  return {
    ndaId,
    status: up.rows[0].status as string,
    invited,
    missingEmail,
    signers: signers.map((s) => ({
      party: s.party as string,
      name: s.name as string,
      email: s.email as string | null,
      signed: Boolean(s.signed_at),
      link: signLink(s.token),
    })),
  };
}

/** Public: load NDA context for a signing token. */
export async function getNdaByToken(token: string) {
  const pool = getPool();
  if (!pool) return null;
  await ensureNdaSchema(pool);
  const signer = (await pool.query(`SELECT * FROM dt_site.nda_signer WHERE token=$1`, [token])).rows[0];
  if (!signer) return null;
  const nda = (await pool.query(`SELECT * FROM dt_site.vendor_nda WHERE id=$1`, [signer.nda_id])).rows[0];
  if (!nda) return null;
  const all = (await pool.query(`SELECT party, name, signed_at FROM dt_site.nda_signer WHERE nda_id=$1`, [nda.id])).rows;
  return {
    status: nda.status as string,
    party: signer.party as string,
    signerName: signer.name as string,
    signerTitle: (signer.title as string) ?? null,
    signed: Boolean(signer.signed_at),
    signedAt: signer.signed_at as Date | null,
    // The vendor must certify their signing authority + >= 20% ownership before
    // executing; client/DT signers do not.
    requiresAuthorityCert: signer.party === "vendor",
    parties: partiesFromNda(nda),
    // Exact agreement text for this NDA (client-specific or default), already
    // filled. The signing page renders these paragraphs verbatim.
    bodyParagraphs: ndaBodyParagraphs(ndaBody(nda)),
    signers: all.map((s) => ({ party: s.party as string, name: s.name as string, signed: Boolean(s.signed_at) })),
  };
}

/** Public: batch view for a signer — every outstanding NDA where the SAME party
 * + email is awaiting this person, so e.g. a client rep can review and sign
 * several NDAs (identical but for the vendor) in one pass. The entry token is
 * any one of that signer's signing tokens. */
export async function getSignerBatch(token: string) {
  const pool = getPool();
  if (!pool) return null;
  await ensureNdaSchema(pool);
  const entry = (await pool.query(`SELECT * FROM dt_site.nda_signer WHERE token=$1`, [token])).rows[0];
  if (!entry) return null;
  const party = entry.party as string;
  const email = (entry.email as string | null)?.trim() || null;

  // Group by party + email. If the signer has no email on record we can only
  // safely show the single NDA for this token.
  const signerRows = email
    ? (
        await pool.query(
          `SELECT s.* FROM dt_site.nda_signer s
             JOIN dt_site.vendor_nda n ON n.id = s.nda_id
            WHERE s.party = $1 AND lower(s.email) = lower($2)
              AND n.status NOT IN ('void','completed')`,
          [party, email],
        )
      ).rows
    : [entry];

  const ndas = [];
  for (const sr of signerRows) {
    const nda = (await pool.query(`SELECT * FROM dt_site.vendor_nda WHERE id=$1`, [sr.nda_id])).rows[0];
    if (!nda) continue;
    const all = (await pool.query(`SELECT party, name, signed_at FROM dt_site.nda_signer WHERE nda_id=$1`, [nda.id]))
      .rows;
    ndas.push({
      ndaId: nda.id as number,
      status: nda.status as string,
      clientLegalName: (nda.client_legal_name as string) ?? "",
      vendorCompany: (nda.vendor_company as string) ?? "",
      vendorName: (nda.vendor_name as string) ?? "",
      effectiveDate: (nda.effective_date as string) ?? "",
      signed: Boolean(sr.signed_at),
      bodyParagraphs: ndaBodyParagraphs(ndaBody(nda)),
      signers: all.map((s) => ({ party: s.party as string, name: s.name as string, signed: Boolean(s.signed_at) })),
    });
  }
  ndas.sort((a, b) => a.ndaId - b.ndaId);
  return {
    party,
    signerName: entry.name as string,
    signerEmail: email,
    requiresAuthorityCert: party === "vendor",
    ndas,
  };
}

/** Public: apply one signature to several NDAs at once. Only NDAs awaiting THIS
 * signer (same party + email as the entry token, unsigned, not void/completed)
 * are signed — the caller can't sign anyone else's NDA. */
export async function signBatch(
  token: string,
  ndaIds: number[],
  signatureText: string,
  ip: string | null,
  userAgent: string | null,
): Promise<{ ok: boolean; error?: string; signed?: number; completed?: number }> {
  const pool = getPool();
  if (!pool) return { ok: false, error: "Signing is temporarily unavailable." };
  await ensureNdaSchema(pool);
  const entry = (await pool.query(`SELECT * FROM dt_site.nda_signer WHERE token=$1`, [token])).rows[0];
  if (!entry) return { ok: false, error: "This signing link is invalid." };
  const party = entry.party as string;
  const email = (entry.email as string | null)?.trim() || null;
  if (!email) return { ok: false, error: "Batch signing isn't available for this link." };
  if (!ndaIds.length) return { ok: false, error: "Select at least one NDA to sign." };

  const targets = (
    await pool.query(
      `SELECT s.id, s.nda_id, s.name FROM dt_site.nda_signer s
         JOIN dt_site.vendor_nda n ON n.id = s.nda_id
        WHERE s.party = $1 AND lower(s.email) = lower($2) AND s.signed_at IS NULL
          AND n.status NOT IN ('void','completed') AND s.nda_id = ANY($3::int[])`,
      [party, email, ndaIds],
    )
  ).rows;
  if (!targets.length) return { ok: false, error: "There's nothing left to sign on these NDAs." };

  // The typed signature must match the signer's name on every selected NDA.
  for (const t of targets) {
    if (signatureText.trim().toLowerCase() !== String(t.name).trim().toLowerCase()) {
      return { ok: false, error: "Your typed signature must match your name exactly." };
    }
  }

  let completed = 0;
  for (const t of targets) {
    await pool.query(
      `UPDATE dt_site.nda_signer SET signed_at=now(), signature_text=$2, signed_ip=$3, signed_user_agent=$4 WHERE id=$1`,
      [t.id, signatureText.trim(), ip, userAgent],
    );
    const remaining = (
      await pool.query(`SELECT count(*)::int AS n FROM dt_site.nda_signer WHERE nda_id=$1 AND signed_at IS NULL`, [
        t.nda_id,
      ])
    ).rows[0].n as number;
    if (remaining === 0) {
      await finalizeNda(t.nda_id);
      completed += 1;
    }
  }
  return { ok: true, signed: targets.length, completed };
}

/** Public: record a signature. Signature text must match the signer's name. */
export async function signNda(
  token: string,
  signatureText: string,
  ip: string | null,
  userAgent: string | null,
  certifiedAuthority?: boolean,
): Promise<{ ok: boolean; error?: string; completed?: boolean }> {
  const pool = getPool();
  if (!pool) return { ok: false, error: "Signing is temporarily unavailable." };
  await ensureNdaSchema(pool);
  const signer = (await pool.query(`SELECT * FROM dt_site.nda_signer WHERE token=$1`, [token])).rows[0];
  if (!signer) return { ok: false, error: "This signing link is invalid." };
  if (signer.signed_at) return { ok: false, error: "You have already signed this NDA." };
  if (signatureText.trim().toLowerCase() !== String(signer.name).trim().toLowerCase()) {
    return { ok: false, error: "Your typed signature must match your name exactly." };
  }
  // The vendor must affirm signing authority + >= 20% ownership before executing.
  if (signer.party === "vendor" && certifiedAuthority !== true) {
    return { ok: false, error: "Please confirm you are authorized to sign and own at least 20% of your company." };
  }
  await pool.query(
    `UPDATE dt_site.nda_signer SET signed_at=now(), signature_text=$2, signed_ip=$3, signed_user_agent=$4, authority_certified=$5 WHERE id=$1`,
    [signer.id, signatureText.trim(), ip, userAgent, signer.party === "vendor" ? certifiedAuthority === true : null],
  );
  const remaining = (
    await pool.query(`SELECT count(*)::int AS n FROM dt_site.nda_signer WHERE nda_id=$1 AND signed_at IS NULL`, [
      signer.nda_id,
    ])
  ).rows[0].n as number;
  if (remaining === 0) await finalizeNda(signer.nda_id);
  return { ok: true, completed: remaining === 0 };
}

async function finalizeNda(ndaId: number) {
  const pool = getPool();
  if (!pool) return;
  // Atomic claim: only the call that actually flips the row to 'completed' goes
  // on to send the executed-copy email. If two parties sign at the same instant,
  // the loser's UPDATE affects 0 rows and bails -- so the PDF is emailed once.
  const claim = await pool.query(
    `UPDATE dt_site.vendor_nda SET status='completed', completed_at=now() WHERE id=$1 AND status<>'completed'`,
    [ndaId],
  );
  if (claim.rowCount === 0) return;
  const nda = (await pool.query(`SELECT * FROM dt_site.vendor_nda WHERE id=$1`, [ndaId])).rows[0];
  const signers = (await pool.query(`SELECT party, name, email FROM dt_site.nda_signer WHERE nda_id=$1`, [ndaId])).rows;
  const pdf = await buildExecutedPdf(ndaId);
  const to = signers.map((s) => s.email).filter(Boolean) as string[];
  if (pdf && to.length) {
    await sendEmailViaRelay({
      to,
      subject: `Executed: Mutual NDA — ${nda.client_legal_name ?? ""}`,
      html: `<p>Attached is the fully executed mutual NDA between ${nda.client_legal_name}, ${DT_ENTITY.name}, and ${nda.vendor_company}. A copy is provided to all parties.</p>`,
      text: "Attached is the fully executed mutual NDA.",
      replyTo: DT_ENTITY.signerEmail,
      attachments: [
        {
          filename: `NDA-${String(nda.client_legal_name || "client").replace(/[^\w]+/g, "_")}.pdf`,
          contentBase64: pdf,
          contentType: "application/pdf",
        },
      ],
      tags: ["nda", "executed"],
    });
  }
}

/** Build the executed NDA PDF (base64). Renders the filled agreement + every
 * party's signature block + an audit trail. jsPDF runs server-side in Node. */
export async function buildExecutedPdf(ndaId: number): Promise<string | null> {
  const pool = getPool();
  if (!pool) return null;
  const nda = (await pool.query(`SELECT * FROM dt_site.vendor_nda WHERE id=$1`, [ndaId])).rows[0];
  if (!nda) return null;
  const signers = (
    await pool.query(
      `SELECT party, name, title, email, signed_at, signature_text, signed_ip, authority_certified FROM dt_site.nda_signer WHERE nda_id=$1`,
      [ndaId],
    )
  ).rows;
  const order = ["client", "dt", "vendor"];
  signers.sort((a, b) => order.indexOf(a.party) - order.indexOf(b.party));
  const paragraphs = ndaBodyParagraphs(ndaBody(nda));
  const labels = signerLabels(nda);

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const L = 54;
  const R = 558;
  const BOTTOM = 740;
  let y = 64;
  const ensureSpace = (h: number) => {
    if (y + h > BOTTOM) {
      doc.addPage();
      y = 64;
    }
  };
  const para = (text: string, opts: { size?: number; bold?: boolean; gap?: number } = {}) => {
    const size = opts.size ?? 10;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(17);
    for (const line of doc.splitTextToSize(text, R - L)) {
      ensureSpace(size + 3);
      doc.text(line, L, y);
      y += size + 3;
    }
    y += opts.gap ?? 6;
  };
  // Body paragraph with its heading prefix emphasized (bold) inline, wrapping
  // word-by-word so the heading and running text flow together.
  const bodyPara = (text: string, opts: { size?: number; gap?: number } = {}) => {
    const size = opts.size ?? 9.5;
    const { head } = ndaHeadingSplit(text);
    const nBold = head ? head.split(/\s+/).length : 0;
    const words = text.split(/\s+/).filter(Boolean);
    doc.setFontSize(size);
    doc.setTextColor(17);
    const lineH = size + 3;
    let x = L;
    ensureSpace(lineH);
    words.forEach((w, i) => {
      doc.setFont("helvetica", i < nBold ? "bold" : "normal");
      const ww = doc.getTextWidth(w);
      const sp = doc.getTextWidth(" ");
      if (x > L && x + ww > R) {
        y += lineH;
        x = L;
        if (y > BOTTOM) {
          doc.addPage();
          y = 64;
        }
      }
      doc.text(w, x, y);
      x += ww + sp;
    });
    y += lineH + (opts.gap ?? 6);
  };

  // First paragraph is the title (rendered centered/bold); the rest is the body.
  const [title, ...rest] = paragraphs;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title ?? "MUTUAL NON-DISCLOSURE AGREEMENT", (L + R) / 2, y, { align: "center" });
  y += 26;
  for (const p of rest) bodyPara(p, { size: 9.5 });

  // Signature blocks: Signature line, Print name, Title, Date — one per party,
  // headed by each party's actual entity name. (The body already ends with its
  // own "IN WITNESS WHEREOF" line, so we don't repeat it here.)
  y += 8;
  for (const s of signers) {
    ensureSpace(78);
    para(labels[s.party] ?? PARTY_LABEL[s.party] ?? s.party, { bold: true, gap: 4 });
    para(`Signature: ${s.signature_text ?? "______________________________"}`, { gap: 2 });
    para(`Print name: ${s.name ?? ""}`, { size: 9.5, gap: 2 });
    para(`Title: ${s.title ?? ""}`, { size: 9.5, gap: 2 });
    para(`Date: ${s.signed_at ? fmtDate(s.signed_at) : "______________"}`, { size: 9.5, gap: s.party === "vendor" && s.authority_certified ? 2 : 10 });
    if (s.party === "vendor" && s.authority_certified) {
      para(
        "Certified at signing: authorized to sign on behalf of, and owns at least 20% of, the above company.",
        { size: 8, gap: 10 },
      );
    }
  }

  ensureSpace(30);
  para("Audit trail", { bold: true, gap: 2 });
  for (const s of signers) {
    para(
      `${labels[s.party] ?? s.party} — ${s.name}: signed ${s.signed_at ? new Date(s.signed_at).toISOString() : "—"}${s.signed_ip ? ` (IP ${s.signed_ip})` : ""}`,
      { size: 8, gap: 1 },
    );
  }

  return Buffer.from(doc.output("arraybuffer")).toString("base64");
}

/** Void an NDA for a vendor↔client (deletes the record + its signing tokens, so
 * any signatures collected on the wrong document are discarded). The next "Send
 * NDA" generates a fresh NDA with new tokens and the current client template. */
export async function voidNda(vendorAppId: string, clientId: number): Promise<boolean> {
  const pool = getPool();
  if (!pool) return false;
  await ensureNdaSchema(pool);
  await pool.query(`DELETE FROM dt_site.vendor_nda WHERE vendor_application_id=$1 AND client_id=$2`, [
    vendorAppId,
    clientId,
  ]);
  return true;
}

/** Admin view of the NDA for a vendor↔client: status + signer links. */
export async function getNdaForVendorClient(vendorAppId: string, clientId: number) {
  const pool = getPool();
  if (!pool) return null;
  await ensureNdaSchema(pool);
  const nda = (
    await pool.query(`SELECT * FROM dt_site.vendor_nda WHERE vendor_application_id=$1 AND client_id=$2`, [
      vendorAppId,
      clientId,
    ])
  ).rows[0];
  if (!nda) return null;
  const signers = (
    await pool.query(`SELECT party, name, email, token, signed_at FROM dt_site.nda_signer WHERE nda_id=$1`, [nda.id])
  ).rows;
  return {
    ndaId: nda.id as number,
    status: nda.status as string,
    effectiveDate: (nda.effective_date as string) ?? null,
    executedAvailable: nda.status === "completed",
    signers: signers.map((s) => ({
      party: s.party as string,
      name: s.name as string,
      email: s.email as string | null,
      signed: Boolean(s.signed_at),
      signedAt: s.signed_at as Date | null,
      link: signLink(s.token),
    })),
  };
}

/** Library of vendor NDAs (newest executed first) for the admin landing page:
 * vendor company, vendor signer, title, and execution (completed) date. */
export async function listVendorNdas() {
  const pool = getPool();
  if (!pool) return [];
  await ensureNdaSchema(pool);
  const rows = (
    await pool.query(
      `SELECT n.id, n.vendor_company, n.vendor_name, n.completed_at, n.status,
              c.name AS client_name,
              s.name AS signer_name, s.title AS signer_title
         FROM dt_site.vendor_nda n
         LEFT JOIN dt_site.client c ON c.id = n.client_id
         LEFT JOIN dt_site.nda_signer s ON s.nda_id = n.id AND s.party = 'vendor'
        WHERE n.status IN ('sent', 'completed')
        ORDER BY n.completed_at DESC NULLS LAST, n.id DESC`,
    )
  ).rows;
  return rows.map((r) => ({
    id: r.id as number,
    company: (r.vendor_company as string) || "",
    signer: (r.signer_name as string) || (r.vendor_name as string) || "",
    title: (r.signer_title as string) || "",
    executionDate: r.completed_at ? fmtDate(r.completed_at) : null,
    status: r.status as string,
    clientName: (r.client_name as string) || "",
  }));
}
