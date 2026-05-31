/**
 * VendorNdaDialog
 *
 * Third-Party Vendor Confidentiality & Data Protection Agreement — executed
 * digitally by vendor applicants before they can submit the main vendor
 * application. Renders the full NDA text with the vendor party block
 * dynamically interpolated from editable inputs, captures a typed signature
 * + signature date + "receive a co-signed copy" checkbox, and returns the
 * completed structure to the parent form via onComplete.
 *
 * The Engaging Party (Digital Therapy) block is fixed. The Vendor party
 * block is editable. The legal text below the parties is rendered verbatim
 * from the canonical agreement supplied by Digital Therapy.
 */
import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, FileText, Loader2, ShieldCheck, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type VendorNdaData = {
  // Vendor party identification
  businessName: string;
  entityDescriptor: string; // e.g. "a Michigan C-Corporation"
  address: string;
  signerName: string;
  title: string;
  phone: string;
  email: string;
  // Execution
  signatureText: string;
  signatureDate: string; // YYYY-MM-DD
  effectiveDate: string; // YYYY-MM-DD
  requestCopy: boolean;
};

type VendorNdaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: VendorNdaData) => void;
  existing?: VendorNdaData | null;
  vendorTypeLabel?: string;
};

const todayIso = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const initialNda = (existing?: VendorNdaData | null): VendorNdaData => ({
  businessName: existing?.businessName ?? "",
  entityDescriptor: existing?.entityDescriptor ?? "",
  address: existing?.address ?? "",
  signerName: existing?.signerName ?? "",
  title: existing?.title ?? "",
  phone: existing?.phone ?? "",
  email: existing?.email ?? "",
  signatureText: existing?.signatureText ?? "",
  signatureDate: existing?.signatureDate ?? todayIso(),
  effectiveDate: existing?.effectiveDate ?? todayIso(),
  requestCopy: existing?.requestCopy ?? false,
});

// Renders a small "fill-in-the-blank" placeholder when the vendor hasn't yet
// completed a NDA field — keeps the rendered NDA legible while empty.
function Slot({ value, placeholder }: { value: string; placeholder: string }) {
  return value.trim().length > 0 ? (
    <span className="font-semibold text-[#111111]">{value}</span>
  ) : (
    <span className="rounded-sm bg-[#0A65FF]/10 px-1 text-xs font-bold uppercase tracking-[0.18em] text-[#0A65FF]">
      [ {placeholder} ]
    </span>
  );
}

export function VendorNdaDialog({
  open,
  onOpenChange,
  onComplete,
  existing,
  vendorTypeLabel,
}: VendorNdaDialogProps) {
  const [form, setForm] = useState<VendorNdaData>(() => initialNda(existing));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm(initialNda(existing));
  }, [open, existing]);

  const updateField = <K extends keyof VendorNdaData>(field: K, value: VendorNdaData[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onComplete(form);
      onOpenChange(false);
    }, 250);
  };

  // Signature must match signer name (typed-signature best practice).
  const signatureMatches =
    form.signatureText.trim().length > 0 &&
    form.signerName.trim().toLowerCase() === form.signatureText.trim().toLowerCase();
  const canSubmit =
    form.businessName.trim().length >= 2 &&
    form.signerName.trim().length >= 2 &&
    signatureMatches &&
    form.signatureDate.length > 0 &&
    form.effectiveDate.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-[95vw] overflow-y-auto border-white/80 bg-[#F7F4EE] p-0 text-[#111111] shadow-[0_42px_120px_rgba(17,17,17,0.28)] sm:max-w-[980px] sm:rounded-[2rem]">
        <DialogHeader className="border-b border-black/10 bg-white px-8 pb-7 pt-8 text-left sm:px-10 sm:pt-10">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0A65FF] text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
            Third-Party Vendor Confidentiality &amp; Data Protection Agreement
            {vendorTypeLabel ? ` · ${vendorTypeLabel}` : ""}
          </p>
          <DialogTitle className="mt-3 font-display text-3xl leading-[1.05] tracking-[-0.03em] text-[#111111] sm:text-4xl">
            Executed digitally.
          </DialogTitle>
          <DialogDescription className="mt-3 text-sm leading-6 text-black/65">
            Complete the Vendor party block, review the full Agreement, type your signature, and execute.
            Execution is required before the vendor application can be submitted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#F7F4EE] px-8 py-8 sm:px-10 sm:py-10">
          {/* VENDOR PARTY INFO ----------------------------------------- */}
          <fieldset className="space-y-5 rounded-[1.25rem] border border-[#0A65FF]/25 bg-[#0A65FF]/8 p-6 sm:p-7">
            <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
              Vendor party — fill in
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-black/74">
                Business name
                <Input
                  value={form.businessName}
                  onChange={(event) => updateField("businessName", event.target.value)}
                  required
                  minLength={2}
                  placeholder="Vendor Co, LLC"
                  className="h-11"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-black/74">
                Entity descriptor
                <Input
                  value={form.entityDescriptor}
                  onChange={(event) => updateField("entityDescriptor", event.target.value)}
                  placeholder="a Delaware LLC / a Michigan C-Corporation / etc."
                  className="h-11"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-black/74 sm:col-span-2">
                Address
                <Input
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  placeholder="Street, City, State, ZIP"
                  className="h-11"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-black/74">
                Contact (signer) full name
                <Input
                  value={form.signerName}
                  onChange={(event) => updateField("signerName", event.target.value)}
                  required
                  minLength={2}
                  placeholder="Jane Q. Vendor"
                  className="h-11"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-black/74">
                Title
                <Input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Founder, Principal, Managing Member…"
                  className="h-11"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-black/74">
                Phone
                <Input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="555 - 123 - 4567"
                  className="h-11"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-black/74">
                Email
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="name@vendor.com"
                  className="h-11"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold text-black/74 sm:col-span-2">
                Effective date
                <Input
                  type="date"
                  value={form.effectiveDate}
                  onChange={(event) => updateField("effectiveDate", event.target.value)}
                  required
                  className="h-11 sm:max-w-[16rem]"
                />
              </label>
            </div>
          </fieldset>

          {/* NDA TEXT --------------------------------------------------- */}
          <div className="rounded-[1.25rem] border border-black/10 bg-white p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
              <FileText className="h-3.5 w-3.5" />
              Agreement
            </div>
            <div className="max-h-[55vh] space-y-5 overflow-y-auto pr-2 text-sm leading-7 text-black/85">
              <h3 className="text-base font-bold uppercase tracking-[0.06em] text-[#111111]">
                Third-Party Vendor Confidentiality &amp; Data Protection Agreement
              </h3>

              <p className="text-sm">
                <span className="font-semibold">Consulting Firm (Engaging Party):</span> Digital Therapy, LLC
              </p>

              <p>
                This Third-Party Vendor Confidentiality &amp; Data Protection Agreement
                (&ldquo;<strong>Agreement</strong>&rdquo;) is made effective as of{" "}
                <Slot value={form.effectiveDate} placeholder="Insert date" /> by and between:
              </p>

              {/* Engaging Party block (fixed) */}
              <div className="rounded-[0.75rem] border border-black/10 bg-[#F7F4EE]/60 p-4 text-sm">
                <p>
                  <strong>Digital Therapy, LLC</strong> (&ldquo;<strong>Engaging Party</strong>&rdquo;), a New York Limited Liability Company
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Located at:</span> 115 E 89th St Apt 9A, New York, NY 10128
                </p>
                <p>
                  <span className="font-semibold">Contact:</span> Jonathan Kobrin
                </p>
              </div>

              <p>and</p>

              {/* Vendor party block (dynamic from form inputs above) */}
              <div className="rounded-[0.75rem] border border-[#0A65FF]/30 bg-[#0A65FF]/8 p-4 text-sm">
                <p>
                  <Slot value={form.businessName} placeholder="Vendor business name" /> (&ldquo;<strong>Vendor</strong>&rdquo; or &ldquo;<strong>Receiving Party</strong>&rdquo;),{" "}
                  <Slot value={form.entityDescriptor} placeholder="Entity descriptor" />
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Located at:</span>{" "}
                  <Slot value={form.address} placeholder="Vendor address" />
                </p>
                <p>
                  <span className="font-semibold">Contact:</span>{" "}
                  <Slot value={form.signerName} placeholder="Contact full name" />
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  <Slot value={form.phone} placeholder="Vendor phone" />
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <Slot value={form.email} placeholder="Vendor email" />
                </p>
              </div>

              <p className="italic text-black/65">
                Digital Therapy and Vendor are collectively referred to as the &ldquo;<strong>Parties</strong>.&rdquo;
              </p>

              <hr className="border-black/10" />

              <h4 className="font-bold text-[#111111]">1. Purpose</h4>
              <p>
                Digital Therapy has been engaged by Chapman Group to perform a full digital transformation of the Chapman family office and its portfolio companies.
              </p>
              <p>
                Vendor may receive access to business, operational, technical, or financial information relating to Chapman Group and its affiliates.
              </p>
              <p>This Agreement governs the handling and protection of such information.</p>

              <h4 className="font-bold text-[#111111]">2. Definition of Confidential Information</h4>
              <p>
                &ldquo;Confidential Information&rdquo; includes all non-public information disclosed by Digital Therapy or Chapman Group to Vendor in any form (oral, written, electronic, or otherwise), including but not limited to:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Business plans, strategies, pricing, financial data, customer lists, or investor records;</li>
                <li>Software, code, systems, infrastructure, or configurations;</li>
                <li>Operating procedures, documentation, templates, playbooks, or training materials;</li>
                <li>Employee, contractor, or vendor information;</li>
                <li>Any derivative information created from or incorporating such data.</li>
              </ul>
              <p>Information is not Confidential Information if Vendor can prove:</p>
              <p>(a) The information is publicly known through no breach;</p>
              <p>(b) The information was lawfully known prior to disclosure;</p>
              <p>(c) The information was independently developed without reference to Confidential Information.</p>

              <h4 className="font-bold text-[#111111]">3. Vendor Obligations</h4>
              <p>Vendor shall:</p>
              <p>a) Use Confidential Information only for purposes of performing authorized services for Digital Therapy;</p>
              <p>b) Maintain strict confidentiality and not disclose any information to third parties without written authorization;</p>
              <p>c) Protect all Confidential Information using no less than reasonable care;</p>
              <p>d) Limit access to personnel with a need to know who are bound by similar obligations;</p>
              <p>e) Not copy, store, transmit, or use Confidential Information except as necessary to perform the services;</p>
              <p>f) Promptly notify Digital Therapy of any actual or suspected unauthorized use or disclosure; and</p>
              <p>g) Upon request or termination of services, return or securely destroy all Confidential Information and confirm such destruction in writing.</p>

              <h4 className="font-bold text-[#111111]">4. Ownership and No License</h4>
              <p>
                All Confidential Information remains the sole property of Chapman Group and/or Digital Therapy.
              </p>
              <p>No license or ownership rights are granted by this Agreement, whether express or implied.</p>

              <h4 className="font-bold text-[#111111]">5. Term and Survival</h4>
              <p>
                This Agreement is effective as of the date first written above and continues until all Confidential Information has been returned or destroyed.
              </p>
              <p>
                Vendor&rsquo;s confidentiality obligations survive for five (5) years after termination and indefinitely with respect to trade secrets or personally identifiable information.
              </p>

              <h4 className="font-bold text-[#111111]">6. Data Security and Compliance</h4>
              <p>Vendor shall:</p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Comply with all applicable privacy and security laws (including GDPR and CCPA);</li>
                <li>Use multi-factor authentication and secure storage for any system containing Protected Party data;</li>
                <li>Report any data breach or security incident within 24 hours of discovery; and</li>
                <li>Cooperate fully with Digital Therapy and Chapman Group in any remediation or investigation.</li>
              </ul>

              <h4 className="font-bold text-[#111111]">7. Remedies and Indemnification</h4>
              <p>
                Vendor acknowledges that unauthorized use or disclosure may cause irreparable harm for which monetary damages would be inadequate.
              </p>
              <p>
                Digital Therapy and Chapman Group may seek injunctive relief and recover all damages, costs, and reasonable attorney fees arising from any breach.
              </p>

              <h4 className="font-bold text-[#111111]">8. Relationship of Parties</h4>
              <p>
                Vendor is an independent contractor of Digital Therapy and has no direct contractual relationship with Chapman Group beyond this acknowledgment of obligations.
              </p>
              <p>
                Nothing herein creates employment, agency, or partnership between Vendor and Chapman Group.
              </p>

              <h4 className="font-bold text-[#111111]">9. Governing Law and Venue</h4>
              <p>
                This Agreement is governed by the laws of the State of New York, without regard to conflict-of-law principles.
              </p>
              <p>
                The Parties consent to exclusive jurisdiction in the state and federal courts located in New York County, New York.
              </p>

              <h4 className="font-bold text-[#111111]">10. Entire Agreement</h4>
              <p>
                This document constitutes the entire understanding among the Parties and supersedes all prior discussions regarding its subject matter.
              </p>
              <p>
                Any amendment must be in writing and signed by Digital Therapy and Vendor.
              </p>

              <hr className="border-black/10" />

              <p className="font-semibold uppercase tracking-[0.06em]">
                In witness whereof, the Parties have executed this Agreement as of the Effective Date.
              </p>

              <div className="space-y-1 rounded-[0.75rem] border border-black/10 bg-[#F7F4EE]/60 p-4 text-sm">
                <p>
                  <span className="font-semibold">Vendor signature:</span>{" "}
                  {form.signatureText.trim().length > 0 ? (
                    <span className="font-display text-xl italic text-[#0A65FF]">{form.signatureText}</span>
                  ) : (
                    <span className="text-black/40">— signature pending —</span>
                  )}
                </p>
                <p>
                  <span className="font-semibold">Business name:</span>{" "}
                  <Slot value={form.businessName} placeholder="Vendor business name" />
                </p>
                <p>
                  <span className="font-semibold">Signer name:</span>{" "}
                  <Slot value={form.signerName} placeholder="Contact full name" />
                </p>
                <p>
                  <span className="font-semibold">Title:</span>{" "}
                  <Slot value={form.title} placeholder="Title" />
                </p>
                <p>
                  <span className="font-semibold">Sign date:</span>{" "}
                  <Slot value={form.signatureDate} placeholder="Sign date" />
                </p>
              </div>
            </div>
          </div>

          {/* SIGNATURE --------------------------------------------------- */}
          <fieldset className="space-y-5">
            <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
              Execute
            </legend>
            <div className="grid gap-5 sm:grid-cols-[1.5fr_1fr]">
              <label className="space-y-2 text-sm font-semibold text-black/74">
                Signature (type your full legal name)
                <Input
                  value={form.signatureText}
                  onChange={(event) => updateField("signatureText", event.target.value)}
                  required
                  minLength={2}
                  placeholder="Type the same name as the contact field above"
                  className="h-12 font-display text-2xl italic tracking-tight text-[#0A65FF]"
                />
                {form.signatureText.trim().length > 0 && !signatureMatches ? (
                  <span className="block text-xs font-normal text-red-600">
                    Signature must match the contact full name above.
                  </span>
                ) : (
                  <span className="block text-xs font-normal text-black/60">
                    By typing your name above you are signing this NDA electronically.
                  </span>
                )}
              </label>
              <label className="space-y-2 text-sm font-semibold text-black/74">
                Sign date
                <Input
                  type="date"
                  value={form.signatureDate}
                  onChange={(event) => updateField("signatureDate", event.target.value)}
                  required
                  className="h-12"
                />
              </label>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-[0.75rem] border border-black/10 bg-white p-4 text-sm leading-6 text-black/85">
              <input
                type="checkbox"
                checked={form.requestCopy}
                onChange={(event) => updateField("requestCopy", event.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border border-black/30 accent-[#0A65FF]"
              />
              <span>Check box to receive a copy of the co-signed agreement once fully executed.</span>
            </label>
          </fieldset>

          {/* ACTIONS ----------------------------------------------------- */}
          <div className="flex flex-col gap-3 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition-colors duration-300 hover:bg-black/5"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#0A65FF] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(10,101,255,0.22)] transition-all duration-300 hover:bg-[#004ed1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Execute NDA
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
