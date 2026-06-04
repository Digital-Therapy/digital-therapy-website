import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { ENV } from "./env";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// Synthetic admin used only in local preview mode (ENV.devPreview), so the
// /admin console is reachable without the production OAuth flow. Never active
// in production — ENV.devPreview is forced false when NODE_ENV=production.
const DEV_PREVIEW_ADMIN: User = {
  id: 0,
  openId: "dev-preview-admin",
  name: "Preview Admin",
  email: "preview-admin@digitaltherapy.local",
  loginMethod: "dev-preview",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Local preview short-circuit: skip OAuth entirely and present a fake admin.
  if (ENV.devPreview) {
    return { req: opts.req, res: opts.res, user: DEV_PREVIEW_ADMIN };
  }

  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
