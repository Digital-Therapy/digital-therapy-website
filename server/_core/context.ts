import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { isAllowedAdmin } from "../access";
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

// Build a per-request User from the identity that `tailscale serve` injects
// (Tailscale-User-Login / -Name). `role` is decided by the allowlist: owners +
// added logins get "admin"; any other tailnet member is a signed-in non-admin
// (so the console shows them a clear "admin access required" gate).
function tailscaleUser(login: string, name: string, role: "user" | "admin"): User {
  return {
    id: 0,
    openId: `tailscale:${login}`,
    name: name || login,
    email: login,
    loginMethod: "tailscale",
    role,
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

  // Tailscale gate: the tailnet-only reverse proxy (fronted by `tailscale serve`)
  // stamps the X-DT-Tailnet marker and forwards the Tailscale-User-* identity that
  // tailscaled injects; the public proxy STRIPS both. The marker plus
  // TRUST_TAILSCALE_HEADER are two independent proxy-controlled signals, so a
  // spoofed header on the public path can never reach here. Being on the tailnet
  // only IDENTIFIES the caller -- admin is then granted only if their login is on
  // the allowlist (owners + entries added via the in-console Access page).
  if (ENV.trustTailscaleHeader && opts.req.headers["x-dt-tailnet"] === "1") {
    const login = String(opts.req.headers["tailscale-user-login"] ?? "").trim();
    if (login) {
      const nameHeader = opts.req.headers["tailscale-user-name"];
      const name = typeof nameHeader === "string" ? nameHeader.trim() : "";
      const role = (await isAllowedAdmin(login)) ? "admin" : "user";
      return { req: opts.req, res: opts.res, user: tailscaleUser(login, name, role) };
    }
    // Tagged/login-less tailnet node (no user identity) -> treat as anonymous.
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
