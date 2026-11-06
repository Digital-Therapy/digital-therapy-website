/**
 * MonthlyCloseAssessmentDialog — "How Efficient Is Your Family Office's
 * Monthly Close?" intake form. Mirrors the pattern of NeedsAssessmentDialog
 * (Outsourced Accounting) but with the close-cycle question set. Submissions
 * persist to dt_site.needs_assessment with kind='monthly_close' and forward
 * to the DT Portal for notification.
 */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input as InputBase } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

// Match the local Input wrapper from NeedsAssessmentDialog: white bg so text
// inputs visually pair with the white radio/checkbox pills.
function Input({ className, ...props }: ComponentProps<typeof InputBase>) {
  return <InputBase {...props} className={cn("bg-white", className)} />;
}
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// ─── Question option sets ───────────────────────────────────────────────────

const CLOSE_DURATION_OPTIONS = [
  "1 – 7 days",
  "8 – 15 days",
  "16 – 30 days",
  "More than 30 days",
  "We do not follow a consistent monthly close process",
];

const YES_NO_OPTIONS = ["Yes", "No"];

const INVOICE_CHANNEL_OPTIONS = [
  "Emailed PDF attachment",
  "Emailed link to a billing or payment platform",
  "Vendor website or portal",
  "Paper invoice",
  "Text or messaging app",
  "Direct submission to our accounting or AP system",
  "Invoice in the body of an email",
  "Other",
];

const CENTRAL_INTAKE_OPTIONS = [
  "Yes, all invoices",
  "Most invoices",
  "Some invoices",
  "No",
];

const APPROVAL_METHOD_OPTIONS = [
  "A defined digital workflow with designated approvers",
  "Email or messaging, with approvals tracked manually",
  "Verbal or informal approval",
  "A mix of methods that varies by vendor or entity",
];

const TEAM_HOURS_OPTIONS = [
  "Fewer than 5 hours",
  "5 – 15 hours",
  "16 – 30 hours",
  "More than 30 hours",
  "Not sure",
];

const LATE_INVOICE_OPTIONS = [
  "Never",
  "Rarely",
  "Some months",
  "Most months",
  "Every month",
];

const CHECKLIST_OPTIONS = [
  "Yes, consistently",
  "Yes, but it is not consistently followed",
  "We have an informal checklist",
  "No",
];

const CLOSE_DELAY_OPTIONS = [
  "Collecting invoices and supporting documents",
  "Obtaining payment approvals",
  "Coding expenses to the correct accounts or entities",
  "Reconciling bank and credit card accounts",
  "Recording intercompany transactions and allocations",
  "Receiving investment statements or valuations",
  "Coordinating with outside accountants or advisors",
  "Correcting errors or duplicate entries",
  "Preparing consolidated reports",
  "No recurring delays",
  "Other",
];

const REPORT_CONFIDENCE_OPTIONS = [
  "Very confident",
  "Mostly confident",
  "Somewhat confident",
  "Not confident",
];

const IMPROVEMENT_GOAL_OPTIONS = [
  "Complete the close sooner",
  "Reduce manual work",
  "Standardize invoice intake and approvals",
  "Improve accuracy and controls",
  "Improve reporting across entities",
  "Reduce reliance on one person",
  "Give family members and decision-makers more timely information",
  "Other",
];

// Soft caps on the two "select up to three" checkbox groups. Not enforced as a
// hard block — the UI just stops accepting new selections once the cap is hit.
const MAX_DELAY_SELECTIONS = 3;
const MAX_IMPROVEMENT_SELECTIONS = 3;

// ─── State type ─────────────────────────────────────────────────────────────

type FormState = {
  // Section 1
  closeDuration: string;
  hasOrganizedVendorList: string;
  monthlyInvoiceCount: string;
  invoiceChannelCount: string;
  invoiceChannels: string[];
  invoiceChannelsOther: string;
  // Section 2
  centralInvoiceIntake: string;
  invoiceApprovalMethod: string;
  teamHoursOnInvoices: string;
  lateInvoiceFrequency: string;
  // Section 3
  entityCount: string;
  usesCloseChecklist: string;
  closeDelayActivities: string[];
  closeDelayActivitiesOther: string;
  reportConfidence: string;
  improvementGoals: string[];
  improvementGoalsOther: string;
  additionalNotes: string;
  // Contact
  contactName: string;
  contactEmail: string;
  familyOfficeName: string;
  contactRole: string;
};

const EMPTY_STATE: FormState = {
  closeDuration: "",
  hasOrganizedVendorList: "",
  monthlyInvoiceCount: "",
  invoiceChannelCount: "",
  invoiceChannels: [],
  invoiceChannelsOther: "",
  centralInvoiceIntake: "",
  invoiceApprovalMethod: "",
  teamHoursOnInvoices: "",
  lateInvoiceFrequency: "",
  entityCount: "",
  usesCloseChecklist: "",
  closeDelayActivities: [],
  closeDelayActivitiesOther: "",
  reportConfidence: "",
  improvementGoals: [],
  improvementGoalsOther: "",
  additionalNotes: "",
  contactName: "",
  contactEmail: "",
  familyOfficeName: "",
  contactRole: "",
};

export default function MonthlyCloseAssessmentDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_STATE);
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.assessments.submitMonthlyClose.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Assessment received — we'll be in touch within one business day.");
    },
    onError: (e) =>
      toast.error(e.message || "Could not submit. Please try again or email hello@digitaltherapy.io."),
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggle = <K extends keyof FormState>(key: K, value: string, cap?: number) =>
    setForm((f) => {
      const list = f[key] as unknown as string[];
      const alreadyPicked = list.includes(value);
      if (!alreadyPicked && typeof cap === "number" && list.length >= cap) {
        return f; // cap reached; swallow the extra toggle
      }
      const next = alreadyPicked ? list.filter((v) => v !== value) : [...list, value];
      return { ...f, [key]: next as FormState[K] };
    });

  const canSubmit =
    form.contactName.trim().length >= 2 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contactEmail.trim());

  const submit = () => {
    if (!canSubmit) return;
    submitMutation.mutate({
      closeDuration: form.closeDuration || undefined,
      hasOrganizedVendorList: form.hasOrganizedVendorList || undefined,
      monthlyInvoiceCount: form.monthlyInvoiceCount.trim() || undefined,
      invoiceChannelCount: form.invoiceChannelCount.trim() || undefined,
      invoiceChannels: form.invoiceChannels.length ? form.invoiceChannels : undefined,
      invoiceChannelsOther:
        form.invoiceChannels.includes("Other") && form.invoiceChannelsOther.trim()
          ? form.invoiceChannelsOther.trim()
          : undefined,
      centralInvoiceIntake: form.centralInvoiceIntake || undefined,
      invoiceApprovalMethod: form.invoiceApprovalMethod || undefined,
      teamHoursOnInvoices: form.teamHoursOnInvoices || undefined,
      lateInvoiceFrequency: form.lateInvoiceFrequency || undefined,
      entityCount: form.entityCount.trim() || undefined,
      usesCloseChecklist: form.usesCloseChecklist || undefined,
      closeDelayActivities: form.closeDelayActivities.length
        ? form.closeDelayActivities
        : undefined,
      closeDelayActivitiesOther:
        form.closeDelayActivities.includes("Other") && form.closeDelayActivitiesOther.trim()
          ? form.closeDelayActivitiesOther.trim()
          : undefined,
      reportConfidence: form.reportConfidence || undefined,
      improvementGoals: form.improvementGoals.length ? form.improvementGoals : undefined,
      improvementGoalsOther:
        form.improvementGoals.includes("Other") && form.improvementGoalsOther.trim()
          ? form.improvementGoalsOther.trim()
          : undefined,
      additionalNotes: form.additionalNotes.trim() || undefined,
      contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim(),
      familyOfficeName: form.familyOfficeName.trim() || undefined,
      contactRole: form.contactRole.trim() || undefined,
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
        <DialogHeader className="-mx-6 -mt-6 rounded-t-lg bg-[#0c65ff] px-6 py-7 text-left sm:px-10 sm:py-8">
          <DialogTitle className="font-display text-2xl tracking-[-0.03em] text-white sm:text-3xl">
            How Efficient Is Your Family Office&rsquo;s Monthly Close?
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <SuccessState onClose={() => handleOpenChange(false)} />
        ) : (
          <div className="flex flex-col gap-7 pt-4">
            <p className="text-[16pt] leading-7 text-black/85">
              Take this short self-assessment to identify opportunities to simplify invoice
              processing, improve visibility, and close your books sooner.
            </p>
            <p className="-mt-3 text-sm leading-6 text-black/60">
              Estimated completion time: 3 – 5 minutes. Please answer based on a typical month.
              Do not include account numbers or other confidential financial information.
            </p>

            {/* Section 1 */}
            <Section title="Your Monthly Close">
              <RadioGroup
                label="How long does your monthly close take?"
                help="Count calendar days from month-end until your books are finalized and ready for reporting."
                options={CLOSE_DURATION_OPTIONS}
                value={form.closeDuration}
                onChange={(v) => update("closeDuration", v)}
              />
              <RadioGroup
                label="Do you have an organized vendor list?"
                help="An organized vendor list is a central, regularly maintained record of active vendors, their contact information, payment terms, and the entities they serve."
                options={YES_NO_OPTIONS}
                value={form.hasOrganizedVendorList}
                onChange={(v) => update("hasOrganizedVendorList", v)}
              />
              <Grid>
                <Field
                  label="How many invoices do you receive each month?"
                  help="Include invoices across all entities. An estimate is fine."
                >
                  <Input
                    inputMode="numeric"
                    value={form.monthlyInvoiceCount}
                    onChange={(e) => update("monthlyInvoiceCount", e.target.value)}
                    placeholder="e.g. 250"
                  />
                </Field>
                <Field
                  label="How many different invoice types / channels do you accept?"
                  help="Count each distinct method once — not each vendor or individual invoice."
                >
                  <Input
                    inputMode="numeric"
                    value={form.invoiceChannelCount}
                    onChange={(e) => update("invoiceChannelCount", e.target.value)}
                    placeholder="e.g. 4"
                  />
                </Field>
              </Grid>
              <SystemPicker
                label="Which of these channels do you currently use? Select all that apply."
                options={INVOICE_CHANNEL_OPTIONS}
                values={form.invoiceChannels}
                onToggle={(v) => toggle("invoiceChannels", v)}
                otherValue={form.invoiceChannelsOther}
                onOtherChange={(v) => update("invoiceChannelsOther", v)}
              />
            </Section>

            {/* Section 2 */}
            <Section title="Your Invoice & Approval Process">
              <RadioGroup
                label="Are all invoices routed to one central intake point before processing?"
                help="For example, a shared accounts payable inbox or invoice management system."
                options={CENTRAL_INTAKE_OPTIONS}
                value={form.centralInvoiceIntake}
                onChange={(v) => update("centralInvoiceIntake", v)}
              />
              <RadioGroup
                label="How are invoices approved for payment?"
                options={APPROVAL_METHOD_OPTIONS}
                value={form.invoiceApprovalMethod}
                onChange={(v) => update("invoiceApprovalMethod", v)}
              />
              <RadioGroup
                label="How much time does your team spend each month collecting invoices, following up on approvals, and resolving missing information?"
                help="Estimate the combined hours across your team."
                options={TEAM_HOURS_OPTIONS}
                value={form.teamHoursOnInvoices}
                onChange={(v) => update("teamHoursOnInvoices", v)}
              />
              <RadioGroup
                label="How often do late or missing invoices delay your close or require changes after it is complete?"
                options={LATE_INVOICE_OPTIONS}
                value={form.lateInvoiceFrequency}
                onChange={(v) => update("lateInvoiceFrequency", v)}
              />
            </Section>

            {/* Section 3 */}
            <Section title="Your Close Controls & Reporting">
              <Field
                label="How many entities are included in your monthly close?"
                help="Include relevant trusts, partnerships, LLCs, foundations, and other entities."
              >
                <Input
                  inputMode="numeric"
                  value={form.entityCount}
                  onChange={(e) => update("entityCount", e.target.value)}
                  placeholder="e.g. 12"
                  className="sm:max-w-xs"
                />
              </Field>
              <RadioGroup
                label="Do you use a documented monthly close checklist with assigned owners and deadlines?"
                options={CHECKLIST_OPTIONS}
                value={form.usesCloseChecklist}
                onChange={(v) => update("usesCloseChecklist", v)}
              />
              <SystemPicker
                label={`Which activities most often slow down your monthly close? (Select up to ${MAX_DELAY_SELECTIONS}.)`}
                options={CLOSE_DELAY_OPTIONS}
                values={form.closeDelayActivities}
                onToggle={(v) => toggle("closeDelayActivities", v, MAX_DELAY_SELECTIONS)}
                otherValue={form.closeDelayActivitiesOther}
                onOtherChange={(v) => update("closeDelayActivitiesOther", v)}
              />
              <RadioGroup
                label="How confident are you that your monthly reports are complete and accurate when delivered?"
                options={REPORT_CONFIDENCE_OPTIONS}
                value={form.reportConfidence}
                onChange={(v) => update("reportConfidence", v)}
              />
              <SystemPicker
                label={`What would you most like to improve about your monthly close? (Select up to ${MAX_IMPROVEMENT_SELECTIONS}.)`}
                options={IMPROVEMENT_GOAL_OPTIONS}
                values={form.improvementGoals}
                onToggle={(v) => toggle("improvementGoals", v, MAX_IMPROVEMENT_SELECTIONS)}
                otherValue={form.improvementGoalsOther}
                onOtherChange={(v) => update("improvementGoalsOther", v)}
              />
              <Field
                label="Is there anything else you would like us to know?"
                help="Optional. Please avoid sharing confidential financial details."
              >
                <Textarea
                  value={form.additionalNotes}
                  onChange={(e) => update("additionalNotes", e.target.value)}
                  rows={4}
                />
              </Field>
            </Section>

            {/* Contact */}
            <Section title="Your Contact Information">
              <Grid>
                <RequiredField label="Full Name">
                  <Input
                    value={form.contactName}
                    onChange={(e) => update("contactName", e.target.value)}
                  />
                </RequiredField>
                <RequiredField label="Email">
                  <Input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => update("contactEmail", e.target.value)}
                  />
                </RequiredField>
                <Field label="Family Office or Organization">
                  <Input
                    value={form.familyOfficeName}
                    onChange={(e) => update("familyOfficeName", e.target.value)}
                  />
                </Field>
                <Field label="Role / Title">
                  <Input
                    value={form.contactRole}
                    onChange={(e) => update("contactRole", e.target.value)}
                  />
                </Field>
              </Grid>
            </Section>

            {/* Submit */}
            <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col gap-3 border-t border-black/10 bg-white/95 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <p className="text-base text-black/80">
                We&rsquo;ll be in touch within one business day.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={submit}
                  disabled={!canSubmit || submitMutation.isPending}
                  className="bg-[#0c65ff] text-white hover:bg-[#0040c9]"
                >
                  {submitMutation.isPending && (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  )}
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

// ─── Sub-components (duplicated from NeedsAssessmentDialog so the two
//    intake flows stay independently editable; refactor if a third assessment
//    shows up with the same helpers). ──────────────────────────────────────

function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0A65FF]/10 text-[#0A65FF]">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <div className="space-y-2">
        <h3 className="font-display text-2xl tracking-[-0.03em]">Assessment received.</h3>
        <p className="mx-auto max-w-md text-base leading-7 text-black/80">
          Thank you — we&rsquo;ll be in touch.
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
        <h3 className="text-[0.75rem] font-bold uppercase tracking-[0.22em] text-[#0040c9]">
          {title}
        </h3>
      )}
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <Label className="flex flex-col items-start gap-[11px]">
      <span className="text-sm font-medium text-[#111111]">{label}</span>
      {help && <span className="-mt-1.5 text-xs leading-5 text-black/55">{help}</span>}
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
  help,
  options,
  value,
  onChange,
}: {
  label: string;
  help?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-[15px]">
      <legend className="text-sm font-medium text-[#111111]">{label}</legend>
      {help && <p className="-mt-1 text-xs leading-5 text-black/55">{help}</p>}
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
          placeholder="Please describe"
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
