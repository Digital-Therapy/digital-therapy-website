# Handoff: enable email sending for the tri-party NDA workflow

**From:** Digital Therapy website (digitaltherapy.io) team
**To:** Milton (portal / infra) — for your Claude agent to execute
**Date prepared:** for the secondary, customer-dedicated NDA workflow

## Background / what we're building (on the website side — no action needed from you here)

The digitaltherapy.io admin is gaining a **tri-party "Client-NDA Wall" workflow**: when a
client requires it, every vendor who could touch that client's PII must sign one mutual NDA that
names **Client · Digital Therapy · Vendor** (same document, all three sign, all three get a copy —
exactly like the existing Adobe-signed "NDA GMC" example, but executed in-app).

We generate the NDA and create a **unique, unguessable signing token per party**. Each party opens a
**public signing page** at `https://www.digitaltherapy.io/nda/sign/:token`, types their signature
(consent + audit trail captured), and submits. When all three have signed, we produce the executed
PDF.

**The only thing we cannot do ourselves: send email to external recipients.** The website backend can
currently only notify the owner (internal). We need a way to send transactional email to arbitrary
addresses (the client contact, the vendor, and DT), from a digitaltherapy.io sender, with good
deliverability. **That's the ask below.**

Emails are low-volume and transactional, of two kinds:
1. **Signing-link invite** — one per party, containing their `/nda/sign/:token` link.
2. **Executed copy** — sent to all three parties (with the final PDF) once fully signed.

---

## The ask — provide a transactional email capability the website backend can call

Either option works for us. **Option A is preferred** (it reuses the trust relationship we already
have and keeps deliverability/domain auth centralized with the portal). Pick whichever is least work
given what the portal already has.

### Option A (preferred): a relay endpoint on the portal

Add an authenticated endpoint the website calls server-to-server — same pattern/secret as the
existing ingest endpoints (`forwardVendorToPortal` / `forwardContactToPortal` already POST to
`${PORTAL_INGEST_BASE}` with `Authorization: Bearer ${INGEST_SECRET}`).

```
POST {PORTAL_INGEST_BASE}/api/ingest/send-email
Authorization: Bearer <INGEST_SECRET>        # reuse existing, or issue EMAIL_RELAY_SECRET
Content-Type: application/json

{
  "to": "vendor@example.com",                 // string or string[]
  "cc": ["jon@digitaltherapy.io"],            // optional
  "subject": "Please sign: Mutual NDA — Garage Management Company",
  "html": "<p>…</p>",                          // HTML body (we render it)
  "text": "plain-text fallback",              // optional but recommended
  "replyTo": "jon@digitaltherapy.io",         // optional
  "attachments": [                            // optional; used for the executed-copy email
    { "filename": "NDA.pdf", "contentBase64": "…", "contentType": "application/pdf" }
  ],
  "tags": ["nda"]                             // optional, for your logging/analytics
}

→ 200 { "ok": true, "id": "<provider message id>" }
→ 4xx/5xx { "ok": false, "error": "human-readable reason" }
```

- **From address:** a fixed, verified sender configured on your side, e.g.
  `Digital Therapy <nda@digitaltherapy.io>` (or `notifications@digitaltherapy.io`).
- **Auth:** require the Bearer secret; reject anything else. Fine to reuse `INGEST_SECRET`, or mint a
  dedicated `EMAIL_RELAY_SECRET` and send it to us (see "What to send back").
- Send via whatever provider the portal already uses, or provision one (see below).

### Option B (alternative): give the website its own provider credentials

If you'd rather we send directly: provision a transactional provider (Resend, Postmark, SendGrid, or
SES) for the **digitaltherapy.io** domain and give us, as deployment env vars on the website host:

```
EMAIL_PROVIDER=resend|postmark|sendgrid|ses
EMAIL_API_KEY=…                 # provider API key (or SMTP creds)
EMAIL_FROM="Digital Therapy <nda@digitaltherapy.io>"
```

We'll add the provider's SDK and send directly. (Slightly more for us to build, and domain auth still
needs doing — see next.)

---

## Required regardless of option: sender domain authentication

The signing-link emails must land in inboxes, not spam. Please set up, for the sending domain
(`digitaltherapy.io`, or a subdomain like `mail.digitaltherapy.io`):
- **SPF**, **DKIM**, and a **DMARC** record aligned to the chosen provider.
- A verified **from address** (e.g. `nda@digitaltherapy.io`).

If sending originates from the portal (Option A), this lives with the portal's provider config.

---

## Security notes

- Treat the relay/secret as sensitive; the endpoint should **only** accept the Bearer secret and
  ideally be reachable only from our backend (allowlist / network rules if practical).
- Basic **rate limiting** is fine to add (volume is low — a handful of NDA emails per engagement).
- No need to log full PII bodies; a message id + to/subject for audit is plenty.

---

## What to send back to us

So we can finish the integration on the website:
1. **Which option** you implemented (A or B).
2. If A: confirm the endpoint URL + that `INGEST_SECRET` works (or the new `EMAIL_RELAY_SECRET`), and
   the exact **from address**.
3. If B: the env-var values (`EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM`) delivered to the website
   deployment securely.
4. Confirmation that **SPF/DKIM/DMARC** are in place for the sending domain.

## Acceptance test (how we'll know it's done)

- A `curl` to the relay (Option A) with the Bearer secret returns `200 {"ok":true,...}` and a real
  email is delivered to an external address, from the digitaltherapy.io sender, not flagged as spam.
- (Or, Option B: the same delivered-email result using the provided provider creds.)
- A test with a small base64 PDF attachment delivers the attachment intact (needed for the
  executed-copy email).

## Not part of this ask (just context)

- We build the NDA generation, the public `/nda/sign/:token` pages, the signature/audit capture, and
  the executed-PDF assembly. We only need the email transport above.
- The admin console reaches the portal DB over Tailscale (already sorted); email sending happens
  server-side and is independent of that.
