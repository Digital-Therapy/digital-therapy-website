import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Human-readable public IDs for admin entities. The underlying values are the
 * dt_site.client.id / dt_site.project.id serials — these formatters just wrap
 * them in a prefixed, zero-padded form that reads well in invoices, emails,
 * and vendor communications. Padding grows automatically past 4 digits.
 */
export function formatClientId(id: number): string {
  return `CLI-${String(id).padStart(4, "0")}`;
}

export function formatProjectId(id: number): string {
  return `PRJ-${String(id).padStart(4, "0")}`;
}
