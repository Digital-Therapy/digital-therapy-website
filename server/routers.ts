import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { addAllowlist, isOwner, listAllowlist, removeAllowlist } from "./access";
import { tailnetUsers } from "./tailscaleUsers";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, ownerProcedure, publicProcedure, router } from "./_core/trpc";
import { createContactSubmission } from "./db";
import { forwardContactToPortal, forwardVendorToPortal } from "./portal";
import {
  createVendorApplication,
  getVendorById,
  getVendorsForExport,
  getVendorFacets,
  listVendorBrief,
  searchVendors,
  setVendorCoreTeam,
  setVendorRemoved,
  updateVendorActiveEngaged,
  updateVendorCategories,
  updateVendorProfile,
  updateVendorStatus,
  VENDOR_CATEGORIES,
} from "./vendors";
import {
  buildExecutedPdf,
  getNdaByToken,
  getNdaForVendorClient,
  sendNda,
  signNda,
} from "./nda";
import {
  addComp,
  addContact,
  COMP_TYPES,
  createClient,
  createProject,
  deleteClient,
  deleteProject,
  getVendorEngagements,
  listClients,
  removeComp,
  removeContact,
  requireClientNda,
  setClientResource,
  setPrimaryContact,
  setVendorProject,
  updateClient,
  updateComp,
  updateContact,
  updateProject,
} from "./engagements";
import { vendorStatusValues } from "../drizzle/schema";

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
  companyName: z.string().trim().max(240).optional().default(""),
  websiteUrl: z.string().trim().max(500).optional().default(""),
  personalLinkedin: z.string().trim().max(500).optional().default(""),
  companySocial: z.string().trim().max(500).optional().default(""),
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

// Admin vendor search input. Multi-value dimensions (skills/certifications/
// sectors) are AND-matched server-side; ranges apply to parsed numerics.
const vendorSearchInput = z.object({
  query: z.string().trim().max(200).optional().default(""),
  skills: z.array(z.string().trim().max(120)).max(20).optional().default([]),
  certifications: z.array(z.string().trim().max(240)).max(20).optional().default([]),
  sectors: z.array(z.string().trim().max(120)).max(20).optional().default([]),
  vendorType: z.string().trim().max(160).optional(),
  status: z.enum(vendorStatusValues).optional(),
  rateMin: z.number().int().nonnegative().optional(),
  rateMax: z.number().int().nonnegative().optional(),
  hoursMin: z.number().int().nonnegative().optional(),
  hoursMax: z.number().int().nonnegative().optional(),
  sort: z.enum(["createdAt", "name", "hourlyRateNumeric", "status"]).optional().default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(25),
  includeRemoved: z.boolean().optional().default(false),
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

      // Persist locally as the system of record for the admin vendor inventory.
      // Non-fatal: if the DB is unavailable or the write fails, the public form
      // still succeeds via the portal mirror + owner notification below.
      const saved = await createVendorApplication(input, { portalForwarded: portalStored }).catch((error) => {
        console.warn("[Vendor] local persist failed:", error);
        return null;
      });

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

      return { success: true, portalStored, notificationDelivered, id: saved?.id ?? null } as const;
    }),

    // --- Admin-only vendor inventory API (guarded by adminProcedure) ---
    adminSearch: adminProcedure.input(vendorSearchInput).query(async ({ input }) => {
      return searchVendors(input);
    }),
    adminGet: adminProcedure.input(z.object({ id: z.string().trim().min(1).max(64) })).query(async ({ input }) => {
      return getVendorById(input.id);
    }),
    // Compact profiles for the selected vendors → one-page-each PDF export.
    adminGetMany: adminProcedure
      .input(z.object({ ids: z.array(z.string().trim().min(1).max(64)).min(1).max(100) }))
      .query(async ({ input }) => getVendorsForExport(input.ids)),
    // Soft-remove / restore a vendor from the workspace (dt_site only).
    adminSetRemoved: adminProcedure
      .input(z.object({ id: z.string().trim().min(1).max(64), removed: z.boolean() }))
      .mutation(async ({ input }) => ({ success: await setVendorRemoved(input.id, input.removed) })),
    // Flag a vendor as core team (DT is their primary client).
    adminSetCoreTeam: adminProcedure
      .input(z.object({ id: z.string().trim().min(1).max(64), coreTeam: z.boolean() }))
      .mutation(async ({ input }) => ({ success: await setVendorCoreTeam(input.id, input.coreTeam) })),
    // Brief vendor list for pickers (Originator dropdown, resource checkboxes).
    adminBriefList: adminProcedure.query(async () => listVendorBrief()),
    adminUpdateStatus: adminProcedure
      .input(
        z.object({
          id: z.string().trim().min(1).max(64),
          status: z.enum(vendorStatusValues),
          statusNotes: z.string().trim().max(4000).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const success = await updateVendorStatus(input.id, input.status, input.statusNotes);
        return { success };
      }),
    adminFacets: adminProcedure.query(async () => {
      return getVendorFacets();
    }),
    // Admin-curated Company & Links override (backfill for legacy vendors).
    adminUpdateProfile: adminProcedure
      .input(
        z.object({
          id: z.string().trim().min(1).max(64),
          companyName: z.string().trim().max(240).optional(),
          websiteUrl: z.string().trim().max(500).optional(),
          personalLinkedin: z.string().trim().max(500).optional(),
          companySocial: z.string().trim().max(500).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...fields } = input;
        const success = await updateVendorProfile(id, fields);
        return { success };
      }),
    // Admin category tags — a vendor can belong to multiple SME categories
    // beyond the one they applied as, so they surface in more searches.
    adminUpdateCategories: adminProcedure
      .input(
        z.object({
          id: z.string().trim().min(1).max(64),
          categories: z.array(z.enum(VENDOR_CATEGORIES)).max(VENDOR_CATEGORIES.length),
        }),
      )
      .mutation(async ({ input }) => {
        const success = await updateVendorCategories(input.id, input.categories);
        return { success };
      }),
    // --- Active engagements: assignment + compensation ---
    adminSetActiveEngaged: adminProcedure
      .input(z.object({ id: z.string().trim().min(1).max(64), active: z.boolean() }))
      .mutation(async ({ input }) => ({ success: await updateVendorActiveEngaged(input.id, input.active) })),
    adminGetEngagements: adminProcedure
      .input(z.object({ id: z.string().trim().min(1).max(64) }))
      .query(async ({ input }) => getVendorEngagements(input.id)),
    adminSetAssignment: adminProcedure
      .input(z.object({ id: z.string().trim().min(1).max(64), projectId: z.number().int(), assigned: z.boolean() }))
      .mutation(async ({ input }) => ({ success: await setVendorProject(input.id, input.projectId, input.assigned) })),
    adminAddComp: adminProcedure
      .input(z.object({ vendorProjectId: z.number().int(), type: z.enum(COMP_TYPES), details: z.record(z.string(), z.any()) }))
      .mutation(async ({ input }) => addComp(input.vendorProjectId, input.type, input.details)),
    // Inline from a vendor profile: require the tri-party NDA for this vendor on
    // a client (sets the client's NDA Wall + marks 'pending'). Send is wired later.
    adminRequireClientNda: adminProcedure
      .input(z.object({ id: z.string().trim().min(1).max(64), clientId: z.number().int() }))
      .mutation(async ({ input }) => ({ success: await requireClientNda(input.id, input.clientId) })),
    // Generate the tri-party NDA + signing tokens and email the client/vendor links.
    adminSendNda: adminProcedure
      .input(z.object({ id: z.string().trim().min(1).max(64), clientId: z.number().int() }))
      .mutation(async ({ input }) => sendNda(input.id, input.clientId)),
    adminNdaStatus: adminProcedure
      .input(z.object({ id: z.string().trim().min(1).max(64), clientId: z.number().int() }))
      .query(async ({ input }) => getNdaForVendorClient(input.id, input.clientId)),
    adminNdaExecutedPdf: adminProcedure
      .input(z.object({ ndaId: z.number().int() }))
      .query(async ({ input }) => ({ base64: await buildExecutedPdf(input.ndaId) })),
    adminUpdateComp: adminProcedure
      .input(z.object({ id: z.number().int(), type: z.enum(COMP_TYPES), details: z.record(z.string(), z.any()) }))
      .mutation(async ({ input }) => ({ success: await updateComp(input.id, input.type, input.details) })),
    adminRemoveComp: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => ({ success: await removeComp(input.id) })),
  }),
  // Public, token-gated NDA signing (no auth — external parties sign via link).
  nda: router({
    getByToken: publicProcedure
      .input(z.object({ token: z.string().trim().min(16).max(64) }))
      .query(async ({ input }) => getNdaByToken(input.token)),
    sign: publicProcedure
      .input(z.object({ token: z.string().trim().min(16).max(64), signatureText: z.string().trim().min(2).max(160) }))
      .mutation(async ({ input, ctx }) => {
        const fwd = ctx.req.headers["x-forwarded-for"];
        const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim() || ctx.req.ip || null;
        const ua = (ctx.req.headers["user-agent"] as string) || null;
        return signNda(input.token, input.signatureText, ip, ua);
      }),
  }),
  // Clients & projects management (dedicated admin manager).
  clients: router({
    list: adminProcedure.query(async () => listClients()),
    create: adminProcedure
      .input(z.object({ name: z.string().trim().min(1).max(200) }))
      .mutation(async ({ input }) => createClient(input.name)),
    update: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          name: z.string().trim().min(1).max(200).optional(),
          active: z.boolean().optional(),
          ndaWall: z.boolean().optional(),
          legalName: z.string().trim().max(400).optional(),
          address: z.string().trim().max(500).optional(),
          website: z.string().trim().max(300).optional(),
          originator: z.string().trim().max(200).optional(),
          intakeDate: z.string().trim().max(40).optional(),
          referrer: z.string().trim().max(200).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...fields } = input;
        return { success: await updateClient(id, fields) };
      }),
    setResource: adminProcedure
      .input(
        z.object({
          clientId: z.number().int(),
          vendorApplicationId: z.string().trim().min(1).max(64),
          assigned: z.boolean(),
        }),
      )
      .mutation(async ({ input }) => ({
        success: await setClientResource(input.clientId, input.vendorApplicationId, input.assigned),
      })),
    addContact: adminProcedure
      .input(
        z.object({
          clientId: z.number().int(),
          name: z.string().trim().min(1).max(200),
          title: z.string().trim().max(200).optional(),
          email: z.string().trim().max(320).optional(),
          phone: z.string().trim().max(60).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { clientId, ...fields } = input;
        return addContact(clientId, fields);
      }),
    updateContact: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          name: z.string().trim().min(1).max(200).optional(),
          title: z.string().trim().max(200).optional(),
          email: z.string().trim().max(320).optional(),
          phone: z.string().trim().max(60).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...fields } = input;
        return { success: await updateContact(id, fields) };
      }),
    removeContact: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => ({ success: await removeContact(input.id) })),
    setPrimaryContact: adminProcedure
      .input(z.object({ clientId: z.number().int(), contactId: z.number().int() }))
      .mutation(async ({ input }) => ({ success: await setPrimaryContact(input.clientId, input.contactId) })),
    remove: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => ({ success: await deleteClient(input.id) })),
    createProject: adminProcedure
      .input(z.object({ clientId: z.number().int(), name: z.string().trim().min(1).max(200) }))
      .mutation(async ({ input }) => createProject(input.clientId, input.name)),
    updateProject: adminProcedure
      .input(z.object({ id: z.number().int(), name: z.string().trim().min(1).max(200).optional(), active: z.boolean().optional() }))
      .mutation(async ({ input }) => ({ success: await updateProject(input.id, { name: input.name, active: input.active }) })),
    removeProject: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => ({ success: await deleteProject(input.id) })),
  }),

  // Admin access management -- OWNER-only (milton@/hello@). Owners add/remove the
  // Tailscale logins that may use the console; see server/access.ts.
  access: router({
    // Any admin may ask whether THEY are an owner (drives the nav item).
    amIOwner: adminProcedure.query(({ ctx }) => isOwner(ctx.user.email)),
    // Current tailnet members, for the owner's "assign a user" dropdown.
    tailnetUsers: ownerProcedure.query(async () => tailnetUsers()),
    list: ownerProcedure.query(async () => listAllowlist()),
    add: ownerProcedure
      .input(z.object({ login: z.string().trim().min(3).max(160), note: z.string().trim().max(200).optional().default("") }))
      .mutation(async ({ input, ctx }) => addAllowlist(input.login, input.note ?? "", ctx.user.email ?? "")),
    remove: ownerProcedure
      .input(z.object({ login: z.string().trim().min(3).max(160) }))
      .mutation(async ({ input }) => removeAllowlist(input.login)),
  }),
});

export type AppRouter = typeof appRouter;
