/**
 * Active Client Engagements — shown on a vendor's detail page when they're
 * marked active on live engagements. Active clients → check to reveal their
 * active projects → check the projects the vendor is on → View Details opens
 * the compensation breakdown popup.
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ChevronDown, ChevronRight, Plus, Receipt, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type CompLine = { id: number; type: string; details: Record<string, any> };

type CompField =
  | { key: string; label: string; kind: "number"; placeholder?: string }
  | { key: string; label: string; kind: "text"; placeholder?: string }
  | { key: string; label: string; kind: "select"; options: string[] };

const COMP_META: Record<
  string,
  { label: string; sub: string; fields: CompField[]; summary: (d: Record<string, any>) => string }
> = {
  fixed_fee: {
    label: "Fixed Fee",
    sub: "50% up-front, 50% upon completion",
    fields: [{ key: "amount", label: "Total fee (USD)", kind: "number", placeholder: "e.g. 20000" }],
    summary: (d) => `$${fmt(d.amount)} · 50% up-front / 50% on completion`,
  },
  fixed_hours: {
    label: "Fixed Hours Sold",
    sub: "Set hours, paid on a schedule",
    fields: [
      { key: "hours", label: "Hours sold", kind: "number", placeholder: "e.g. 160" },
      { key: "rate", label: "Hourly rate (USD)", kind: "number", placeholder: "e.g. 150" },
      { key: "frequency", label: "Payout frequency", kind: "select", options: ["weekly", "bi-monthly", "monthly"] },
    ],
    summary: (d) => `${fmt(d.hours)} hrs @ $${fmt(d.rate)}/hr · paid ${d.frequency || "—"}`,
  },
  time_materials: {
    label: "Time & Materials",
    sub: "Hours logged & submitted for payment",
    fields: [{ key: "rate", label: "Hourly rate (USD)", kind: "number", placeholder: "e.g. 175" }],
    summary: (d) => `$${fmt(d.rate)}/hr · logged & submitted`,
  },
  success_fee: {
    label: "Success Fee",
    sub: "Lump sum for an approved final deliverable",
    fields: [
      { key: "amount", label: "Success fee (USD)", kind: "number", placeholder: "e.g. 50000" },
      { key: "deliverable", label: "Approved deliverable", kind: "text", placeholder: "What triggers payment" },
    ],
    summary: (d) => `$${fmt(d.amount)} on approval of: ${d.deliverable || "—"}`,
  },
};
const COMP_ORDER = ["fixed_fee", "fixed_hours", "time_materials", "success_fee"] as const;

function fmt(v: unknown): string {
  if (v == null || v === "") return "—";
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString() : String(v);
}

export function ActiveClientEngagements({ vendorId }: { vendorId: string }) {
  const utils = trpc.useUtils();
  const engagements = trpc.vendor.adminGetEngagements.useQuery({ id: vendorId });
  const setAssignment = trpc.vendor.adminSetAssignment.useMutation({
    onSuccess: () => utils.vendor.adminGetEngagements.invalidate({ id: vendorId }),
    onError: (e) => toast.error(e.message || "Could not update assignment."),
  });

  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [compFor, setCompFor] = useState<{ vendorProjectId: number; projectName: string } | null>(null);

  const clients = engagements.data?.clients ?? [];

  // Auto-expand clients that already have an assigned project for this vendor.
  useEffect(() => {
    if (!engagements.data) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const c of engagements.data.clients) if (c.projects.some((p) => p.assigned)) next.add(c.id);
      return next;
    });
  }, [engagements.data]);

  // Comps for the open dialog, taken from the latest query data.
  const dialogComps = useMemo<CompLine[]>(() => {
    if (!compFor) return [];
    for (const c of clients) {
      const proj = c.projects.find((p) => p.vendorProjectId === compFor.vendorProjectId);
      if (proj) return proj.comps as CompLine[];
    }
    return [];
  }, [compFor, clients]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Active Client Engagements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {engagements.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : clients.length === 0 ? (
          <p className="text-sm text-black/55">
            No active clients yet. Add clients and projects in the{" "}
            <a href="/admin/clients" className="font-medium text-[#0A65FF] hover:underline">
              Clients &amp; Projects
            </a>{" "}
            manager.
          </p>
        ) : (
          clients.map((client) => {
            const open = expanded.has(client.id);
            const assignedCount = client.projects.filter((p) => p.assigned).length;
            return (
              <div key={client.id} className="rounded-lg border border-black/10">
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      next.has(client.id) ? next.delete(client.id) : next.add(client.id);
                      return next;
                    })
                  }
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
                >
                  {open ? <ChevronDown className="h-4 w-4 text-black/45" /> : <ChevronRight className="h-4 w-4 text-black/45" />}
                  <Checkbox checked={open} className="pointer-events-none" />
                  <span className="font-medium">{client.name}</span>
                  {client.ndaWall ? (
                    <Badge
                      className="ml-1 gap-1 bg-amber-100 font-normal text-amber-800 hover:bg-amber-100"
                      title="This client requires a tri-party (Client · Digital Therapy · Vendor) NDA from every vendor who touches their PII."
                    >
                      <ShieldCheck className="h-3 w-3" />
                      NDA Wall
                    </Badge>
                  ) : null}
                  {assignedCount > 0 ? (
                    <Badge variant="secondary" className="ml-1 font-normal">
                      {assignedCount} project{assignedCount === 1 ? "" : "s"}
                    </Badge>
                  ) : null}
                </button>

                {open ? (
                  <div className="space-y-1 border-t border-black/8 px-3 py-2">
                    {client.projects.length === 0 ? (
                      <p className="py-1 text-xs text-black/45">No active projects for this client.</p>
                    ) : (
                      client.projects.map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-3 py-1.5">
                          <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <Checkbox
                              checked={p.assigned}
                              onCheckedChange={() =>
                                setAssignment.mutate({ id: vendorId, projectId: p.id, assigned: !p.assigned })
                              }
                            />
                            <span>{p.name}</span>
                          </label>
                          {p.assigned && p.vendorProjectId != null ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCompFor({ vendorProjectId: p.vendorProjectId!, projectName: p.name })}
                            >
                              <Receipt className="mr-1.5 h-3.5 w-3.5" />
                              View Details{p.comps.length ? ` (${p.comps.length})` : ""}
                            </Button>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </CardContent>

      {compFor ? (
        <CompensationDialog
          vendorProjectId={compFor.vendorProjectId}
          projectName={compFor.projectName}
          comps={dialogComps}
          open
          onOpenChange={(o) => !o && setCompFor(null)}
          onChanged={() => utils.vendor.adminGetEngagements.invalidate({ id: vendorId })}
        />
      ) : null}
    </Card>
  );
}

function CompensationDialog({
  vendorProjectId,
  projectName,
  comps,
  open,
  onOpenChange,
  onChanged,
}: {
  vendorProjectId: number;
  projectName: string;
  comps: CompLine[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<(typeof COMP_ORDER)[number]>("fixed_fee");
  const [details, setDetails] = useState<Record<string, string>>({});

  const addComp = trpc.vendor.adminAddComp.useMutation({
    onSuccess: () => {
      onChanged();
      setAdding(false);
      setDetails({});
      toast.success("Compensation added.");
    },
    onError: (e) => toast.error(e.message || "Could not add compensation."),
  });
  const removeComp = trpc.vendor.adminRemoveComp.useMutation({
    onSuccess: () => onChanged(),
    onError: (e) => toast.error(e.message || "Could not remove."),
  });

  const meta = COMP_META[type];
  const save = () => {
    const payload: Record<string, unknown> = {};
    for (const f of meta.fields) {
      const raw = details[f.key];
      payload[f.key] = f.kind === "number" ? (raw === "" || raw == null ? null : Number(raw)) : raw ?? "";
    }
    addComp.mutate({ vendorProjectId, type, details: payload });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compensation — {projectName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {comps.length === 0 ? (
            <p className="text-sm text-black/55">No compensation arrangements recorded yet.</p>
          ) : (
            comps.map((c) => {
              const m = COMP_META[c.type];
              return (
                <div key={c.id} className="flex items-start justify-between gap-3 rounded-lg border border-black/10 p-3">
                  <div>
                    <div className="text-sm font-semibold">{m?.label ?? c.type}</div>
                    <div className="text-xs text-black/60">{m ? m.summary(c.details) : ""}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeComp.mutate({ id: c.id })}
                    aria-label="Remove"
                    className="text-black/40 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {adding ? (
          <div className="space-y-3 rounded-lg border border-[#0A65FF]/20 bg-[#0A65FF]/5 p-3">
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as (typeof COMP_ORDER)[number]);
                setDetails({});
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMP_ORDER.map((t) => (
                  <SelectItem key={t} value={t}>
                    {COMP_META[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="-mt-1 text-xs text-black/55">{meta.sub}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              {meta.fields.map((f) => (
                <label key={f.key} className="flex flex-col gap-1.5 text-sm">
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-black/45">{f.label}</span>
                  {f.kind === "select" ? (
                    <Select value={details[f.key] ?? ""} onValueChange={(v) => setDetails((d) => ({ ...d, [f.key]: v }))}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {f.options.map((o) => (
                          <SelectItem key={o} value={o} className="capitalize">
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={details[f.key] ?? ""}
                      inputMode={f.kind === "number" ? "decimal" : "text"}
                      placeholder={f.placeholder}
                      onChange={(e) => setDetails((d) => ({ ...d, [f.key]: e.target.value }))}
                      className="h-10"
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={save} disabled={addComp.isPending}>
                Save compensation
              </Button>
              <Button variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setAdding(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add compensation
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
