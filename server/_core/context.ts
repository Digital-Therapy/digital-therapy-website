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
// injects (Tailscale-User-Login / -Name). A user-owned tailnet device shows up
// under its own login; tagged/service nodes have no user identity, so they fall
// back to a generic label but are still admin (being on the tailnet is the gate).
function tailscaleAdmin(login: string, name: string): User {
  const who = login || "tailnet-member";
  return {
    id: 0,
    openId: `tailscale:${who}`,
    name: name || login || "Tailnet member",
    email: login || "tailnet-member@digitaltherapy.local",
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

  // Tailscale gate: the tailnet-only reverse proxy (fronted by `tailscale serve`)
  // stamps the X-DT-Tailnet marker and forwards the Tailscale-User-* identity that
  // tailscaled injects; the public proxy STRIPS both. So the marker's presence here
  // means the caller reached us over the tailnet, and we grant admin -- labelled by
  // their Tailscale login when one is available. The marker plus TRUST_TAILSCALE_HEADER
  // are two independent proxy-controlled signals, so a spoofed header on the public
  // path can never satisfy this gate.
  if (ENV.trustTailscaleHeader && opts.req.headers["x-dt-tailnet"] === "1") {
    const login = String(opts.req.headers["tailscale-user-login"] ?? "").trim();
    const nameHeader = opts.req.headers["tailscale-user-name"];
    const name = typeof nameHeader === "string" ? nameHeader.trim() : "";
    return { req: opts.req, res: opts.res, user: tailscaleAdmin(login, name) };
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
