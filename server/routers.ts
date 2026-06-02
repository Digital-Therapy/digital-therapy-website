import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createContactSubmission } from "./db";
import { forwardContactToPortal, forwardVendorToPortal } from "./portal";

// Strip control chars / collapse newlines so user input can't forge extra
// fields in the plain-text owner notification body.
const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

const contactSubmissionInput = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(160),
  email: z.string().trim().email("Please enter a valid work email.").max(320),
  organization: z.string().trim().max(240).optional().default(""),
  role: z.string().trim().max(160).optional().default(""),
  // Optional phone + website. Format is intentionally permissive — we don't want
  // to reject international numbers or sites without a scheme. Both are routed
  // through the notification email only (not persisted to the DB schema).
  phone: z.string().trim().max(60).optional().default(""),
  website: z.string().trim().max(500).optional().default(""),
  // Server backstop is min(1): the formal contact forms enforce minLength=20
  // client-side, while the Sigmund chat widget legitimately sends short
  // messages that must still be captured.
  message: z.string().trim().min(1, "Please enter a message.").max(4000),
  context: z.string().trim().max(240).optional().default("general inquiry"),
  sourcePage: z.string().trim().max(500).optional().default("unknown"),
  // When the message is addressed to a specific team member (Team page "Send a message" flow),
  // recipientName is the person being tagged. Used only for the intake notification email
  // (subject + body) so the intake inbox knows who to route the message to.
  recipientName: z.string().trim().max(160).optional().default(""),
  recipientRole: z.string().trim().max(160).optional().default(""),
});

// Per-file cap (base64-encoded). 8 MB raw ~= 10.7 MB base64; three files stay
// comfortably under the Express 50 MB body limit.
const MAX_FILE_B64 = 11 * 1024 * 1024;

const vendorFileInput = z.object({
  field: z.enum(["resume", "w9", "headshot"]),
  filename: z.string().trim().min(1).max(260),
  mimeType: z.string().trim().max(160).default("application/octet-stream"),
  dataBase64: z.string().max(MAX_FILE_B64),
});

const vendorApplicationInput = z.object({
  vendorTypeLabel: z.string().trim().min(1).max(160),
  name: z.string().trim().min(2, "Please enter your name.").max(160),
  email: z.string().trim().email("Please enter a valid email.").max(320),
  role: z.string().trim().max(160).optional().default(""),
  personalBio: z.string().trim().max(8000).optional().default(""),
  companyCv: z.string().trim().max(8000).optional().default(""),
  hourlyRate: z.string().trim().max(120).optional().default(""),
  hoursPerMonth: z.string().trim().max(120).optional().default(""),
  availabilityNotes: z.string().trim().max(4000).optional().default(""),
  additionalSkills: z.string().trim().max(4000).optional().default(""),
  // Team composition — `teamSize` is the human-readable dial selection
  // ("Just me", "5", "More than 10"); `teamMembers` holds one lockup per
  // additional teammate beyond the applicant.
  teamSize: z.string().trim().max(40).optional().default(""),
  teamMembers: z
    .array(
      z.object({
        fullName: z.string().trim().max(160).default(""),
        title: z.string().trim().max(160).default(""),
        roleSkills: z.string().trim().max(500).default(""),
        location: z.string().trim().max(160).default(""),
        yearsTogether: z.string().trim().max(60).default(""),
      })
    )
    .max(50)
    .optional()
    .default([]),
  sectors: z.array(z.string().trim().max(120)).max(50).optional().default([]),
  skills: z.array(z.string().trim().max(120)).max(200).optional().default([]),
  certifications: z
    .array(
      z.object({
        name: z.string().trim().max(240).default(""),
        isCurrent: z.boolean().default(true),
        provider: z.string().trim().max(240).default(""),
      })
    )
    .max(50)
    .optional()
    .default([]),
  marketingConsent: z.boolean().default(false),
  nameUsageConsent: z.boolean().default(false),
  signature: z.string().trim().max(240).optional().default(""),
  // Third-Party Vendor Confidentiality & Data Protection Agreement execution
  // payload — required step before form submission on the client. The client
  // gates submit so these fields should always be populated when this mutation
  // runs; they are declared optional/default in case a non-UI caller submits a
  // partial payload.
  ndaBusinessName: z.string().trim().max(240).optional().default(""),
  ndaEntityDescriptor: z.string().trim().max(240).optional().default(""),
  ndaAddress: z.string().trim().max(500).optional().default(""),
  ndaSignerName: z.string().trim().max(160).optional().default(""),
  ndaSignerTitle: z.string().trim().max(160).optional().default(""),
  ndaSignerPhone: z.string().trim().max(60).optional().default(""),
  ndaSignerEmail: z.string().trim().max(320).optional().default(""),
  ndaSignatureText: z.string().trim().max(160).optional().default(""),
  ndaSignatureDate: z.string().trim().max(40).optional().default(""),
  ndaEffectiveDate: z.string().trim().max(40).optional().default(""),
  ndaRequestCopy: z.boolean().optional().default(false),
  context: z.string().trim().max(240).optional().default("vendor application"),
  sourcePage: z.string().trim().max(500).optional().default("unknown"),
  files: z.array(vendorFileInput).max(3).optional().default([]),
});

export function formatContactNotification(input: z.infer<typeof contactSubmissionInput>) {
  const lines: string[] = [];
  if (input.recipientName) {
    lines.push(
      `ATTN: ${oneLine(input.recipientName)}${input.recipientRole ? ` (${oneLine(input.recipientRole)})` : ""}`,
      "",
    );
  }
  lines.push(
    `Name: ${oneLine(input.name)}`,
    `Email: ${oneLine(input.email)}`,
    `Phone: ${oneLine(input.phone) || "Not provided"}`,
    `Website: ${oneLine(input.website) || "Not provided"}`,
    `Organization: ${oneLine(input.organization) || "Not provided"}`,
    `Role: ${oneLine(input.role) || "Not provided"}`,
    `Context: ${oneLine(input.context) || "general inquiry"}`,
    `Source page: ${oneLine(input.sourcePage) || "unknown"}`,
    "",
    "Message:",
    input.message,
  );
  if (input.recipientName) {
    lines.push(
      "",
      "--",
      `Please route this message to ${oneLine(input.recipientName)} and notify them that ${oneLine(input.name)} (${oneLine(input.email)}) reached out via the Digital Therapy team page.`,
    );
  }
  return lines.join("\n");
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  contact: router({
    submit: publicProcedure.input(contactSubmissionInput).mutation(async ({ input }) => {
      // recipientName / recipientRole / phone / website are notification-only — they do
      // not live on the DB schema. Strip them off before persisting; the routing intent
      // is captured in `context`, and phone/website travel via the notification email.
      const {
        recipientName: _recipientName,
        recipientRole: _recipientRole,
        phone: _phone,
        website: _website,
        ...persistable
      } = input;
      const normalized = {
        ...persistable,
        organization: persistable.organization || null,
        role: persistable.role || null,
        context: persistable.context || "general inquiry",
        sourcePage: persistable.sourcePage || "unknown",
      };

      const saved = await createContactSubmission(normalized);
      const titleSuffix = input.recipientName ? ` (Attn: ${input.recipientName})` : "";
      const notificationDelivered = await notifyOwner({
        title: `New Digital Therapy contact form: ${oneLine(input.name)}${titleSuffix}`,
        content: formatContactNotification(input),
      }).catch((error) => {
        console.warn("[Contact] Owner notification failed:", error);
        return false;
      });

      // Mirror into the DT Portal (apps.dtapps.io). Non-fatal if it fails.
      const portalStored = await forwardContactToPortal(normalized);

      return {
        success: true,
        id: saved?.id ?? null,
        notificationDelivered,
        portalStored,
      } as const;
    }),
  }),
  vendor: router({
    submit: publicProcedure.input(vendorApplicationInput).mutation(async ({ input }) => {
      const { files, ...payload } = input;
      const portalStored = await forwardVendorToPortal(payload, files);

      // Best-effort owner ping so the team is alerted even if the portal is down.
      const ndaExecuted = Boolean(
        input.ndaSignerName && input.ndaSignatureText && input.ndaSignatureDate,
      );
      const ndaLines = ndaExecuted
        ? [
            "",
            "NDA EXECUTED — Third-Party Vendor Confidentiality & Data Protection Agreement",
            `  Business name: ${oneLine(input.ndaBusinessName || "Not provided")}`,
            `  Entity: ${oneLine(input.ndaEntityDescriptor || "Not provided")}`,
            `  Address: ${oneLine(input.ndaAddress || "Not provided")}`,
            `  Signer: ${oneLine(input.ndaSignerName)}${input.ndaSignerTitle ? ` (${oneLine(input.ndaSignerTitle)})` : ""}`,
            `  Phone: ${oneLine(input.ndaSignerPhone || "Not provided")}`,
            `  Email: ${oneLine(input.ndaSignerEmail || "Not provided")}`,
            `  Typed signature: ${oneLine(input.ndaSignatureText)}`,
            `  Sign date: ${oneLine(input.ndaSignatureDate)}`,
            `  Effective date: ${oneLine(input.ndaEffectiveDate || input.ndaSignatureDate)}`,
            `  Requested co-signed copy: ${input.ndaRequestCopy ? "YES — send executed copy" : "no"}`,
          ]
        : ["", "NDA: NOT EXECUTED — review immediately"];
      const teamLines =
        input.teamMembers.length > 0
          ? [
              "",
              `Team members (${input.teamMembers.length} beyond applicant):`,
              ...input.teamMembers.map(
                (m, i) =>
                  `  ${i + 2}. ${oneLine(m.fullName) || "Unnamed"}` +
                  `${m.title ? ` — ${oneLine(m.title)}` : ""}` +
                  `${m.roleSkills ? ` | Role/Skills: ${oneLine(m.roleSkills)}` : ""}` +
                  `${m.location ? ` | ${oneLine(m.location)}` : ""}` +
                  `${m.yearsTogether ? ` | ${oneLine(m.yearsTogether)} yr(s) together` : ""}`,
              ),
            ]
          : [];
      const notificationDelivered = await notifyOwner({
        title: `New vendor application: ${oneLine(input.name)} (${oneLine(input.vendorTypeLabel)})${ndaExecuted ? "" : " — NDA MISSING"}`,
        content: [
          `Name: ${oneLine(input.name)}`,
          `Email: ${oneLine(input.email)}`,
          `Vendor type: ${oneLine(input.vendorTypeLabel)}`,
          `Role: ${oneLine(input.role || "Not provided")}`,
          `Team size: ${oneLine(input.teamSize || "Not provided")}`,
          `Files attached: ${files.length}`,
          `Stored in portal: ${portalStored ? "yes" : "NO - check portal"}`,
          ...teamLines,
          ...ndaLines,
        ].join("\n"),
      }).catch((error) => {
        console.warn("[Vendor] Owner notification failed:", error);
        return false;
      });

      return { success: true, portalStored, notificationDelivered } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
