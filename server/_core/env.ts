export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Local zero-install preview: in-memory vendor store + fake admin login, so
  // the /admin console works with no database and no OAuth. Auto-disabled in
  // production. Turn off by removing DEV_PREVIEW from .env once a real
  // DATABASE_URL is connected.
  devPreview: process.env.DEV_PREVIEW === "true" && process.env.NODE_ENV !== "production",
  // Trust Tailscale-injected identity headers as the admin gate. Set ONLY in a
  // deployment where the /admin console is reached exclusively via `tailscale
  // serve` (which injects Tailscale-User-Login) AND the public-facing reverse
  // proxy strips those headers. See server/_core/context.ts for how it is used.
  trustTailscaleHeader: process.env.TRUST_TAILSCALE_HEADER === "true",
  // Tailscale logins (comma-separated) that are ALWAYS admin AND own access
  // management -- they seed/manage the allowlist (server/access.ts) and can
  // never be locked out. Everyone else must be added via the in-console Access
  // page. With this empty, no Tailscale login is admin (fail closed).
  adminTailscaleOwners: (process.env.ADMIN_TAILSCALE_LOGINS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // DT Portal (apps.dtapps.io / app-dashboard) ingest target.
  portalIngestBase: process.env.PORTAL_INGEST_BASE ?? "",
  ingestSecret: process.env.INGEST_SECRET ?? "",
};
