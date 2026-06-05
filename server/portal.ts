import { ENV } from "./_core/env";

/**
 * Forwards submissions to the DT Portal (app-dashboard, apps.dtapps.io) ingest
 * API. Server-to-server, authenticated with a shared bearer secret. Failures
 * are swallowed by callers so the public site never 500s if the portal is down
 * (the dt MariaDB + owner notification remain the primary capture path).
 */

export type ContactForward = {
  name: string;
  email: string;
  organization?: string | null;
  role?: string | null;
  message: string;
  context?: string | null;
  sourcePage?: string | null;
};

export type VendorFileForward = {
  field: "resume" | "w9" | "headshot";
  filename: string;
  mimeType: string;
  dataBase64: string;
};

export type VendorForward = {
  vendorTypeLabel: string;
  name: string;
  email: string;
  role?: string | null;
  companyName?: string | null;
  websiteUrl?: string | null;
  personalLinkedin?: string | null;
  companySocial?: string | null;
  personalBio?: string | null;
  companyCv?: string | null;
  hourlyRate?: string | null;
  hoursPerMonth?: string | null;
  availabilityNotes?: string | null;
  additionalSkills?: string | null;
  teamSize?: string | null;
  teamMembers?: {
    fullName: string;
    title: string;
    roleSkills: string;
    location: string;
    yearsTogether: string;
  }[];
  sectors?: string[];
  skills?: string[];
  certifications?: { name: string; isCurrent: boolean; provider: string }[];
  marketingConsent: boolean;
  nameUsageConsent: boolean;
  signature?: string | null;
  context?: string | null;
  sourcePage?: string | null;
};

function ingestUrl(path: string): string | null {
  if (!ENV.portalIngestBase || !ENV.ingestSecret) return null;
  return `${ENV.portalIngestBase.replace(/\/$/, "")}${path}`;
}

export type EmailAttachment = { filename: string; contentBase64: string; contentType: string };
export type EmailMessage = {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  tags?: string[];
};

/**
 * Send transactional email via the portal's relay (Option A). From-address is
 * fixed server-side (Digital Therapy <nda@digitaltherapy.io>). Best-effort:
 * returns false (never throws) when the relay isn't configured/reachable —
 * e.g. local dev, where PORTAL_INGEST_BASE is unset. Callers must not depend
 * on delivery; signing links are always available in the admin as a fallback.
 */
export async function sendEmailViaRelay(message: EmailMessage): Promise<{ ok: boolean; id?: string }> {
  const url = ingestUrl("/api/ingest/send-email");
  if (!url) {
    console.warn("[Email] relay not configured (PORTAL_INGEST_BASE unset) — skipping send");
    return { ok: false };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${ENV.ingestSecret}` },
      body: JSON.stringify(message),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string };
    if (!res.ok || !data.ok) {
      console.warn(`[Email] relay send failed: ${res.status} ${data.error ?? ""}`);
      return { ok: false };
    }
    return { ok: true, id: data.id };
  } catch (error) {
    console.warn("[Email] relay send error:", error);
    return { ok: false };
  }
}

export async function forwardContactToPortal(payload: ContactForward): Promise<boolean> {
  const url = ingestUrl("/api/ingest/contact");
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ENV.ingestSecret}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn(`[Portal] contact forward failed: ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Portal] contact forward error:", error);
    return false;
  }
}

export async function forwardVendorToPortal(
  payload: VendorForward,
  files: VendorFileForward[]
): Promise<boolean> {
  const url = ingestUrl("/api/ingest/vendor");
  if (!url) return false;
  try {
    const form = new FormData();
    form.append("payload", JSON.stringify(payload));
    for (const f of files) {
      const buffer = Buffer.from(f.dataBase64, "base64");
      if (buffer.length === 0) continue;
      const blob = new Blob([buffer], { type: f.mimeType || "application/octet-stream" });
      form.append(f.field, blob, f.filename || `${f.field}.bin`);
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { authorization: `Bearer ${ENV.ingestSecret}` },
      body: form,
    });
    if (!res.ok) {
      console.warn(`[Portal] vendor forward failed: ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Portal] vendor forward error:", error);
    return false;
  }
}
