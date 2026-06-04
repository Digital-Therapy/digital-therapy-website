/**
 * Admin vendor directory — search & filter the SME inventory to assemble
 * project teams. AND-matches across skills / certifications / sectors plus a
 * text query, vendor type, status and rate/hours ranges (server-side).
 */
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { ChevronDown, Search, SlidersHorizontal, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

// Primary category toggle across the top of the console. `value` is the stored
// vendorTypeLabel ("" = All); `label` is the friendly category name.
// `value` is matched as a substring against the stored vendorTypeLabel, so it
// catches both "Technology Vendor" and legacy "Technology SME" labels.
const CATEGORIES: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Technology", value: "Technology" },
  { label: "Finance & Accounting", value: "Finance & Accounting" },
  { label: "Marketing", value: "Marketing" },
  { label: "Family Offices", value: "Family Office" },
];

const STATUSES = ["applied", "screening", "approved", "onboarded", "archived"] as const;

const STATUS_STYLES: Record<string, string> = {
  applied: "bg-black/8 text-black/70",
  screening: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  onboarded: "bg-emerald-100 text-emerald-800",
  archived: "bg-black/10 text-black/45",
};

const PAGE_SIZE = 25;

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function AdminVendors() {
  const [, setLocation] = useLocation();
  const [queryInput, setQueryInput] = useState("");
  const query = useDebounced(queryInput);
  const [skills, setSkills] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [vendorType, setVendorType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [query, skills, certifications, sectors, vendorType, status]);

  const facetsQuery = trpc.vendor.adminFacets.useQuery();
  const searchQuery = trpc.vendor.adminSearch.useQuery({
    query,
    skills,
    certifications,
    sectors,
    vendorType: vendorType || undefined,
    status: (status || undefined) as (typeof STATUSES)[number] | undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const facets = facetsQuery.data;
  const result = searchQuery.data;
  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;

  const activeFilterCount =
    skills.length + certifications.length + sectors.length + (vendorType ? 1 : 0) + (status ? 1 : 0);

  const clearAll = () => {
    setSkills([]);
    setCertifications([]);
    setSectors([]);
    setVendorType("");
    setStatus("");
    setQueryInput("");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl tracking-[-0.05em]">Vendor inventory</h1>
          <p className="text-sm text-black/60">
            Search your SME resources by skill, certification, sector, type and availability to assemble the
            right team for an engagement.
          </p>
        </div>

        {/* Primary category toggle */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = vendorType === cat.value;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setVendorType(cat.value)}
                aria-pressed={active}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-[#0A65FF] text-white shadow-[0_10px_25px_rgba(10,101,255,0.22)]"
                    : "border border-black/12 bg-white text-black/70 hover:border-[#0A65FF]/40 hover:text-[#0A65FF]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search + filter controls */}
        <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
            <Input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search name, email, bio, or company CV…"
              className="h-11 pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FacetFilter
              label="Skills"
              options={facets?.skills ?? []}
              selected={skills}
              onChange={setSkills}
              loading={facetsQuery.isLoading}
            />
            <FacetFilter
              label="Certifications"
              options={facets?.certifications ?? []}
              selected={certifications}
              onChange={setCertifications}
              loading={facetsQuery.isLoading}
            />
            <FacetFilter
              label="Sectors"
              options={facets?.sectors ?? []}
              selected={sectors}
              onChange={setSectors}
              loading={facetsQuery.isLoading}
            />

            <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-black/60">
                <X className="mr-1 h-4 w-4" />
                Clear ({activeFilterCount})
              </Button>
            )}
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {[
                ...skills.map((v) => ({ kind: "skill" as const, v })),
                ...certifications.map((v) => ({ kind: "cert" as const, v })),
                ...sectors.map((v) => ({ kind: "sector" as const, v })),
              ].map(({ kind, v }) => (
                <button
                  key={`${kind}-${v}`}
                  onClick={() => {
                    if (kind === "skill") setSkills((s) => s.filter((x) => x !== v));
                    if (kind === "cert") setCertifications((s) => s.filter((x) => x !== v));
                    if (kind === "sector") setSectors((s) => s.filter((x) => x !== v));
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-[#0A65FF]/10 px-2.5 py-1 text-xs font-medium text-[#0A65FF] hover:bg-[#0A65FF]/20"
                >
                  {v}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-black/10 bg-white">
          <div className="flex items-center justify-between border-b border-black/8 px-5 py-3 text-sm text-black/60">
            <span>
              {searchQuery.isLoading
                ? "Searching…"
                : `${result?.total ?? 0} vendor${(result?.total ?? 0) === 1 ? "" : "s"} found`}
            </span>
            {result && result.total > 0 && (
              <span>
                Page {result.page} of {totalPages}
              </span>
            )}
          </div>

          {searchQuery.isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !result || result.rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-16 text-center">
              <Users className="h-10 w-10 text-black/20" />
              <p className="text-sm font-medium text-black/70">No vendors match these filters</p>
              <p className="max-w-sm text-xs text-black/45">
                Try removing a filter, or widen your search. New vendors appear here as soon as they submit the
                application form.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Certifications</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rows.map((v) => (
                  <TableRow
                    key={v.id}
                    onClick={() => setLocation(`/admin/vendors/${v.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="font-medium text-[#111111]">{v.name}</div>
                      <div className="text-xs text-black/50">{v.email}</div>
                    </TableCell>
                    <TableCell className="text-sm text-black/70">{v.vendorTypeLabel}</TableCell>
                    <TableCell>
                      <TagList items={v.skills} />
                    </TableCell>
                    <TableCell>
                      <TagList items={v.certifications} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-black/70">{v.hourlyRate || "—"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          STATUS_STYLES[v.status] ?? "bg-black/8 text-black/70"
                        }`}
                      >
                        {v.status}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-black/55">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {result && result.total > result.pageSize && (
            <div className="flex items-center justify-between border-t border-black/8 px-5 py-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-black/55">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function TagList({ items, max = 3 }: { items: string[]; max?: number }) {
  if (!items.length) return <span className="text-xs text-black/35">—</span>;
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((item) => (
        <Badge key={item} variant="secondary" className="font-normal">
          {item}
        </Badge>
      ))}
      {extra > 0 && <span className="text-xs text-black/45">+{extra}</span>}
    </div>
  );
}

function FacetFilter({
  label,
  options,
  selected,
  onChange,
  loading,
}: {
  label: string;
  options: { value: string; count: number }[];
  selected: string[];
  onChange: (next: string[]) => void;
  loading?: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => options.filter((o) => o.value.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  );
  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {label}
          {selected.length > 0 && (
            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0A65FF] px-1 text-[0.65rem] font-bold text-white">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b border-black/8 p-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter ${label.toLowerCase()}…`}
            className="h-8"
          />
        </div>
        <ScrollArea className="h-64">
          <div className="p-2">
            {loading ? (
              <p className="px-2 py-6 text-center text-xs text-black/45">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-black/45">
                {options.length === 0 ? "No data yet" : "No matches"}
              </p>
            ) : (
              filtered.map((o) => (
                <label
                  key={o.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-black/5"
                >
                  <Checkbox checked={selected.includes(o.value)} onCheckedChange={() => toggle(o.value)} />
                  <span className="flex-1 truncate">{o.value}</span>
                  <span className="text-xs text-black/40">{o.count}</span>
                </label>
              ))
            )}
          </div>
        </ScrollArea>
        {selected.length > 0 && (
          <div className="border-t border-black/8 p-2">
            <Button variant="ghost" size="sm" className="w-full text-black/60" onClick={() => onChange([])}>
              Clear {label.toLowerCase()}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
