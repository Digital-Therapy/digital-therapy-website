/**
 * Pipeline — track opportunities through stages from intake to closed-won/lost.
 *
 * Two flows in one table:
 *   - kind="new_project"  — existing client, new scope to sell
 *   - kind="new_client"   — prospect being converted to a paying client
 *
 * On close-won, the opportunity calls clients.createProject (and clients.create
 * for the new-client flow) so the resulting work shows up in the Clients &
 * Projects tab automatically. No double-entry.
 */
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import { AlertCircle, ChevronDown, ChevronRight, Plus, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { AppRouter } from "../../../../server/routers";
import OpportunityDialog from "./OpportunityDialog";

type OpportunityListItem = inferRouterOutputs<AppRouter>["pipeline"]["list"][number];

const STAGE_ORDER = [
  { key: "intake", label: "Intake" },
  { key: "qualified", label: "Qualified" },
  { key: "discovery", label: "Discovery" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "closed_won", label: "Closed-Won" },
  { key: "closed_lost", label: "Closed-Lost" },
] as const;

type StageKey = (typeof STAGE_ORDER)[number]["key"];

const OPEN_STAGES: StageKey[] = ["intake", "qualified", "discovery", "proposal", "negotiation"];

type KindFilter = "all" | "new_project" | "new_client";

function formatMoney(cents: number | null): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const date = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  const today = new Date().toISOString().slice(0, 10);
  return iso < today;
}

export default function AdminPipeline() {
  const utils = trpc.useUtils();
  const opportunitiesQuery = trpc.pipeline.list.useQuery();
  const setStageMutation = trpc.pipeline.setStage.useMutation({
    onSuccess: () => utils.pipeline.list.invalidate(),
    onError: (e) => toast.error(e.message || "Could not change stage."),
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [showClosed, setShowClosed] = useState(false);
  const [collapsedStages, setCollapsedStages] = useState<Set<StageKey>>(
    () => new Set<StageKey>(["closed_won", "closed_lost"]),
  );

  const opportunities = opportunitiesQuery.data ?? [];

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (kindFilter !== "all" && o.kind !== kindFilter) return false;
      if (!showClosed && (o.stage === "closed_won" || o.stage === "closed_lost")) return false;
      return true;
    });
  }, [opportunities, kindFilter, showClosed]);

  const grouped = useMemo(() => {
    const m = new Map<StageKey, typeof filtered>();
    for (const stage of STAGE_ORDER) m.set(stage.key, []);
    for (const o of filtered) {
      const k = (m.has(o.stage as StageKey) ? (o.stage as StageKey) : "intake") as StageKey;
      m.get(k)!.push(o);
    }
    return m;
  }, [filtered]);

  const stats = useMemo(() => {
    const open = opportunities.filter((o) => o.stage !== "closed_won" && o.stage !== "closed_lost");
    const openValue = open.reduce((sum, o) => sum + (o.estValueCents ?? 0), 0);
    const weighted = open.reduce(
      (sum, o) => sum + ((o.estValueCents ?? 0) * (o.probabilityPct ?? 0)) / 100,
      0,
    );
    const overdue = open.filter((o) => isOverdue(o.nextStepDue)).length;
    const wonThisQuarter = (() => {
      const now = new Date();
      const q = Math.floor(now.getUTCMonth() / 3);
      const qStart = new Date(Date.UTC(now.getUTCFullYear(), q * 3, 1)).toISOString();
      return opportunities.filter((o) => o.stage === "closed_won" && (o.closedAt ?? "") >= qStart).length;
    })();
    return { openCount: open.length, openValue, weighted: Math.round(weighted), overdue, wonThisQuarter };
  }, [opportunities]);

  const toggleStage = (key: StageKey) => {
    setCollapsedStages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-3xl tracking-[-0.05em]">Pipeline</h1>
            <p className="max-w-2xl text-sm text-black/60">
              Track conversion of new projects for existing clients and new clients from prospects. Close-won
              promotes the opportunity to a real client + project on the Clients &amp; Projects tab.
            </p>
          </div>
          <Button onClick={() => setCreating(true)} className="shrink-0">
            <Plus className="mr-1.5 h-4 w-4" />
            Add opportunity
          </Button>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Open opportunities" value={String(stats.openCount)} />
          <StatTile label="Open pipeline" value={formatMoney(stats.openValue)} />
          <StatTile label="Weighted pipeline" value={formatMoney(stats.weighted)} />
          <StatTile
            label="Overdue next step"
            value={String(stats.overdue)}
            tone={stats.overdue > 0 ? "warn" : "neutral"}
          />
        </div>

        {/* Filter strip */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-3">
          <div className="flex items-center gap-1 rounded-full bg-black/[0.04] p-1">
            {(
              [
                { key: "all", label: "All" },
                { key: "new_project", label: "Existing clients" },
                { key: "new_client", label: "Prospects" },
              ] as const
            ).map((tab) => {
              const active = kindFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setKindFilter(tab.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    active ? "bg-white text-[#111111] shadow-sm" : "text-black/60 hover:text-black/80"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <label className="ml-auto inline-flex items-center gap-2 text-xs text-black/70">
            <input
              type="checkbox"
              checked={showClosed}
              onChange={(e) => setShowClosed(e.target.checked)}
              className="h-4 w-4 rounded border-black/30 text-[#0A65FF] focus:ring-[#0A65FF]"
            />
            Show closed
          </label>
        </div>

        {opportunitiesQuery.isLoading ? (
          <Skeleton className="h-60 w-full" />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-black/15 bg-white/50 px-6 py-14 text-center">
            <TrendingUp className="h-8 w-8 text-black/30" />
            <p className="text-sm text-black/55">
              {opportunities.length === 0
                ? "No opportunities yet — add your first above."
                : "No opportunities match this filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {STAGE_ORDER.map(({ key, label }) => {
              const rows = grouped.get(key) ?? [];
              if (!rows.length) return null;
              const collapsed = collapsedStages.has(key);
              const groupValue = rows.reduce((s, r) => s + (r.estValueCents ?? 0), 0);
              return (
                <section key={key} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                  <button
                    type="button"
                    onClick={() => toggleStage(key)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.02]"
                  >
                    {collapsed ? <ChevronRight className="h-4 w-4 text-black/40" /> : <ChevronDown className="h-4 w-4 text-black/40" />}
                    <span className="text-sm font-semibold text-[#111111]">{label}</span>
                    <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs font-medium text-black/65">
                      {rows.length}
                    </span>
                    {groupValue > 0 && (
                      <span className="ml-auto text-xs text-black/55">{formatMoney(groupValue)}</span>
                    )}
                  </button>
                  {!collapsed && (
                    <div className="divide-y divide-black/5 border-t border-black/5">
                      {rows.map((o) => (
                        <Row
                          key={o.id}
                          opportunity={o}
                          onOpen={() => setEditingId(o.id)}
                          onStageChange={(stage) =>
                            setStageMutation.mutate({ id: o.id, stage }, { onSuccess: () => utils.pipeline.get.invalidate({ id: o.id }) })
                          }
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {(creating || editingId != null) && (
          <OpportunityDialog
            opportunityId={editingId}
            onOpenChange={(open) => {
              if (!open) {
                setCreating(false);
                setEditingId(null);
              }
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function StatTile({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "warn" }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-black/55">{label}</p>
      <p
        className={`mt-1 font-display text-2xl tracking-[-0.03em] ${
          tone === "warn" ? "text-[#c83a3a]" : "text-[#111111]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Row({
  opportunity,
  onOpen,
  onStageChange,
}: {
  opportunity: OpportunityListItem;
  onOpen: () => void;
  onStageChange: (stage: StageKey) => void;
}) {
  const overdue = isOverdue(opportunity.nextStepDue);
  const kindLabel = opportunity.kind === "new_project" ? "Project" : "Prospect";
  const kindTone =
    opportunity.kind === "new_project" ? "bg-[#0A65FF]/10 text-[#0040c9]" : "bg-[#a35d00]/10 text-[#a35d00]";
  const partyName =
    opportunity.kind === "new_project"
      ? opportunity.clientName ?? "(unset client)"
      : opportunity.prospectCompany || opportunity.prospectName || "(unnamed prospect)";

  return (
    <div className="grid cursor-pointer grid-cols-12 items-center gap-3 px-4 py-3 transition-colors hover:bg-black/[0.015]">
      <button type="button" onClick={onOpen} className="col-span-12 grid grid-cols-12 items-center gap-3 text-left sm:col-span-9">
        <div className="col-span-12 sm:col-span-5">
          <p className="text-sm font-semibold text-[#111111]">{opportunity.title}</p>
          <p className="mt-0.5 flex items-center gap-2 text-xs text-black/55">
            <span className={`rounded px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide ${kindTone}`}>
              {kindLabel}
            </span>
            <span className="truncate">{partyName}</span>
          </p>
        </div>
        <div className="col-span-6 sm:col-span-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-black/45">Value</p>
          <p className="mt-0.5 text-sm text-[#111111]">{formatMoney(opportunity.estValueCents)}</p>
        </div>
        <div className="col-span-6 sm:col-span-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-black/45">Est. close</p>
          <p className="mt-0.5 text-sm text-[#111111]">{formatDate(opportunity.estCloseDate)}</p>
        </div>
        <div className="col-span-12 sm:col-span-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-black/45">Next step</p>
          <p
            className={`mt-0.5 flex items-center gap-1 truncate text-xs ${
              overdue ? "font-medium text-[#c83a3a]" : "text-black/65"
            }`}
            title={opportunity.nextStep ?? ""}
          >
            {overdue && <AlertCircle className="h-3 w-3 shrink-0" />}
            <span className="truncate">{opportunity.nextStep || "—"}</span>
            {opportunity.nextStepDue && (
              <span className="ml-1 shrink-0 text-[0.65rem] text-black/45">({formatDate(opportunity.nextStepDue)})</span>
            )}
          </p>
        </div>
      </button>
      <div className="col-span-12 flex justify-end sm:col-span-3">
        <select
          value={opportunity.stage}
          onChange={(e) => onStageChange(e.target.value as StageKey)}
          onClick={(e) => e.stopPropagation()}
          className="rounded-full border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-[#111111] focus:border-[#0A65FF] focus:outline-none"
        >
          {STAGE_ORDER.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
