/**
 * OpportunityDialog — create OR edit an opportunity with activity timeline +
 * close actions. When opportunityId is null, the dialog renders the create form;
 * once an id is present, it switches to the rich edit view (fields + activities
 * + Close-Won / Close-Lost / Delete).
 *
 * Close-Won mechanics: for kind="new_project" we call clients.createProject on
 * the linked client. For kind="new_client" we create the client first, then the
 * project. Either way, the resulting records show up on the Clients & Projects
 * tab automatically.
 */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Copy, Loader2, Phone, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  opportunityId: number | null;
  onOpenChange: (open: boolean) => void;
  /**
   * Pre-open one of the close confirmation panels when the dialog mounts.
   * Used when the admin drags an opportunity onto the Closed-Won / Closed-Lost
   * kanban column or picks a closed stage from the row dropdown — the dialog
   * opens straight on the correct prompt so the contracted-value (won) or loss
   * reason (lost) is captured instead of silently flipping stage.
   */
  initialAction?: "confirm_won" | "confirm_lost";
};

type Kind = "new_project" | "new_client";

const ACTIVITY_KIND_LABELS: Record<string, string> = {
  note: "Note",
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  stage_change: "Stage change",
  system: "System",
};

function dollarsToCents(s: string): number | null {
  const cleaned = s.replace(/[$,\s]/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function centsToDollars(cents: number | null): string {
  if (cents == null) return "";
  return String(Math.round(cents / 100));
}

export default function OpportunityDialog({ opportunityId, onOpenChange, initialAction }: Props) {
  if (opportunityId == null) return <CreateDialog onOpenChange={onOpenChange} />;
  return <EditDialog opportunityId={opportunityId} onOpenChange={onOpenChange} initialAction={initialAction} />;
}

// ── Create ───────────────────────────────────────────────────────────────────

function CreateDialog({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const utils = trpc.useUtils();
  const clientsQuery = trpc.clients.list.useQuery();
  const createMutation = trpc.pipeline.create.useMutation({
    onSuccess: () => {
      utils.pipeline.list.invalidate();
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message || "Could not create opportunity."),
  });

  const [kind, setKind] = useState<Kind>("new_project");
  const [clientId, setClientId] = useState<number | "">("");
  const [prospectCompany, setProspectCompany] = useState("");
  const [prospectName, setProspectName] = useState("");
  const [prospectEmail, setProspectEmail] = useState("");
  const [prospectPhone, setProspectPhone] = useState("");
  const [prospectSource, setProspectSource] = useState("");
  const [title, setTitle] = useState("");
  const [estValue, setEstValue] = useState("");
  const [estRecurringValue, setEstRecurringValue] = useState("");
  const [estRecurringCadence, setEstRecurringCadence] = useState<"" | "monthly" | "quarterly" | "bi_annually" | "annually">("");
  const [estCloseDate, setEstCloseDate] = useState("");
  const [probability, setProbability] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [nextStepDue, setNextStepDue] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit =
    title.trim().length >= 2 &&
    (kind === "new_project" ? clientId !== "" : prospectCompany.trim().length >= 2 || prospectName.trim().length >= 2);

  const submit = () => {
    if (!canSubmit) return;
    createMutation.mutate({
      kind,
      title: title.trim(),
      clientId: kind === "new_project" ? Number(clientId) : null,
      prospectName: kind === "new_client" ? prospectName.trim() || undefined : undefined,
      prospectCompany: kind === "new_client" ? prospectCompany.trim() || undefined : undefined,
      prospectEmail: kind === "new_client" ? prospectEmail.trim() || undefined : undefined,
      prospectPhone: kind === "new_client" ? prospectPhone.trim() || undefined : undefined,
      prospectSource: kind === "new_client" ? prospectSource.trim() || undefined : undefined,
      estValueCents: dollarsToCents(estValue),
      estRecurringValueCents: dollarsToCents(estRecurringValue),
      estRecurringCadence: estRecurringCadence || null,
      estCloseDate: estCloseDate || undefined,
      probabilityPct: probability ? Math.min(100, Math.max(0, Number(probability))) : null,
      nextStep: nextStep.trim() || undefined,
      nextStepDue: nextStepDue || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New opportunity</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-2">
          {/* Kind selector */}
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { value: "new_project", title: "New project", subtitle: "Existing client, new scope" },
                { value: "new_client", title: "New client", subtitle: "Prospect → paying client" },
              ] as const
            ).map((opt) => {
              const active = kind === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setKind(opt.value)}
                  className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-colors ${
                    active
                      ? "border-[#0A65FF] bg-[#0A65FF]/5 text-[#111111]"
                      : "border-black/10 bg-white text-black/70 hover:border-black/25"
                  }`}
                >
                  <span className="text-sm font-semibold">{opt.title}</span>
                  <span className="text-xs text-black/55">{opt.subtitle}</span>
                </button>
              );
            })}
          </div>

          {/* Conditional: existing client OR prospect fields */}
          {kind === "new_project" ? (
            <div className="flex flex-col gap-2">
              <Label>Existing client</Label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value === "" ? "" : Number(e.target.value))}
                className="h-10 rounded-md border border-black/15 bg-white px-3 text-sm focus:border-[#0A65FF] focus:outline-none"
              >
                <option value="">Select a client…</option>
                {(clientsQuery.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Prospect company">
                <Input value={prospectCompany} onChange={(e) => setProspectCompany(e.target.value)} placeholder="Acme Family Office" />
              </Field>
              <Field label="Contact name">
                <Input value={prospectName} onChange={(e) => setProspectName(e.target.value)} />
              </Field>
              <Field label="Contact email">
                <Input type="email" value={prospectEmail} onChange={(e) => setProspectEmail(e.target.value)} />
              </Field>
              <Field label="Contact phone">
                <Input value={prospectPhone} onChange={(e) => setProspectPhone(e.target.value)} />
              </Field>
              <Field label="Source" className="sm:col-span-2">
                <Input
                  value={prospectSource}
                  onChange={(e) => setProspectSource(e.target.value)}
                  placeholder="Referral, inbound, vendor intro, conference…"
                />
              </Field>
            </div>
          )}

          {/* Title + financials */}
          <Field label="Opportunity title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="DT Brain pilot — Q4, Discovery + Warehouse, etc."
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Est. value ($)">
              <Input value={estValue} onChange={(e) => setEstValue(e.target.value)} placeholder="125000" inputMode="numeric" />
            </Field>
            <Field label="Est. close date">
              <Input type="date" value={estCloseDate} onChange={(e) => setEstCloseDate(e.target.value)} />
            </Field>
            <Field label="Probability %">
              <Input value={probability} onChange={(e) => setProbability(e.target.value)} placeholder="50" inputMode="numeric" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Est. recurring value ($)">
              <Input
                value={estRecurringValue}
                onChange={(e) => setEstRecurringValue(e.target.value)}
                placeholder="5000"
                inputMode="numeric"
              />
            </Field>
            <Field label="Recurring cadence">
              <select
                value={estRecurringCadence}
                onChange={(e) =>
                  setEstRecurringCadence(e.target.value as "" | "monthly" | "quarterly" | "bi_annually" | "annually")
                }
                className="h-10 rounded-md border border-black/15 bg-white px-3 text-sm focus:border-[#0A65FF] focus:outline-none"
              >
                <option value="">—</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="bi_annually">Bi-Annually</option>
                <option value="annually">Annually</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Next step">
              <Input
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                placeholder="Send scope draft, schedule call…"
              />
            </Field>
            <Field label="Due by">
              <Input type="date" value={nextStepDue} onChange={(e) => setNextStepDue(e.target.value)} />
            </Field>
          </div>

          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Background, key decision-makers, anything to remember." />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!canSubmit || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Create opportunity
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit ────────────────────────────────────────────────────────────────────

function EditDialog({
  opportunityId,
  onOpenChange,
  initialAction,
}: {
  opportunityId: number;
  onOpenChange: (open: boolean) => void;
  initialAction?: "confirm_won" | "confirm_lost";
}) {
  const utils = trpc.useUtils();
  const oppQuery = trpc.pipeline.get.useQuery({ id: opportunityId });
  const updateMutation = trpc.pipeline.update.useMutation({
    onSuccess: () => {
      utils.pipeline.list.invalidate();
      utils.pipeline.get.invalidate({ id: opportunityId });
    },
    onError: (e) => toast.error(e.message || "Could not save."),
  });
  const addActivityMutation = trpc.pipeline.addActivity.useMutation({
    onSuccess: () => {
      utils.pipeline.get.invalidate({ id: opportunityId });
      utils.pipeline.list.invalidate();
    },
  });
  const closeWonMutation = trpc.pipeline.closeWon.useMutation({
    onSuccess: () => {
      utils.pipeline.list.invalidate();
      utils.pipeline.get.invalidate({ id: opportunityId });
      utils.clients.list.invalidate();
      toast.success("Closed-won — project created on Clients & Projects.");
    },
    onError: (e) => toast.error(e.message || "Close-won failed."),
  });
  const closeLostMutation = trpc.pipeline.closeLost.useMutation({
    onSuccess: () => {
      utils.pipeline.list.invalidate();
      utils.pipeline.get.invalidate({ id: opportunityId });
    },
  });
  const removeMutation = trpc.pipeline.remove.useMutation({
    onSuccess: () => {
      utils.pipeline.list.invalidate();
      onOpenChange(false);
    },
  });
  const clientsQuery = trpc.clients.list.useQuery();
  const duplicateMutation = trpc.pipeline.duplicate.useMutation({
    onSuccess: () => {
      utils.pipeline.list.invalidate();
      toast.success("Opportunity duplicated — new one is in Intake.");
      onOpenChange(false);
    },
    onError: (e) => toast.error(e.message || "Could not duplicate."),
  });

  const opp = oppQuery.data;

  const [title, setTitle] = useState("");
  const [estValue, setEstValue] = useState("");
  const [estRecurringValue, setEstRecurringValue] = useState("");
  const [estRecurringCadence, setEstRecurringCadence] = useState<"" | "monthly" | "quarterly" | "bi_annually" | "annually">("");
  const [estCloseDate, setEstCloseDate] = useState("");
  const [probability, setProbability] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [nextStepDue, setNextStepDue] = useState("");
  const [notes, setNotes] = useState("");
  const [activityKind, setActivityKind] = useState<"note" | "call" | "email" | "meeting">("note");
  const [activityBody, setActivityBody] = useState("");

  // Close-won inline confirmation
  const [confirmingWon, setConfirmingWon] = useState(false);
  const [wonClientName, setWonClientName] = useState("");
  const [wonProjectName, setWonProjectName] = useState("");
  // Contracted deal values confirmed/overridden at close-won time. Dollars for
  // the UI; converted to cents on submit. Pre-filled from the estimate so the
  // common case ("deal closed at the number we quoted") is a single click.
  const [contractedValue, setContractedValue] = useState("");
  const [contractedRecurringValue, setContractedRecurringValue] = useState("");
  const [contractedRecurringCadence, setContractedRecurringCadence] = useState<
    "" | "monthly" | "quarterly" | "bi_annually" | "annually"
  >("");
  // Close-lost inline confirmation
  const [confirmingLost, setConfirmingLost] = useState(false);
  const [lossReason, setLossReason] = useState("");
  // Duplicate inline confirmation
  const [confirmingDuplicate, setConfirmingDuplicate] = useState(false);
  const [dupKind, setDupKind] = useState<"new_project" | "new_client">("new_project");
  const [dupClientId, setDupClientId] = useState<number | "">("");
  const [dupProspectCompany, setDupProspectCompany] = useState("");
  const [dupProspectName, setDupProspectName] = useState("");
  const [dupProspectEmail, setDupProspectEmail] = useState("");
  const [dupTitle, setDupTitle] = useState("");

  useEffect(() => {
    if (!opp) return;
    setTitle(opp.title);
    setEstValue(centsToDollars(opp.estValueCents));
    setEstRecurringValue(centsToDollars(opp.estRecurringValueCents));
    setEstRecurringCadence(opp.estRecurringCadence ?? "");
    setEstCloseDate(opp.estCloseDate ?? "");
    setProbability(opp.probabilityPct == null ? "" : String(opp.probabilityPct));
    setNextStep(opp.nextStep ?? "");
    setNextStepDue(opp.nextStepDue ?? "");
    setNotes(opp.notes ?? "");
    setWonClientName(opp.prospectCompany ?? opp.prospectName ?? "");
    setWonProjectName(opp.title);
    // Seed contracted values from whatever is already on record: the previously
    // captured contracted amount if the deal has been closed-won once (edge
    // case: re-closing after an open), otherwise the current estimate. Either
    // way the admin lands on a sensible default to confirm or override.
    setContractedValue(centsToDollars(opp.contractedValueCents ?? opp.estValueCents));
    setContractedRecurringValue(
      centsToDollars(opp.contractedRecurringValueCents ?? opp.estRecurringValueCents),
    );
    setContractedRecurringCadence(
      opp.contractedRecurringCadence ?? opp.estRecurringCadence ?? "",
    );
  }, [opp]);

  // When the parent opens the dialog with a pre-staged action (kanban drag or
  // row dropdown routed to a closed stage), open the matching confirmation
  // panel as soon as the opp data is loaded. Only runs for not-yet-closed
  // opportunities so a re-opened closed deal doesn't blow past its existing
  // state.
  useEffect(() => {
    if (!opp || !initialAction) return;
    if (opp.stage === "closed_won" || opp.stage === "closed_lost") return;
    if (initialAction === "confirm_won") setConfirmingWon(true);
    if (initialAction === "confirm_lost") setConfirmingLost(true);
    // Only react to the initial action once per opp — ignore later re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opp?.id, initialAction]);

  const isClosed = opp?.stage === "closed_won" || opp?.stage === "closed_lost";

  type UpdateInput = Parameters<typeof updateMutation.mutate>[0];
  type UpdatePatch = Omit<UpdateInput, "id">;
  const saveField = (patch: UpdatePatch) => {
    updateMutation.mutate({ id: opportunityId, ...patch } as UpdateInput);
  };

  const addActivity = () => {
    if (!activityBody.trim()) return;
    addActivityMutation.mutate({ opportunityId, kind: activityKind, body: activityBody.trim() }, {
      onSuccess: () => setActivityBody(""),
    });
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{opp?.title ?? "Opportunity"}</DialogTitle>
        </DialogHeader>

        {!opp ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <div className="flex flex-col gap-6 pt-2">
            {/* Header strip: kind + party */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-black/[0.03] p-3 text-sm">
              <span
                className={`rounded px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide ${
                  opp.kind === "new_project" ? "bg-[#0A65FF]/10 text-[#0040c9]" : "bg-[#a35d00]/10 text-[#a35d00]"
                }`}
              >
                {opp.kind === "new_project" ? "Existing client" : "Prospect"}
              </span>
              <span className="font-medium text-[#111111]">
                {opp.kind === "new_project"
                  ? opp.clientName ?? "(unset client)"
                  : opp.prospectCompany || opp.prospectName || "(unnamed prospect)"}
              </span>
              {opp.prospectEmail && (
                <a className="ml-auto text-xs text-black/55 hover:text-[#0A65FF]" href={`mailto:${opp.prospectEmail}`}>
                  {opp.prospectEmail}
                </a>
              )}
              {opp.prospectPhone && (
                <span className="inline-flex items-center gap-1 text-xs text-black/55">
                  <Phone className="h-3 w-3" />
                  {opp.prospectPhone}
                </span>
              )}
              {isClosed && (
                <span className="ml-auto rounded-full bg-black/[0.08] px-2 py-0.5 text-xs text-black/65">
                  {opp.stage === "closed_won" ? "Closed-Won" : "Closed-Lost"}
                </span>
              )}
            </div>

            {/* Linked-after-close info */}
            {opp.resultingProjectId != null && (
              <div className="rounded-2xl border border-[#0A65FF]/20 bg-[#0A65FF]/5 p-3 text-sm text-[#0040c9]">
                <p>
                  Promoted to project <strong>{opp.resultingProjectName}</strong>
                  {opp.resultingClientName ? <> on <strong>{opp.resultingClientName}</strong></> : null}.
                </p>
                {opp.contractedValueCents != null && (
                  <p className="mt-1.5 text-xs text-[#0040c9]/85">
                    Contracted at{" "}
                    <strong>
                      ${(opp.contractedValueCents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </strong>
                    {opp.contractedRecurringValueCents != null && (
                      <>
                        {" "}
                        + ${(opp.contractedRecurringValueCents / 100).toLocaleString("en-US", {
                          maximumFractionDigits: 0,
                        })}{" "}
                        {opp.contractedRecurringCadence?.replace("_", "-") ?? "recurring"}
                      </>
                    )}
                    {opp.estValueCents != null && opp.estValueCents !== opp.contractedValueCents && (
                      <>
                        {" "}
                        <span className="text-[#0040c9]/60">
                          (estimated ${(opp.estValueCents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })})
                        </span>
                      </>
                    )}
                    .
                  </p>
                )}
              </div>
            )}

            {/* Editable fields */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Title" className="sm:col-span-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => title.trim() && title !== opp.title && saveField({ title: title.trim() })}
                  disabled={isClosed}
                />
              </Field>
              <Field label="Est. value ($)">
                <Input
                  value={estValue}
                  onChange={(e) => setEstValue(e.target.value)}
                  onBlur={() => {
                    const cents = dollarsToCents(estValue);
                    if (cents !== opp.estValueCents) saveField({ estValueCents: cents });
                  }}
                  inputMode="numeric"
                  disabled={isClosed}
                />
              </Field>
              <Field label="Est. recurring value ($)">
                <Input
                  value={estRecurringValue}
                  onChange={(e) => setEstRecurringValue(e.target.value)}
                  onBlur={() => {
                    const cents = dollarsToCents(estRecurringValue);
                    if (cents !== opp.estRecurringValueCents) saveField({ estRecurringValueCents: cents });
                  }}
                  inputMode="numeric"
                  disabled={isClosed}
                />
              </Field>
              <Field label="Recurring cadence">
                <select
                  value={estRecurringCadence}
                  onChange={(e) => {
                    const v = e.target.value as "" | "monthly" | "quarterly" | "bi_annually" | "annually";
                    setEstRecurringCadence(v);
                    if ((opp.estRecurringCadence ?? "") !== v) saveField({ estRecurringCadence: v || null });
                  }}
                  disabled={isClosed}
                  className="h-9 rounded-md border border-black/15 bg-white px-3 text-sm focus:border-[#0A65FF] focus:outline-none disabled:opacity-50"
                >
                  <option value="">—</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="bi_annually">Bi-Annually</option>
                  <option value="annually">Annually</option>
                </select>
              </Field>
              <Field label="Est. close date">
                <Input
                  type="date"
                  value={estCloseDate}
                  onChange={(e) => setEstCloseDate(e.target.value)}
                  onBlur={() => estCloseDate !== (opp.estCloseDate ?? "") && saveField({ estCloseDate })}
                  disabled={isClosed}
                />
              </Field>
              <Field label="Probability %">
                <Input
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                  onBlur={() => {
                    const n = probability ? Math.min(100, Math.max(0, Number(probability))) : null;
                    if (n !== opp.probabilityPct) saveField({ probabilityPct: n });
                  }}
                  inputMode="numeric"
                  disabled={isClosed}
                />
              </Field>
              <Field label="Owner email">
                <Input
                  defaultValue={opp.ownerEmail ?? ""}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v !== (opp.ownerEmail ?? "")) saveField({ ownerEmail: v });
                  }}
                  disabled={isClosed}
                />
              </Field>
              <Field label="Next step">
                <Input
                  value={nextStep}
                  onChange={(e) => setNextStep(e.target.value)}
                  onBlur={() => nextStep !== (opp.nextStep ?? "") && saveField({ nextStep })}
                  disabled={isClosed}
                />
              </Field>
              <Field label="Due by">
                <Input
                  type="date"
                  value={nextStepDue}
                  onChange={(e) => setNextStepDue(e.target.value)}
                  onBlur={() => nextStepDue !== (opp.nextStepDue ?? "") && saveField({ nextStepDue })}
                  disabled={isClosed}
                />
              </Field>
              <Field label="Notes" className="sm:col-span-2">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => notes !== (opp.notes ?? "") && saveField({ notes })}
                  rows={3}
                  disabled={isClosed}
                />
              </Field>
            </div>

            {/* Activity timeline */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#111111]">Activity</h3>
              {!isClosed && (
                <div className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-3 sm:flex-row sm:items-end">
                  <select
                    value={activityKind}
                    onChange={(e) => setActivityKind(e.target.value as typeof activityKind)}
                    className="h-9 rounded-md border border-black/15 bg-white px-2 text-sm sm:w-32"
                  >
                    <option value="note">Note</option>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                  </select>
                  <Input
                    value={activityBody}
                    onChange={(e) => setActivityBody(e.target.value)}
                    placeholder="What happened?"
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && addActivity()}
                  />
                  <Button onClick={addActivity} disabled={!activityBody.trim() || addActivityMutation.isPending}>
                    Add
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {opp.activities.length === 0 ? (
                  <p className="text-xs text-black/45">No activity yet.</p>
                ) : (
                  opp.activities.map((a) => (
                    <div key={a.id} className="flex flex-col rounded-xl border border-black/8 bg-white px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-black/45">
                        <span>{ACTIVITY_KIND_LABELS[a.kind] ?? a.kind}</span>
                        <span>·</span>
                        <span>
                          {new Date(a.occurredAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        {a.authorEmail && (
                          <>
                            <span>·</span>
                            <span>{a.authorEmail}</span>
                          </>
                        )}
                      </div>
                      {a.body && <p className="mt-1 text-sm text-black/80">{a.body}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action footer */}
            {!isClosed && (
              <div className="flex flex-col gap-3 border-t border-black/10 pt-4">
                {confirmingWon ? (
                  <div className="flex flex-col gap-3 rounded-2xl border border-[#0A65FF]/30 bg-[#0A65FF]/5 p-4">
                    <p className="text-sm font-medium text-[#111111]">
                      Promote to {opp.kind === "new_client" ? "client + project" : "project"}
                    </p>
                    {opp.kind === "new_client" && (
                      <Field label="Client name">
                        <Input value={wonClientName} onChange={(e) => setWonClientName(e.target.value)} />
                      </Field>
                    )}
                    <Field label="Project name">
                      <Input value={wonProjectName} onChange={(e) => setWonProjectName(e.target.value)} />
                    </Field>
                    <div className="border-t border-[#0A65FF]/15 pt-3">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#0040c9]">
                        Contracted deal value
                      </p>
                      <p className="mt-1 text-xs text-black/60">
                        Pre-filled from the estimate. Confirm or override to match the signed contract.
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Contracted value ($)">
                          <Input
                            value={contractedValue}
                            onChange={(e) => setContractedValue(e.target.value)}
                            placeholder={centsToDollars(opp.estValueCents) || "0"}
                            inputMode="numeric"
                          />
                        </Field>
                        <Field label="Contracted recurring value ($)">
                          <Input
                            value={contractedRecurringValue}
                            onChange={(e) => setContractedRecurringValue(e.target.value)}
                            placeholder={centsToDollars(opp.estRecurringValueCents) || "0"}
                            inputMode="numeric"
                          />
                        </Field>
                        <Field label="Recurring cadence" className="sm:col-span-2">
                          <select
                            value={contractedRecurringCadence}
                            onChange={(e) =>
                              setContractedRecurringCadence(
                                e.target.value as "" | "monthly" | "quarterly" | "bi_annually" | "annually",
                              )
                            }
                            className="h-10 rounded-md border border-black/15 bg-white px-3 text-sm focus:border-[#0A65FF] focus:outline-none"
                          >
                            <option value="">—</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="bi_annually">Bi-Annually</option>
                            <option value="annually">Annually</option>
                          </select>
                        </Field>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setConfirmingWon(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          const contractedCents = dollarsToCents(contractedValue);
                          const contractedRecurringCents = dollarsToCents(contractedRecurringValue);
                          closeWonMutation.mutate(
                            {
                              id: opportunityId,
                              projectName: wonProjectName.trim() || undefined,
                              clientName:
                                opp.kind === "new_client" ? wonClientName.trim() || undefined : undefined,
                              // Explicit null when the field was cleared, so the
                              // DB column is actually blanked instead of silently
                              // falling back to the estimate on the server.
                              contractedValueCents: contractedValue.trim() === "" ? null : contractedCents,
                              contractedRecurringValueCents:
                                contractedRecurringValue.trim() === "" ? null : contractedRecurringCents,
                              contractedRecurringCadence:
                                contractedRecurringCadence === "" ? null : contractedRecurringCadence,
                            },
                            { onSuccess: () => setConfirmingWon(false) },
                          );
                        }}
                        disabled={
                          closeWonMutation.isPending ||
                          !wonProjectName.trim() ||
                          (opp.kind === "new_client" && !wonClientName.trim()) ||
                          // Must have a valid contracted value when the field has content.
                          (contractedValue.trim() !== "" && dollarsToCents(contractedValue) == null)
                        }
                      >
                        {closeWonMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        Confirm close-won
                      </Button>
                    </div>
                  </div>
                ) : confirmingLost ? (
                  <div className="flex flex-col gap-3 rounded-2xl border border-black/15 bg-white p-4">
                    <p className="text-sm font-medium text-[#111111]">Close-lost — what happened?</p>
                    <Textarea
                      value={lossReason}
                      onChange={(e) => setLossReason(e.target.value)}
                      rows={3}
                      placeholder="Lost to competitor X, budget cut, timing, no decision…"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setConfirmingLost(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          closeLostMutation.mutate(
                            { id: opportunityId, reason: lossReason.trim() || undefined },
                            { onSuccess: () => setConfirmingLost(false) },
                          )
                        }
                        disabled={closeLostMutation.isPending}
                      >
                        Confirm close-lost
                      </Button>
                    </div>
                  </div>
                ) : confirmingDuplicate ? (
                  <div className="flex flex-col gap-3 rounded-2xl border border-[#0A65FF]/30 bg-[#0A65FF]/5 p-4">
                    <p className="text-sm font-medium text-[#111111]">Duplicate this opportunity for a new customer</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { value: "new_project", label: "Existing client" },
                          { value: "new_client", label: "New prospect" },
                        ] as const
                      ).map((opt) => {
                        const active = dupKind === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setDupKind(opt.value)}
                            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                              active
                                ? "border-[#0A65FF] bg-[#0A65FF] text-white"
                                : "border-black/15 bg-white text-black/75 hover:border-black/30"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    {dupKind === "new_project" ? (
                      <Field label="Existing client">
                        <select
                          value={dupClientId}
                          onChange={(e) => setDupClientId(e.target.value === "" ? "" : Number(e.target.value))}
                          className="h-10 rounded-md border border-black/15 bg-white px-3 text-sm focus:border-[#0A65FF] focus:outline-none"
                        >
                          <option value="">Select a client…</option>
                          {(clientsQuery.data ?? []).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Prospect company">
                          <Input value={dupProspectCompany} onChange={(e) => setDupProspectCompany(e.target.value)} />
                        </Field>
                        <Field label="Contact name">
                          <Input value={dupProspectName} onChange={(e) => setDupProspectName(e.target.value)} />
                        </Field>
                        <Field label="Contact email">
                          <Input type="email" value={dupProspectEmail} onChange={(e) => setDupProspectEmail(e.target.value)} />
                        </Field>
                      </div>
                    )}
                    <Field label="Title (optional — leave blank to keep current)">
                      <Input value={dupTitle} onChange={(e) => setDupTitle(e.target.value)} placeholder={opp.title} />
                    </Field>
                    <p className="text-xs text-black/55">
                      Copies title, value, close date, probability, next step, owner, and notes. Stage resets to Intake.
                      Activity history is not copied.
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setConfirmingDuplicate(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() =>
                          duplicateMutation.mutate({
                            sourceId: opportunityId,
                            kind: dupKind,
                            clientId: dupKind === "new_project" ? (dupClientId === "" ? null : Number(dupClientId)) : null,
                            prospectCompany:
                              dupKind === "new_client" ? dupProspectCompany.trim() || undefined : undefined,
                            prospectName:
                              dupKind === "new_client" ? dupProspectName.trim() || undefined : undefined,
                            prospectEmail:
                              dupKind === "new_client" ? dupProspectEmail.trim() || undefined : undefined,
                            title: dupTitle.trim() || undefined,
                          })
                        }
                        disabled={
                          duplicateMutation.isPending ||
                          (dupKind === "new_project" && dupClientId === "") ||
                          (dupKind === "new_client" && dupProspectCompany.trim().length < 2 && dupProspectName.trim().length < 2)
                        }
                      >
                        {duplicateMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        Duplicate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this opportunity? This cannot be undone.")) {
                          removeMutation.mutate({ id: opportunityId });
                        }
                      }}
                      className="text-[#c83a3a] hover:bg-[#c83a3a]/8 hover:text-[#c83a3a]"
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" />
                      Delete
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDupKind(opp.kind);
                          setDupClientId(opp.clientId ?? "");
                          setDupProspectCompany("");
                          setDupProspectName("");
                          setDupProspectEmail("");
                          setDupTitle("");
                          setConfirmingDuplicate(true);
                        }}
                      >
                        <Copy className="mr-1.5 h-4 w-4" />
                        Duplicate
                      </Button>
                      <Button variant="outline" onClick={() => setConfirmingLost(true)}>
                        <XCircle className="mr-1.5 h-4 w-4" />
                        Close-lost
                      </Button>
                      <Button onClick={() => setConfirmingWon(true)}>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        Close-won
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isClosed && opp.lossReason && (
              <div className="rounded-2xl border border-black/10 bg-white p-3 text-sm">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-black/55">Loss reason</p>
                <p className="mt-1 text-black/75">{opp.lossReason}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-black/55">{label}</span>
      {children}
    </label>
  );
}
