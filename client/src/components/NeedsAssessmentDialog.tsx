/**
 * NeedsAssessmentDialog — Outsourced Accounting / Bookkeeping intake form.
 *
 * Collects family-office profile, scale, composition, current systems, close
 * cadence, team composition, and goals. Submitting persists to dt_site and
 * emails Karina the formatted assessment immediately.
 */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input as InputBase } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

// Local Input that defaults to a white background so text fields visually
// match the white radio/checkbox pills used throughout this form.
function Input({ className, ...props }: ComponentProps<typeof InputBase>) {
  return <InputBase {...props} className={cn("bg-white", className)} />;
}
import { CheckCircle2, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ─── Question option sets ───────────────────────────────────────────────────

const REVENUE_OPTIONS = ["$10M – $24M", "$25M – $49M", "$50M – $249M", "$250M – $499M", "$500M+"];
const BACK_OFFICE_OPTIONS = ["1", "2 – 5", "6 – 10", "11 – 29", "30 – 49", "50+"];
const ENTITY_COUNT_OPTIONS = ["1 – 10", "11 – 24", "25 – 49", "50 – 99", "100 – 199", "200 – 499", "500+"];
const OPERATING_BIZ_OPTIONS = ["Yes", "No"];

const YES_NO_OPTIONS = ["Yes", "No"];

const JURISDICTION_OPTIONS = ["US Single State", "US Multi-State", "Non-US"];

const GENERAL_LEDGER_OPTIONS = [
  "QuickBooks",
  "Xero",
  "Excel",
  "Custom",
  "Other",
];

const BILL_PAY_OPTIONS = [
  "Bill.com",
  "Ramp",
  "Brex",
  "Concur",
  "Custom",
  "Other",
];

const ERP_PLATFORM_OPTIONS = ["NetSuite", "Sage Intacct", "SAP", "Microsoft Dynamics", "Other"];

const PAYROLL_OPTIONS = [
  "Gusto",
  "ADP",
  "Paychex",
  "Paylocity",
  "In-House",
  "Custom",
  "Other",
];

const BILL_VOLUME_OPTIONS = ["Under 50", "50 – 200", "200 – 500", "500 – 1,000", "1,000+"];
const ACCOUNTS_OPTIONS = ["Under 10", "10 – 50", "50 – 100", "100 – 250", "250+"];
const PAYROLL_HEADCOUNT_OPTIONS = ["0", "1 – 10", "11 – 25", "26 – 50", "51 – 100", "100+"];

const PRIMARY_GOAL_OPTIONS = [
  "Reduce cost",
  "Faster month-end close",
  "Better / more reliable reporting",
  "Standardize across entities",
  "Free up internal team for strategic work",
  "Prepare for audit",
  "Prepare for sale / liquidity event",
  "Generational transfer readiness",
  "Improve controls / risk posture",
];

const TIMELINE_OPTIONS = ["Exploring options", "Need help ASAP"];

const HQ_LOCATION_OPTIONS = ["In the US", "Outside the US"];

// ─── State type ─────────────────────────────────────────────────────────────

type FormState = {
  familyOfficeName: string;
  contactName: string;
  contactRole: string;
  websiteUrl: string;
  extraWebsiteUrls: string[];
  contactEmail: string;
  contactPhone: string;
  hqLocation: string;
  annualRevenue: string;
  backOfficeSize: string;
  entityCount: string;
  operatingBusinesses: string;
  owns501c3: string;
  jurisdictions: string[];
  generalLedgerSystems: string[];
  generalLedgerSystemOther: string;
  billPaySystems: string[];
  billPaySystemOther: string;
  usesErp: string;
  erpPlatforms: string[];
  erpPlatformOther: string;
  payrollSystems: string[];
  payrollSystemOther: string;
  monthEndCloseTimeline: string;
  monthlyBillVolume: string;
  accountsToReconcile: string;
  payrollHeadcount: string;
  painPoints: string;
  primaryGoals: string[];
  timeline: string;
};

const EMPTY_STATE: FormState = {
  familyOfficeName: "",
  contactName: "",
  contactRole: "",
  websiteUrl: "",
  extraWebsiteUrls: [],
  contactEmail: "",
  contactPhone: "",
  hqLocation: "",
  annualRevenue: "",
  backOfficeSize: "",
  entityCount: "",
  operatingBusinesses: "",
  owns501c3: "",
  jurisdictions: [],
  generalLedgerSystems: [],
  generalLedgerSystemOther: "",
  billPaySystems: [],
  billPaySystemOther: "",
  usesErp: "",
  erpPlatforms: [],
  erpPlatformOther: "",
  payrollSystems: [],
  payrollSystemOther: "",
  monthEndCloseTimeline: "",
  monthlyBillVolume: "",
  accountsToReconcile: "",
  payrollHeadcount: "",
  painPoints: "",
  primaryGoals: [],
  timeline: "",
};

export default function NeedsAssessmentDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_STATE);
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.assessments.submitAccounting.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Assessment received — we'll be in touch within one business day.");
    },
    onError: (e) => toast.error(e.message || "Could not submit. Please try again or email hello@digitaltherapy.io."),
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const toggle = <K extends keyof FormState>(key: K, value: string) =>
    setForm((f) => {
      const list = f[key] as unknown as string[];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...f, [key]: next as FormState[K] };
    });

  const canSubmit =
    form.familyOfficeName.trim().length >= 2 &&
    form.contactName.trim().length >= 2 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contactEmail.trim());

  const submit = () => {
    if (!canSubmit) return;
    submitMutation.mutate({
      familyOfficeName: form.familyOfficeName.trim(),
      contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim(),
      contactRole: form.contactRole.trim() || undefined,
      websiteUrl: form.websiteUrl.trim() || undefined,
      additionalWebsites: form.extraWebsiteUrls.map((u) => u.trim()).filter(Boolean).length
        ? form.extraWebsiteUrls.map((u) => u.trim()).filter(Boolean)
        : undefined,
      contactPhone: form.contactPhone.trim() || undefined,
      hqLocation: form.hqLocation || undefined,
      annualRevenue: form.annualRevenue || undefined,
      backOfficeSize: form.backOfficeSize || undefined,
      entityCount: form.entityCount || undefined,
      operatingBusinesses: form.operatingBusinesses || undefined,
      owns501c3: form.owns501c3 || undefined,
      jurisdictions: form.jurisdictions.length ? form.jurisdictions : undefined,
      generalLedgerSystems: form.generalLedgerSystems.length ? form.generalLedgerSystems : undefined,
      generalLedgerSystemOther:
        form.generalLedgerSystems.includes("Other") && form.generalLedgerSystemOther.trim()
          ? form.generalLedgerSystemOther.trim()
          : undefined,
      billPaySystems: form.billPaySystems.length ? form.billPaySystems : undefined,
      billPaySystemOther:
        form.billPaySystems.includes("Other") && form.billPaySystemOther.trim()
          ? form.billPaySystemOther.trim()
          : undefined,
      usesErp: form.usesErp || undefined,
      erpPlatforms:
        form.usesErp === "Yes" && form.erpPlatforms.length ? form.erpPlatforms : undefined,
      erpPlatformOther:
        form.usesErp === "Yes" &&
        form.erpPlatforms.includes("Other") &&
        form.erpPlatformOther.trim()
          ? form.erpPlatformOther.trim()
          : undefined,
      payrollSystems: form.payrollSystems.length ? form.payrollSystems : undefined,
      payrollSystemOther:
        form.payrollSystems.includes("Other") && form.payrollSystemOther.trim()
          ? form.payrollSystemOther.trim()
          : undefined,
      monthEndCloseTimeline: form.monthEndCloseTimeline || undefined,
      monthlyBillVolume: form.monthlyBillVolume || undefined,
      accountsToReconcile: form.accountsToReconcile || undefined,
      payrollHeadcount: form.payrollHeadcount || undefined,
      painPoints: form.painPoints.trim() || undefined,
      primaryGoals: form.primaryGoals.length ? form.primaryGoals : undefined,
      timeline: form.timeline || undefined,
      sourcePage: "/get-started",
    });
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setSubmitted(false);
      setForm(EMPTY_STATE);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-[-0.03em]">
            Outsourced Accounting / Bookkeeping — Needs Assessment
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <SuccessState onClose={() => handleOpenChange(false)} />
        ) : (
          <div className="flex flex-col gap-7 pt-4">
            <p className="text-[16pt] leading-7 text-black/85">
              Take 5 – 10 minutes to walk us through your office. Only the family-office name, your name, and email
              are required — the rest helps us come back with sharper recommendations.
            </p>

            {/* Section A: Profile */}
            <Section title="About">
              <Grid>
                <RequiredField label="Name of Family Office">
                  <Input value={form.familyOfficeName} onChange={(e) => update("familyOfficeName", e.target.value)} />
                </RequiredField>
                <RequiredField label="Full Name">
                  <Input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
                </RequiredField>
                <Field label="Title">
                  <Input value={form.contactRole} onChange={(e) => update("contactRole", e.target.value)} />
                </Field>
                <Label className="flex flex-col items-start gap-[11px]">
                  <span className="flex w-full items-center justify-between gap-2 text-sm font-medium text-[#111111]">
                    <span>Website URL</span>
                    {form.extraWebsiteUrls.length < 2 && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          setForm((f) => ({ ...f, extraWebsiteUrls: [...f.extraWebsiteUrls, ""] }))
                        }
                        aria-label="Add another website URL"
                        title="Add another website URL"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#0A65FF] bg-[#0A65FF]/10 text-[#0A65FF] transition-colors hover:bg-[#0A65FF] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF] focus-visible:ring-offset-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                  <Input
                    value={form.websiteUrl}
                    onChange={(e) => update("websiteUrl", e.target.value)}
                    placeholder="https://"
                  />
                </Label>
                {form.extraWebsiteUrls.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2">
                    {form.extraWebsiteUrls.map((url, i) => (
                      <Field key={i} label={`Additional Website URL`}>
                        <Input
                          value={url}
                          onChange={(e) =>
                            setForm((f) => {
                              const next = [...f.extraWebsiteUrls];
                              next[i] = e.target.value;
                              return { ...f, extraWebsiteUrls: next };
                            })
                          }
                          placeholder="https://"
                        />
                      </Field>
                    ))}
                  </div>
                )}
                <RequiredField label="Email">
                  <Input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
                </RequiredField>
                <Field label="Phone Number">
                  <Input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
                </Field>
                <div className="sm:col-span-2">
                  <RadioGroup
                    label="HQ — Are you based?"
                    options={HQ_LOCATION_OPTIONS}
                    value={form.hqLocation}
                    onChange={(v) => update("hqLocation", v)}
                  />
                </div>
              </Grid>
            </Section>

            {/* Section B: Scale */}
            <Section title="Scale & complexity">
              <RadioGroup
                label="Approximate annual revenue (across all entities)"
                options={REVENUE_OPTIONS}
                value={form.annualRevenue}
                onChange={(v) => update("annualRevenue", v)}
              />
              <RadioGroup
                label="Back-office team size"
                options={BACK_OFFICE_OPTIONS}
                value={form.backOfficeSize}
                onChange={(v) => update("backOfficeSize", v)}
              />
              <RadioGroup
                label="Number of entities"
                options={ENTITY_COUNT_OPTIONS}
                value={form.entityCount}
                onChange={(v) => update("entityCount", v)}
              />
              <RadioGroup
                label="Do you operate one or more businesses internally?"
                options={OPERATING_BIZ_OPTIONS}
                value={form.operatingBusinesses}
                onChange={(v) => update("operatingBusinesses", v)}
              />
            </Section>

            {/* Section C: Composition (header intentionally hidden) */}
            <Section>
              <RadioGroup
                label="Do you own a 501C3?"
                options={YES_NO_OPTIONS}
                value={form.owns501c3}
                onChange={(v) => update("owns501c3", v)}
              />
              <CheckboxGrid
                label="Jurisdictions"
                options={JURISDICTION_OPTIONS}
                values={form.jurisdictions}
                onToggle={(v) => toggle("jurisdictions", v)}
              />
            </Section>

            {/* Section D: Current systems */}
            <Section title="Current systems">
              <SystemPicker
                label="General ledger / accounting software"
                options={GENERAL_LEDGER_OPTIONS}
                values={form.generalLedgerSystems}
                onToggle={(v) => toggle("generalLedgerSystems", v)}
                otherValue={form.generalLedgerSystemOther}
                onOtherChange={(v) => update("generalLedgerSystemOther", v)}
              />
              <SystemPicker
                label="Bill pay / AP system"
                options={BILL_PAY_OPTIONS}
                values={form.billPaySystems}
                onToggle={(v) => toggle("billPaySystems", v)}
                otherValue={form.billPaySystemOther}
                onOtherChange={(v) => update("billPaySystemOther", v)}
              />
              <RadioGroup
                label="Do you currently leverage an ERP platform?"
                options={YES_NO_OPTIONS}
                value={form.usesErp}
                onChange={(v) => update("usesErp", v)}
              />
              {form.usesErp === "Yes" && (
                <SystemPicker
                  label="Which ERP platform?"
                  options={ERP_PLATFORM_OPTIONS}
                  values={form.erpPlatforms}
                  onToggle={(v) => toggle("erpPlatforms", v)}
                  otherValue={form.erpPlatformOther}
                  onOtherChange={(v) => update("erpPlatformOther", v)}
                />
              )}
              <SystemPicker
                label="Payroll provider"
                options={PAYROLL_OPTIONS}
                values={form.payrollSystems}
                onToggle={(v) => toggle("payrollSystems", v)}
                otherValue={form.payrollSystemOther}
                onOtherChange={(v) => update("payrollSystemOther", v)}
              />
              {form.payrollSystems.length > 0 && (
                <RadioGroup
                  label="Payroll headcount"
                  options={PAYROLL_HEADCOUNT_OPTIONS}
                  value={form.payrollHeadcount}
                  onChange={(v) => update("payrollHeadcount", v)}
                />
              )}
            </Section>

            {/* Section E: Close, reporting & volume */}
            <Section title="Close Cadence">
              <RadioGroup
                label="Are you satisfied with your current Month-End Close process & pace?"
                options={YES_NO_OPTIONS}
                value={form.monthEndCloseTimeline}
                onChange={(v) => update("monthEndCloseTimeline", v)}
              />
            </Section>

            <Section title="AP">
              <RadioGroup
                label="Approximate monthly bill / invoice volume"
                options={BILL_VOLUME_OPTIONS}
                value={form.monthlyBillVolume}
                onChange={(v) => update("monthlyBillVolume", v)}
              />
            </Section>

            <Section title="Reconciliation">
              <RadioGroup
                label="Bank, Investment & Credit Card accounts to reconcile"
                options={ACCOUNTS_OPTIONS}
                value={form.accountsToReconcile}
                onChange={(v) => update("accountsToReconcile", v)}
              />
            </Section>

            {/* Section G: Goals */}
            <Section title="Pain Points & Goals">
              <Field label="What is currently painful, slow, or broken in your accounting / bookkeeping function?">
                <Textarea
                  value={form.painPoints}
                  onChange={(e) => update("painPoints", e.target.value)}
                  rows={4}
                  placeholder="Be candid — close takes forever, reports are unreliable, one person knows everything, etc."
                />
              </Field>
              <CheckboxGrid
                label="Primary goals for this engagement"
                options={PRIMARY_GOAL_OPTIONS}
                values={form.primaryGoals}
                onToggle={(v) => toggle("primaryGoals", v)}
              />
              <RadioGroup
                label="Timeline / urgency"
                options={TIMELINE_OPTIONS}
                value={form.timeline}
                onChange={(v) => update("timeline", v)}
              />
            </Section>

            {/* Submit */}
            <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col gap-3 border-t border-black/10 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <p className="text-base text-black/80">
                We'll be in touch soon.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={submit}
                  disabled={!canSubmit || submitMutation.isPending}
                  className="bg-[#0A65FF] text-white hover:bg-[#0040c9]"
                >
                  {submitMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Submit assessment
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0A65FF]/10 text-[#0A65FF]">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <div className="space-y-2">
        <h3 className="font-display text-2xl tracking-[-0.03em]">Assessment received.</h3>
        <p className="mx-auto max-w-md text-sm leading-6 text-black/65">
          Thank you — we will review your responses and follow up within one business day with a recommended next
          step. If you need us sooner, email <a className="text-[#0A65FF] underline-offset-2 hover:underline" href="mailto:hello@digitaltherapy.io">hello@digitaltherapy.io</a>.
        </p>
      </div>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      {title && (
        <h3 className="text-[0.75rem] font-bold uppercase tracking-[0.22em] text-[#0040c9]">{title}</h3>
      )}
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="flex flex-col items-start gap-[11px]">
      <span className="text-sm font-medium text-[#111111]">{label}</span>
      {children}
    </Label>
  );
}

function RequiredField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="flex flex-col items-start gap-[11px]">
      <span className="text-sm font-medium text-[#111111]">
        {label} <span className="text-[#c83a3a]">*</span>
      </span>
      {children}
    </Label>
  );
}

function RadioGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-[15px]">
      <legend className="text-sm font-medium text-[#111111]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(active ? "" : opt)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                active
                  ? "border-[#0A65FF] bg-[#0A65FF] text-white"
                  : "border-black/15 bg-white text-black/75 hover:border-black/30"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function SystemPicker({
  label,
  options,
  values,
  onToggle,
  otherValue,
  onOtherChange,
}: {
  label: string;
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
  otherValue: string;
  onOtherChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <CheckboxGrid label={label} options={options} values={values} onToggle={onToggle} />
      {values.includes("Other") && (
        <Input
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Please specify"
          maxLength={300}
          className="sm:max-w-md"
        />
      )}
    </div>
  );
}

function CheckboxGrid({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-[15px]">
      <legend className="text-sm font-medium text-[#111111]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = values.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                active
                  ? "border-[#0A65FF] bg-[#0A65FF]/8 text-[#0040c9]"
                  : "border-black/15 bg-white text-black/75 hover:border-black/30"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
