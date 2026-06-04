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

// Build a per-request admin User from the identity that `tailscale serve`
// injects (Tailscale-User-Login / -Name). Each tailnet member shows up under
// their own login instead of a single shared account.
function tailscaleAdmin(login: string, name?: string): User {
  return {
    id: 0,
    openId: `tailscale:${login}`,
    name: name?.trim() || login,
    email: login,
    loginMethod: "tailscale",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Local preview short-circuit: skip OAuth entirely and present a fake admin.
  if (ENV.devPreview) {
    return { req: opts.req, res: opts.res, user: DEV_PREVIEW_ADMIN };
  }

  // Tailscale gate: when the request arrives through `tailscale serve`, tailscaled
  // injects Tailscale-User-Login. The tailnet-only reverse proxy re-stamps it and
  // adds the X-DT-Tailnet marker; the public proxy STRIPS both. So the presence of
  // the marker + login here means the caller is an authenticated tailnet member,
  // and we grant them admin. Two independent proxy-controlled signals are required
  // so a spoofed header on the public path can never satisfy this.
  if (ENV.trustTailscaleHeader && opts.req.headers["x-dt-tailnet"] === "1") {
    const login = String(opts.req.headers["tailscale-user-login"] ?? "").trim();
    if (login) {
      const name = opts.req.headers["tailscale-user-name"];
      return {
        req: opts.req,
        res: opts.res,
        user: tailscaleAdmin(login, typeof name === "string" ? name : undefined),
      };
    }
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
