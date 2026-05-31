/**
 * VendorApplicationDialog
 * Long-form vendor application: about you, bio, availability, documents.
 * Submits through the `vendor.submit` tRPC mutation, which forwards the
 * structured application plus the Resume / W9 / headshot uploads to the DT
 * Portal (apps.dtapps.io), where they are stored as a VendorApplication row
 * with linked File records.
 */
import { FormEvent, useState } from "react";
import { ArrowRight, Loader2, Paperclip, Plus, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

const buttonBaseClasses =
  "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-normal tracking-[-0.01em] transition-all duration-300";

const variantClasses = {
  primary: "bg-[#0A65FF] text-white shadow-[0_18px_45px_rgba(10,101,255,0.22)] hover:bg-[#004ed1]",
  secondary:
    "border border-black/15 bg-white/60 text-[#111111] hover:border-[#0A65FF] hover:bg-[#0A65FF] hover:text-white",
} as const;

type Variant = keyof typeof variantClasses;

type VendorFormState = {
  name: string;
  email: string;
  role: string;
  personalBio: string;
  companyCv: string;
  hourlyRate: string;
  hoursPerMonth: string;
  availabilityNotes: string;
  additionalSkills: string;
  marketingConsent: boolean;
  nameUsageConsent: boolean;
  signature: string;
};

const initialForm: VendorFormState = {
  name: "",
  email: "",
  role: "",
  personalBio: "",
  companyCv: "",
  hourlyRate: "",
  hoursPerMonth: "",
  availabilityNotes: "",
  additionalSkills: "",
  marketingConsent: false,
  nameUsageConsent: false,
  signature: "",
};

const sectors = [
  "Pharma / Bio-Tech",
  "Accounting",
  "Lending",
  "Insurance",
  "Family Office",
  "Start-Ups",
  "Manufacturing",
  "E-Commerce",
  "Healthcare",
  "Financial Services",
  "Technology",
  "Real Estate",
];

export type SkillGroup = { label: string; items: string[] };

const defaultSkillGroups: SkillGroup[] = [
  { label: "Databases & Data", items: ["SQL", "Sequel Server", "DBA", "Data Warehouse", "MongoDB"] },
  { label: "Cloud Platforms", items: ["AWS", "Azure"] },
  { label: "Analytics & BI", items: ["Data Analytics", "Data Integrity", "Power BI", "Tableau", "Domo"] },
  { label: "Front-end Code", items: ["Html", "Javascript", "React"] },
  { label: "Back-end Code", items: ["Node.js", "PHP", "Python", ".Net"] },
  { label: "Microsoft Stack", items: ["Power Apps", "Sharepoint", "Excel"] },
  { label: "CRM", items: ["Salesforce", "Hubspot", "Zoho", "MS Dynamics 365"] },
  { label: "ERP & Integration", items: ["Netsuite", "Sage", "SAP", "Celligo"] },
  { label: "Accounting & Payments", items: ["Quickbooks", "Xero", "Bill.com", "Stripe", "Avalera"] },
  { label: "HR, Payroll & Recruiting", items: ["Paylocity", "Paychex", "ADP", "Greenhouse"] },
  { label: "CMS & No-code Web", items: ["Wordpress", "Squarespace", "Shopify", "Bubble"] },
  { label: "Wix Ecosystem", items: ["WiX Studio", "WiX Velo", "WiX Blocks", "WiX Bookings"] },
  { label: "Real Estate Tech", items: ["Yardi", "Real Pages", "Appfolio", "MRI", "MDS", "Agora", "Rent Manager", "Timberline"] },
  { label: "Automation & AI", items: ["UI Path", "Blue Prism", "Chat GPT", "Gemini"] },
];

type FileMeta = {
  name: string;
  sizeBytes: number;
  type: string;
  file: File;
} | null;

// 8 MB raw cap per file -- matches the server's base64 limit with headroom.
const MAX_FILE_BYTES = 8 * 1024 * 1024;

// Read a File into a bare base64 string (no data: prefix) for tRPC transport.
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getSourcePage(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname + window.location.search;
}

type VendorApplicationDialogProps = {
  vendorTypeLabel: string; // e.g. "Technology SME"
  context: string; // routing string e.g. "vendor application: Technology SME"
  triggerLabel: string;
  variant?: Variant;
  className?: string;
  skillGroups?: SkillGroup[];
};

export function VendorApplicationDialog({
  vendorTypeLabel,
  context,
  triggerLabel,
  variant = "secondary",
  className = "",
  skillGroups = defaultSkillGroups,
}: VendorApplicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VendorFormState>(initialForm);
  const [resumeFile, setResumeFile] = useState<FileMeta>(null);
  const [w9File, setW9File] = useState<FileMeta>(null);
  const [headshotFile, setHeadshotFile] = useState<FileMeta>(null);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(() => new Set());
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(() => new Set());
  const [certifications, setCertifications] = useState<{ name: string; isCurrent: boolean; provider: string }[]>([]);

  const addCertification = () => {
    setCertifications((current) => [...current, { name: "", isCurrent: true, provider: "" }]);
  };
  const removeCertification = (index: number) => {
    setCertifications((current) => current.filter((_, i) => i !== index));
  };
  const updateCertification = (
    index: number,
    field: "name" | "isCurrent" | "provider",
    value: string | boolean,
  ) => {
    setCertifications((current) =>
      current.map((cert, i) => (i === index ? { ...cert, [field]: value } : cert)),
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((current) => {
      const next = new Set(current);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors((current) => {
      const next = new Set(current);
      if (next.has(sector)) {
        next.delete(sector);
      } else {
        next.add(sector);
      }
      return next;
    });
  };

  const submitVendor = trpc.vendor.submit.useMutation({
    onSuccess: () => {
      setForm(initialForm);
      setResumeFile(null);
      setW9File(null);
      setHeadshotFile(null);
      setSelectedSkills(new Set());
      setSelectedSectors(new Set());
      setCertifications([]);
      setOpen(false);
      toast.success(
        `Application and documents received. Digital Therapy will review your ${vendorTypeLabel} application and follow up directly.`,
      );
    },
    onError: (error) => {
      toast.error(error.message || "We could not submit the application. Please try again.");
    },
  });

  const updateField = <K extends keyof VendorFormState>(field: K, value: VendorFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange =
    (setter: (file: FileMeta) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        setter(null);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} is too large. Max ${MAX_FILE_BYTES / (1024 * 1024)}MB per file.`);
        event.target.value = "";
        setter(null);
        return;
      }
      setter({ name: file.name, sizeBytes: file.size, type: file.type, file });
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selectedSkillList = skillGroups
      .flatMap((group) => group.items)
      .filter((item) => selectedSkills.has(item));

    // Read any attached documents into base64 for transport.
    const fileEntries: { field: "resume" | "w9" | "headshot"; meta: FileMeta }[] = [
      { field: "resume", meta: resumeFile },
      { field: "w9", meta: w9File },
      { field: "headshot", meta: headshotFile },
    ];

    let files: { field: "resume" | "w9" | "headshot"; filename: string; mimeType: string; dataBase64: string }[];
    try {
      files = await Promise.all(
        fileEntries
          .filter((e): e is { field: "resume" | "w9" | "headshot"; meta: NonNullable<FileMeta> } => e.meta !== null)
          .map(async (e) => ({
            field: e.field,
            filename: e.meta.name,
            mimeType: e.meta.type || "application/octet-stream",
            dataBase64: await fileToBase64(e.meta.file),
          })),
      );
    } catch {
      toast.error("We could not read one of your files. Please re-select and try again.");
      return;
    }

    submitVendor.mutate({
      vendorTypeLabel,
      name: form.name,
      email: form.email,
      role: form.role,
      personalBio: form.personalBio,
      companyCv: form.companyCv,
      hourlyRate: form.hourlyRate,
      hoursPerMonth: form.hoursPerMonth,
      availabilityNotes: form.availabilityNotes,
      additionalSkills: form.additionalSkills,
      sectors: Array.from(selectedSectors),
      skills: selectedSkillList,
      certifications: certifications.map((c) => ({
        name: c.name,
        isCurrent: c.isCurrent,
        provider: c.provider,
      })),
      marketingConsent: form.marketingConsent,
      nameUsageConsent: form.nameUsageConsent,
      signature: form.signature,
      context,
      sourcePage: getSourcePage(),
      files,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={`${buttonBaseClasses} ${variantClasses[variant]} ${className}`}>
          {triggerLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] w-full max-w-[95vw] overflow-y-auto border-white/80 bg-[#F7F4EE] p-0 text-[#111111] shadow-[0_42px_120px_rgba(17,17,17,0.28)] sm:max-w-[1100px] sm:rounded-[2rem]">
        <div className="grid gap-0 lg:grid-cols-[0.42fr_1.58fr]">
          <aside className="border-b border-black/10 bg-white/72 p-9 lg:border-b-0 lg:border-r lg:p-11">
            <DialogHeader>
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0A65FF] text-white">
                <UserPlus className="h-5 w-5" />
              </div>
              <DialogTitle className="font-display text-4xl leading-[0.94] tracking-[-0.06em] text-[#111111]">
                Apply as {vendorTypeLabel}.
              </DialogTitle>
              <DialogDescription className="pt-4 text-base leading-7 text-black/80">
                Tell us who you are, what you can do, and when you&rsquo;re available. Digital Therapy reviews every application personally.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-7 rounded-[1.35rem] border border-[#0A65FF]/15 bg-[#0A65FF]/8 p-5">
              <div className="flex gap-3">
                <Paperclip className="mt-0.5 h-5 w-5 shrink-0 text-[#0A65FF]" />
                <div className="text-sm leading-6 text-black/85">
                  <p className="font-semibold">Documents</p>
                  <p className="mt-1 text-black/78">
                    Attach your Resume, W9, and headshot below &mdash; they upload securely with your
                    application (up to 8MB each). Questions? Reach us at{" "}
                    <a className="font-semibold text-[#0A65FF] underline" href="mailto:hello@digitaltherapy.io">
                      hello@digitaltherapy.io
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </aside>
          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-9 lg:p-11">
            <fieldset className="space-y-5">
              <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">About you</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-black/74">
                  Full name
                  <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} required minLength={2} placeholder="Your name" className="h-11" />
                </label>
                <label className="space-y-2 text-sm font-semibold text-black/74">
                  Work email
                  <Input value={form.email} onChange={(event) => updateField("email", event.target.value)} required type="email" placeholder="name@firm.com" className="h-11" />
                </label>
                <label className="space-y-2 text-sm font-semibold text-black/74 sm:col-span-2">
                  Title / role
                  <Input value={form.role} onChange={(event) => updateField("role", event.target.value)} placeholder={`e.g. ${vendorTypeLabel}, Founder, Consultant`} className="h-11" />
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">Bio</legend>
              <label className="block space-y-2 text-sm font-semibold text-black/74">
                Personal bio
                <Textarea
                  value={form.personalBio}
                  onChange={(event) => updateField("personalBio", event.target.value)}
                  required
                  minLength={40}
                  placeholder="Paste your personal bio: experience, specialties, certifications, the kind of work you do best."
                  className="min-h-[160px] resize-none"
                />
              </label>
              <label className="block space-y-2 text-sm font-semibold text-black/74">
                Company CV
                <Textarea
                  value={form.companyCv}
                  onChange={(event) => updateField("companyCv", event.target.value)}
                  placeholder="If you operate through a company, paste your company CV: services, sector experience, representative clients, capabilities."
                  className="min-h-[160px] resize-none"
                />
              </label>
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
                Sector experience{selectedSectors.size > 0 ? ` (${selectedSectors.size} selected)` : ""}
              </legend>
              <p className="-mt-2 text-xs text-black/60">Check every industry you have hands-on experience in.</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {sectors.map((sector) => {
                  const id = `sector-${vendorTypeLabel.replace(/\s+/g, "-")}-${sector.replace(/[^a-zA-Z0-9]/g, "-")}`;
                  const checked = selectedSectors.has(sector);
                  return (
                    <label
                      key={sector}
                      htmlFor={id}
                      className="flex cursor-pointer items-center gap-2 rounded-[0.75rem] border border-black/10 bg-[#F7F4EE]/60 px-3 py-2.5 text-sm leading-5 text-black/85 transition-colors duration-200 hover:border-[#0A65FF]/35"
                    >
                      <input
                        id={id}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSector(sector)}
                        className="h-4 w-4 shrink-0 cursor-pointer rounded border border-black/30 accent-[#0A65FF]"
                      />
                      <span>{sector}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">Availability &amp; rate</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-black/74">
                  Hourly rate (USD)
                  <Input
                    value={form.hourlyRate}
                    onChange={(event) => updateField("hourlyRate", event.target.value)}
                    placeholder="$ / hour"
                    inputMode="decimal"
                    className="h-11"
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-black/74">
                  Available hours / month
                  <Input
                    value={form.hoursPerMonth}
                    onChange={(event) => updateField("hoursPerMonth", event.target.value)}
                    placeholder="e.g. 20, 40, 80"
                    inputMode="numeric"
                    className="h-11"
                  />
                </label>
              </div>
              <label className="block space-y-2 text-sm font-semibold text-black/74">
                Unique availability scenarios
                <Textarea
                  value={form.availabilityNotes}
                  onChange={(event) => updateField("availabilityNotes", event.target.value)}
                  placeholder="Anything we should know — time-zone constraints, seasonal availability, current full-time commitments, project minimums, notice-period requirements, etc."
                  className="min-h-[120px] resize-none"
                />
              </label>
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
                Skills{selectedSkills.size > 0 ? ` (${selectedSkills.size} selected)` : ""}
              </legend>
              <p className="-mt-2 text-xs text-black/60">Check every tool or capability you have hands-on experience with.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {skillGroups.map((group) => (
                  <div key={group.label} className="rounded-[1rem] border border-black/10 bg-[#F7F4EE]/60 p-4">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#0A65FF]">{group.label}</p>
                    <div className="mt-3 space-y-2">
                      {group.items.map((item) => {
                        const id = `skill-${vendorTypeLabel.replace(/\s+/g, "-")}-${item.replace(/[^a-zA-Z0-9]/g, "-")}`;
                        const checked = selectedSkills.has(item);
                        return (
                          <label
                            key={item}
                            htmlFor={id}
                            className="flex cursor-pointer items-center gap-2 text-sm leading-5 text-black/85"
                          >
                            <input
                              id={id}
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSkill(item)}
                              className="h-4 w-4 shrink-0 cursor-pointer rounded border border-black/30 accent-[#0A65FF]"
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <label className="block space-y-2 text-sm font-semibold text-black/74">
                Additional platforms / coding languages
                <Textarea
                  value={form.additionalSkills}
                  onChange={(event) => updateField("additionalSkills", event.target.value)}
                  placeholder="List any other platforms or coding languages you'd like tagged to your profile (e.g. Rust, GoLang, Snowflake, Looker, etc.) — comma-separated is fine."
                  className="min-h-[90px] resize-none"
                />
              </label>
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">
                Certifications{certifications.length > 0 ? ` (${certifications.length} listed)` : ""}
              </legend>
              <p className="-mt-2 text-xs leading-5 text-black/65">
                List your certifications. They are <span className="font-semibold">not required</span> to work with or for us. However, some engagements insist on certified technicians on certain projects or even specific components within a project. In those cases, certifications matter — they help win new business.
              </p>
              {certifications.length === 0 ? (
                <p className="rounded-[1rem] border border-dashed border-black/20 bg-[#F7F4EE]/60 px-4 py-5 text-center text-xs text-black/55">
                  No certifications added yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="grid items-center gap-3 rounded-[1rem] border border-black/10 bg-[#F7F4EE]/60 p-4 sm:grid-cols-[1.2fr_auto_1.2fr_auto]"
                    >
                      <div className="space-y-1">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-black/55">Certification</p>
                        <Input
                          value={cert.name}
                          onChange={(event) => updateCertification(index, "name", event.target.value)}
                          placeholder="e.g. AWS Solutions Architect"
                          className="h-10"
                        />
                      </div>
                      <label className="flex cursor-pointer items-center gap-2 self-end pb-2 text-sm text-black/85 sm:justify-center sm:self-center sm:pb-0">
                        <input
                          type="checkbox"
                          checked={cert.isCurrent}
                          onChange={(event) => updateCertification(index, "isCurrent", event.target.checked)}
                          className="h-4 w-4 shrink-0 cursor-pointer rounded border border-black/30 accent-[#0A65FF]"
                        />
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-black/65">
                          {cert.isCurrent ? "Current" : "Expired"}
                        </span>
                      </label>
                      <div className="space-y-1">
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-black/55">Provider</p>
                        <Input
                          value={cert.provider}
                          onChange={(event) => updateCertification(index, "provider", event.target.value)}
                          placeholder="e.g. Amazon Web Services"
                          className="h-10"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        aria-label={`Remove certification ${index + 1}`}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-full text-black/45 transition-colors duration-200 hover:bg-black/5 hover:text-[#0A65FF] sm:self-center"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={addCertification}
                className="inline-flex items-center gap-2 rounded-full border border-[#0A65FF]/30 bg-[#0A65FF]/8 px-5 py-2.5 text-sm font-semibold text-[#0A65FF] transition-all duration-300 hover:border-[#0A65FF]/55 hover:bg-[#0A65FF]/14"
              >
                <Plus className="h-4 w-4" />
                Add certification
              </button>
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">Documents</legend>
              <p className="-mt-2 text-xs text-black/60">
                Attach each file (up to 8MB) &mdash; they upload securely with your application.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Resume / CV", file: resumeFile, setter: setResumeFile, id: "vendor-resume", accept: ".pdf,.doc,.docx,.txt" },
                  { label: "W9", file: w9File, setter: setW9File, id: "vendor-w9", accept: ".pdf,.jpg,.jpeg,.png" },
                  { label: "Headshot", file: headshotFile, setter: setHeadshotFile, id: "vendor-headshot", accept: "image/*" },
                ].map((field) => (
                  <div key={field.id} className="rounded-[1rem] border border-dashed border-black/20 bg-[#F7F4EE]/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/55">{field.label}</p>
                    <input
                      id={field.id}
                      type="file"
                      accept={field.accept}
                      onChange={handleFileChange(field.setter)}
                      className="mt-3 block w-full text-xs text-black/80 file:mr-3 file:rounded-full file:border-0 file:bg-[#0A65FF] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#004ed1]"
                    />
                    {field.file ? (
                      <p className="mt-3 truncate text-xs text-black/70">
                        <span className="font-semibold">{field.file.name}</span> · {formatBytes(field.file.sizeBytes)}
                      </p>
                    ) : (
                      <p className="mt-3 text-xs text-black/45">No file selected</p>
                    )}
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#0A65FF]">Consent &amp; signature</legend>
              <div className="space-y-3">
                <label className="flex cursor-pointer gap-3 rounded-[1rem] border border-black/10 bg-[#F7F4EE]/60 p-4 text-sm leading-6 text-black/85">
                  <input
                    type="checkbox"
                    checked={form.marketingConsent}
                    onChange={(event) => updateField("marketingConsent", event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border border-black/30 accent-[#0A65FF]"
                  />
                  <span>
                    I grant Digital Therapy, LLC permission to use any data I provided in this form in marketing efforts to source &amp; convert opportunities.
                  </span>
                </label>
                <label className="flex cursor-pointer gap-3 rounded-[1rem] border border-black/10 bg-[#F7F4EE]/60 p-4 text-sm leading-6 text-black/85">
                  <input
                    type="checkbox"
                    checked={form.nameUsageConsent}
                    onChange={(event) => updateField("nameUsageConsent", event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border border-black/30 accent-[#0A65FF]"
                  />
                  <span>
                    I grant permission to use my name &amp; likeness in targeted sales materials and RFPs.
                  </span>
                </label>
              </div>
              <label className="block space-y-2 text-sm font-semibold text-black/74">
                Signature
                <Input
                  value={form.signature}
                  onChange={(event) => updateField("signature", event.target.value)}
                  required
                  minLength={2}
                  placeholder="Type your full name as your digital signature"
                  className="h-11 font-display text-2xl italic tracking-tight"
                />
                <span className="block text-xs font-normal text-black/60">
                  By typing your name above and submitting this form you are signing this application electronically.
                </span>
              </label>
            </fieldset>

            <button
              type="submit"
              disabled={submitVendor.isPending}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0A65FF] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_45px_rgba(10,101,255,0.22)] transition-all duration-300 hover:bg-[#004ed1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitVendor.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Submit application
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
