/**
 * NeedsAssessmentDialog — Outsourced Accounting / Bookkeeping intake form.
 *
 * Collects family-office profile, scale, composition, current systems, close
 * cadence, team composition, and goals. Submitting persists to dt_site and
 * emails Karina the formatted assessment immediately.
 */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ─── Question option sets ───────────────────────────────────────────────────

const AUM_OPTIONS = ["Under $100M", "$100M – $500M", "$500M – $1B", "$1B – $5B", "$5B – $10B", "$10B+"];
const REVENUE_OPTIONS = ["$10M – $24M", "$25M – $49M", "$50M – $249M", "$250M – $499M", "$500M+"];
const BACK_OFFICE_OPTIONS = ["1", "2 – 5", "6 – 10", "11 – 29", "30 – 49", "50+"];
const ENTITY_COUNT_OPTIONS = ["1 – 10", "11 – 24", "25 – 49", "50 – 99", "100 – 199", "200 – 499", "500+"];
const OPERATING_BIZ_OPTIONS = ["0", "1", "2", "3", "4", "5+"];

const ENTITY_TYPE_OPTIONS = [
  "Trusts",
  "LLCs",
  "Limited Partnerships (LP / LLP)",
  "S-Corps",
  "C-Corps",
  "Partnerships",
  "Foundations",
  "Disregarded entities",
  "Other",
];

const JURISDICTION_OPTIONS = [
  "US — single state",
  "US — multi-state",
  "Cayman Islands",
  "British Virgin Islands",
  "Luxembourg",
  "Singapore",
  "Jersey / Guernsey",
  "Switzerland",
  "Bermuda",
  "Other offshore",
];

const ASSET_LOCATION_OPTIONS = [
  "All on-shore",
  "Mostly on-shore",
  "Mixed",
  "Mostly off-shore",
  "All off-shore",
];

const INVESTMENT_TYPE_OPTIONS = [
  "Public equities",
  "Public fixed income",
  "Private equity",
  "Hedge funds",
  "Venture capital",
  "Real estate — direct",
  "Real estate — funds",
  "Art / collectibles",
  "Digital assets / crypto",
  "Operating-business interests",
];

const CLOSE_TIMELINE_OPTIONS = [
  "Under 5 business days",
  "5 – 10 business days",
  "10 – 20 business days",
  "20+ business days",
  "We do not close monthly",
];

const REPORTING_CADENCE_OPTIONS = ["Weekly", "Monthly", "Quarterly", "Annually", "Ad hoc only"];

const BILL_VOLUME_OPTIONS = ["Under 50", "50 – 200", "200 – 500", "500 – 1,000", "1,000+"];
const ACCOUNTS_OPTIONS = ["Under 10", "10 – 50", "50 – 100", "100 – 250", "250+"];
const K1_VOLUME_OPTIONS = ["0", "1 – 25", "25 – 100", "100 – 500", "500+"];
const PAYROLL_HEADCOUNT_OPTIONS = ["0", "1 – 10", "11 – 25", "26 – 50", "51 – 100", "100+"];

const CURRENT_ROLE_OPTIONS = [
  "CFO",
  "Controller",
  "Senior accountant",
  "Staff accountant",
  "Bookkeeper",
  "AP clerk",
  "AR clerk",
  "Payroll specialist",
  "Tax manager",
  "External accountant / CPA firm",
];

const OUTSOURCING_MIX_OPTIONS = [
  "All in-house",
  "Mostly in-house",
  "Roughly half / half",
  "Mostly outsourced",
  "All outsourced",
];

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

const TIMELINE_OPTIONS = [
  "Need a partner now (0 – 30 days)",
  "This quarter",
  "This year",
  "Just exploring options",
];

const US_STATE_OPTIONS = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
  "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
  "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "PR", "International",
];

// ─── State type ─────────────────────────────────────────────────────────────

type FormState = {
  familyOfficeName: string;
  contactName: string;
  contactRole: string;
  websiteUrl: string;
  extraWebsiteUrls: string[];
  contactEmail: string;
  contactPhone: string;
  hqCity: string;
  hqState: string;
  hqZip: string;
  aum: string;
  annualRevenue: string;
  backOfficeSize: string;
  entityCount: string;
  operatingBusinesses: string;
  entityTypes: string[];
  jurisdictions: string[];
  assetLocation: string;
  investmentTypes: string[];
  generalLedgerSystem: string;
  billPaySystem: string;
  investmentReportingSystem: string;
  payrollSystem: string;
  monthEndCloseTimeline: string;
  reportingCadence: string;
  monthlyBillVolume: string;
  accountsToReconcile: string;
  annualK1Volume: string;
  payrollHeadcount: string;
  currentRoles: string[];
  outsourcingMix: string;
  teamGeography: string;
  painPoints: string;
  primaryGoals: string[];
  timeline: string;
  additionalNotes: string;
};

const EMPTY_STATE: FormState = {
  familyOfficeName: "",
  contactName: "",
  contactRole: "",
  websiteUrl: "",
  extraWebsiteUrls: [],
  contactEmail: "",
  contactPhone: "",
  hqCity: "",
  hqState: "",
  hqZip: "",
  aum: "",
  annualRevenue: "",
  backOfficeSize: "",
  entityCount: "",
  operatingBusinesses: "",
  entityTypes: [],
  jurisdictions: [],
  assetLocation: "",
  investmentTypes: [],
  generalLedgerSystem: "",
  billPaySystem: "",
  investmentReportingSystem: "",
  payrollSystem: "",
  monthEndCloseTimeline: "",
  reportingCadence: "",
  monthlyBillVolume: "",
  accountsToReconcile: "",
  annualK1Volume: "",
  payrollHeadcount: "",
  currentRoles: [],
  outsourcingMix: "",
  teamGeography: "",
  painPoints: "",
  primaryGoals: [],
  timeline: "",
  additionalNotes: "",
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
      hqCity: form.hqCity.trim() || undefined,
      hqState: form.hqState || undefined,
      hqZip: form.hqZip.trim() || undefined,
      aum: form.aum || undefined,
      annualRevenue: form.annualRevenue || undefined,
      backOfficeSize: form.backOfficeSize || undefined,
      entityCount: form.entityCount || undefined,
      operatingBusinesses: form.operatingBusinesses || undefined,
      entityTypes: form.entityTypes.length ? form.entityTypes : undefined,
      jurisdictions: form.jurisdictions.length ? form.jurisdictions : undefined,
      assetLocation: form.assetLocation || undefined,
      investmentTypes: form.investmentTypes.length ? form.investmentTypes : undefined,
      generalLedgerSystem: form.generalLedgerSystem.trim() || undefined,
      billPaySystem: form.billPaySystem.trim() || undefined,
      investmentReportingSystem: form.investmentReportingSystem.trim() || undefined,
      payrollSystem: form.payrollSystem.trim() || undefined,
      monthEndCloseTimeline: form.monthEndCloseTimeline || undefined,
      reportingCadence: form.reportingCadence || undefined,
      monthlyBillVolume: form.monthlyBillVolume || undefined,
      accountsToReconcile: form.accountsToReconcile || undefined,
      annualK1Volume: form.annualK1Volume || undefined,
      payrollHeadcount: form.payrollHeadcount || undefined,
      currentRoles: form.currentRoles.length ? form.currentRoles : undefined,
      outsourcingMix: form.outsourcingMix || undefined,
      teamGeography: form.teamGeography.trim() || undefined,
      painPoints: form.painPoints.trim() || undefined,
      primaryGoals: form.primaryGoals.length ? form.primaryGoals : undefined,
      timeline: form.timeline || undefined,
      additionalNotes: form.additionalNotes.trim() || undefined,
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
            <p className="text-sm leading-6 text-black/65">
              Take 5 – 10 minutes to walk us through your office. Only the family-office name, your name, and email
              are required — the rest helps us come back with sharper recommendations.
            </p>

            {/* Section A: Profile */}
            <Section title="About your office">
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
                <Field label="Website URL">
                  <div className="relative">
                    <Input
                      value={form.websiteUrl}
                      onChange={(e) => update("websiteUrl", e.target.value)}
                      placeholder="https://"
                      className="pr-10"
                    />
                    {form.extraWebsiteUrls.length < 2 && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                          setForm((f) => ({ ...f, extraWebsiteUrls: [...f.extraWebsiteUrls, ""] }))
                        }
                        aria-label="Add another website URL"
                        title="Add another website URL"
                        className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#0A65FF] bg-[#0A65FF]/10 text-[#0A65FF] transition-colors hover:bg-[#0A65FF] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF] focus-visible:ring-offset-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </Field>
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
                <Label className="flex flex-col gap-[11px] sm:col-span-2">
                  <span className="text-sm font-medium text-[#111111]">HQ Location</span>
                  <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <Input
                      value={form.hqCity}
                      onChange={(e) => update("hqCity", e.target.value)}
                      placeholder="Select City"
                      maxLength={120}
                      className="flex-1"
                    />
                    <select
                      value={form.hqState}
                      onChange={(e) => update("hqState", e.target.value)}
                      className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full flex-1 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px] md:text-sm"
                    >
                      <option value="">Select State</option>
                      {US_STATE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <span className="self-center text-sm text-black/55">or</span>
                    <Input
                      value={form.hqZip}
                      onChange={(e) => update("hqZip", e.target.value)}
                      placeholder="Enter Zip Code"
                      inputMode="numeric"
                      maxLength={10}
                      className="flex-1"
                    />
                  </div>
                </Label>
              </Grid>
            </Section>

            {/* Section B: Scale */}
            <Section title="Scale & complexity">
              <RadioGroup
                label="Approximate AUM"
                options={AUM_OPTIONS}
                value={form.aum}
                onChange={(v) => update("aum", v)}
              />
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
                label="Number of operating businesses (if any)"
                options={OPERATING_BIZ_OPTIONS}
                value={form.operatingBusinesses}
                onChange={(v) => update("operatingBusinesses", v)}
              />
            </Section>

            {/* Section C: Composition */}
            <Section title="Entity & investment composition">
              <CheckboxGrid
                label="Entity types in your structure"
                options={ENTITY_TYPE_OPTIONS}
                values={form.entityTypes}
                onToggle={(v) => toggle("entityTypes", v)}
              />
              <CheckboxGrid
                label="Jurisdictions"
                options={JURISDICTION_OPTIONS}
                values={form.jurisdictions}
                onToggle={(v) => toggle("jurisdictions", v)}
              />
              <RadioGroup
                label="Asset / investment location"
                options={ASSET_LOCATION_OPTIONS}
                value={form.assetLocation}
                onChange={(v) => update("assetLocation", v)}
              />
              <CheckboxGrid
                label="Investment types held"
                options={INVESTMENT_TYPE_OPTIONS}
                values={form.investmentTypes}
                onToggle={(v) => toggle("investmentTypes", v)}
              />
            </Section>

            {/* Section D: Current systems */}
            <Section title="Current systems">
              <Grid>
                <Field label="General ledger / accounting software">
                  <Input
                    value={form.generalLedgerSystem}
                    onChange={(e) => update("generalLedgerSystem", e.target.value)}
                    placeholder="QuickBooks, Sage Intacct, NetSuite, Workday, custom…"
                  />
                </Field>
                <Field label="Bill pay / AP system">
                  <Input
                    value={form.billPaySystem}
                    onChange={(e) => update("billPaySystem", e.target.value)}
                    placeholder="Bill.com, Ramp, Tipalti, in-house…"
                  />
                </Field>
                <Field label="Investment / portfolio reporting platform">
                  <Input
                    value={form.investmentReportingSystem}
                    onChange={(e) => update("investmentReportingSystem", e.target.value)}
                    placeholder="Addepar, Black Diamond, eFront, Eton, custom…"
                  />
                </Field>
                <Field label="Payroll provider">
                  <Input
                    value={form.payrollSystem}
                    onChange={(e) => update("payrollSystem", e.target.value)}
                    placeholder="Gusto, ADP, Paychex, Justworks, in-house, N/A…"
                  />
                </Field>
              </Grid>
            </Section>

            {/* Section E: Close, reporting & volume */}
            <Section title="Close cadence, reporting & volume">
              <RadioGroup
                label="Current month-end close timeline"
                options={CLOSE_TIMELINE_OPTIONS}
                value={form.monthEndCloseTimeline}
                onChange={(v) => update("monthEndCloseTimeline", v)}
              />
              <RadioGroup
                label="Reporting cadence to principals / family"
                options={REPORTING_CADENCE_OPTIONS}
                value={form.reportingCadence}
                onChange={(v) => update("reportingCadence", v)}
              />
              <RadioGroup
                label="Approximate monthly bill / invoice volume"
                options={BILL_VOLUME_OPTIONS}
                value={form.monthlyBillVolume}
                onChange={(v) => update("monthlyBillVolume", v)}
              />
              <RadioGroup
                label="Bank + investment accounts to reconcile"
                options={ACCOUNTS_OPTIONS}
                value={form.accountsToReconcile}
                onChange={(v) => update("accountsToReconcile", v)}
              />
              <RadioGroup
                label="Annual K-1 production volume"
                options={K1_VOLUME_OPTIONS}
                value={form.annualK1Volume}
                onChange={(v) => update("annualK1Volume", v)}
              />
              <RadioGroup
                label="Payroll headcount"
                options={PAYROLL_HEADCOUNT_OPTIONS}
                value={form.payrollHeadcount}
                onChange={(v) => update("payrollHeadcount", v)}
              />
            </Section>

            {/* Section F: Team composition */}
            <Section title="Team today">
              <CheckboxGrid
                label="Current back-office roles (in-house or outsourced)"
                options={CURRENT_ROLE_OPTIONS}
                values={form.currentRoles}
                onToggle={(v) => toggle("currentRoles", v)}
              />
              <RadioGroup
                label="Current in-house vs outsourced mix"
                options={OUTSOURCING_MIX_OPTIONS}
                value={form.outsourcingMix}
                onChange={(v) => update("outsourcingMix", v)}
              />
              <Field label="Team geography (cities / time zones, optional)">
                <Input
                  value={form.teamGeography}
                  onChange={(e) => update("teamGeography", e.target.value)}
                  placeholder="NYC + remote, distributed across US, all on-site in London…"
                />
              </Field>
            </Section>

            {/* Section G: Goals */}
            <Section title="Goals & what's painful today">
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
              <Field label="Anything else we should know? (optional)">
                <Textarea
                  value={form.additionalNotes}
                  onChange={(e) => update("additionalNotes", e.target.value)}
                  rows={3}
                />
              </Field>
            </Section>

            {/* Submit */}
            <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col gap-3 border-t border-black/10 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-black/55">
                We respond within one business day. Your information stays private.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={!canSubmit || submitMutation.isPending}>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h3 className="text-[0.75rem] font-bold uppercase tracking-[0.22em] text-[#0040c9]">{title}</h3>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="flex flex-col gap-[11px]">
      <span className="text-sm font-medium text-[#111111]">{label}</span>
      {children}
    </Label>
  );
}

function RequiredField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Label className="flex flex-col gap-[11px]">
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
