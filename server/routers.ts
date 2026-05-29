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
  // Server backstop is min(1): the real contact form enforces minLength=20
  // client-side, while the Sigmund chat widget legitimately sends short
  // messages that must still be captured.
  message: z.string().trim().min(1, "Please enter a message.").max(4000),
  context: z.string().trim().max(240).optional().default("general inquiry"),
  sourcePage: z.string().trim().max(500).optional().default("unknown"),
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
  context: z.string().trim().max(240).optional().default("vendor application"),
  sourcePage: z.string().trim().max(500).optional().default("unknown"),
  files: z.array(vendorFileInput).max(3).optional().default([]),
});

export function formatContactNotification(input: z.infer<typeof contactSubmissionInput>) {
  return [
    `Name: ${oneLine(input.name)}`,
    `Email: ${oneLine(input.email)}`,
    `Organization: ${oneLine(input.organization) || "Not provided"}`,
    `Role: ${oneLine(input.role) || "Not provided"}`,
    `Context: ${oneLine(input.context) || "general inquiry"}`,
    `Source page: ${oneLine(input.sourcePage) || "unknown"}`,
    "",
    "Message:",
    input.message,
  ].join("\n");
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
      const normalized = {
        ...input,
        organization: input.organization || null,
        role: input.role || null,
        context: input.context || "general inquiry",
        sourcePage: input.sourcePage || "unknown",
      };

      const saved = await createContactSubmission(normalized);
      const notificationDelivered = await notifyOwner({
        title: `New Digital Therapy contact form: ${oneLine(input.name)}`,
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
      const notificationDelivered = await notifyOwner({
        title: `New vendor application: ${oneLine(input.name)} (${oneLine(input.vendorTypeLabel)})`,
        content: [
          `Name: ${oneLine(input.name)}`,
          `Email: ${oneLine(input.email)}`,
          `Vendor type: ${oneLine(input.vendorTypeLabel)}`,
          `Role: ${oneLine(input.role || "Not provided")}`,
          `Files attached: ${files.length}`,
          `Stored in portal: ${portalStored ? "yes" : "NO - check portal"}`,
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
