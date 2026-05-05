import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createContactSubmission } from "./db";

const contactSubmissionInput = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(160),
  email: z.string().trim().email("Please enter a valid work email.").max(320),
  organization: z.string().trim().max(240).optional().default(""),
  role: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(20, "Please share a little more context.").max(4000),
  context: z.string().trim().max(240).optional().default("general inquiry"),
  sourcePage: z.string().trim().max(500).optional().default("unknown"),
});

export function formatContactNotification(input: z.infer<typeof contactSubmissionInput>) {
  return [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Organization: ${input.organization || "Not provided"}`,
    `Role: ${input.role || "Not provided"}`,
    `Context: ${input.context || "general inquiry"}`,
    `Source page: ${input.sourcePage || "unknown"}`,
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
        title: `New Digital Therapy contact form: ${input.name}`,
        content: formatContactNotification(input),
      }).catch((error) => {
        console.warn("[Contact] Owner notification failed:", error);
        return false;
      });

      return {
        success: true,
        id: saved?.id ?? null,
        notificationDelivered,
      } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
