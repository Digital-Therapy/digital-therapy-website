/**
 * Current tailnet users, for the Access-page "assign a user" dropdown.
 *
 * The app container can't run the `tailscale` CLI, so a host cron
 * (scripts/refresh-tailnet-users.py) writes the member list to a JSON file
 * that's bind-mounted in read-only at TAILNET_USERS_FILE. We just read + cache
 * it. Missing/unreadable file -> empty list (the UI falls back to manual entry).
 */
import { readFile } from "node:fs/promises";

export type TailnetUser = { login: string; name: string };

const FILE = process.env.TAILNET_USERS_FILE || "/data/tailnet-users.json";
const TTL_MS = 30_000;
let _cache: { users: TailnetUser[]; at: number } | null = null;

export async function tailnetUsers(): Promise<TailnetUser[]> {
  const now = Date.now();
  if (_cache && now - _cache.at < TTL_MS) return _cache.users;
  try {
    const parsed = JSON.parse(await readFile(FILE, "utf8"));
    const users: TailnetUser[] = Array.isArray(parsed)
      ? parsed
          .filter((u) => u && typeof u.login === "string" && u.login.includes("@"))
          .map((u) => ({ login: String(u.login).toLowerCase(), name: String(u.name || u.login) }))
      : [];
    _cache = { users, at: now };
    return users;
  } catch {
    return _cache?.users ?? [];
  }
}
