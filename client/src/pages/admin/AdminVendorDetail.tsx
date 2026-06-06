/**
 * Admin vendor detail — full profile, searchable tags, team, certifications,
 * file metadata, case studies, and the pipeline status control.
 */
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ActiveClientEngagements } from "./VendorEngagements";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, FileText, Loader2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useRoute } from "wouter";

const STATUSES = ["applied", "screening", "approved", "onboarded", "archived"] as const;
type Status = (typeof STATUSES)[number];

const ALL_CATEGORIES = ["Technology", "Finance & Accounting", "Marketing", "Family Office"];

const STATUS_STYLES: Record<string, string> = {
  applied: "bg-black/8 text-black/70",
  screening: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  onboarded: "bg-emerald-100 text-emerald-800",
  archived: "bg-black/10 text-black/45",
};

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminVendorDetail() {
  const [, params] = useRoute("/vendorlists/:id");
  const id = params?.id ?? "";
  const utils = trpc.useUtils();
  const detailQuery = trpc.vendor.adminGet.useQuery({ id }, { enabled: id.length > 0 });

  const [status, setStatus] = useState<Status>("applied");
  const [notes, setNotes] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const emptyProfile = { companyName: "", companyAddress: "", websiteUrl: "", personalLinkedin: "", companySocial: "" };
  const [profile, setProfile] = useState(emptyProfile);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeEngaged, setActiveEngaged] = useState(false);
  const [coreTeam, setCoreTeam] = useState(false);

  const data = detailQuery.data;
  const syncProfile = () => {
    if (data?.vendor) {
      setProfile({
        companyName: data.vendor.companyName ?? "",
        companyAddress: data.vendor.companyAddress ?? "",
        websiteUrl: data.vendor.websiteUrl ?? "",
        personalLinkedin: data.vendor.personalLinkedin ?? "",
        companySocial: data.vendor.companySocial ?? "",
      });
    }
  };
  useEffect(() => {
    if (data?.vendor) {
      setStatus(data.vendor.status as Status);
      setNotes(data.vendor.statusNotes ?? "");
      setProfile({
        companyName: data.vendor.companyName ?? "",
        companyAddress: data.vendor.companyAddress ?? "",
        websiteUrl: data.vendor.websiteUrl ?? "",
        personalLinkedin: data.vendor.personalLinkedin ?? "",
        companySocial: data.vendor.companySocial ?? "",
      });
      setCategories(data.vendor.categories ?? []);
      setActiveEngaged(data.vendor.activeEngaged ?? false);
      setCoreTeam(data.vendor.coreTeam ?? false);
    }
  }, [data?.vendor]);

  const setActiveEngagedMutation = trpc.vendor.adminSetActiveEngaged.useMutation({
    onSuccess: () => {
      utils.vendor.adminGet.invalidate({ id });
      utils.vendor.adminSearch.invalidate();
    },
    onError: (e) => toast.error(e.message || "Could not update engagement flag."),
  });
  const toggleActiveEngaged = (checked: boolean) => {
    setActiveEngaged(checked);
    setActiveEngagedMutation.mutate({ id, active: checked });
  };

  const setCoreTeamMutation = trpc.vendor.adminSetCoreTeam.useMutation({
    onSuccess: () => {
      utils.vendor.adminGet.invalidate({ id });
      utils.vendor.adminSearch.invalidate();
      utils.vendor.adminBriefList.invalidate();
    },
    onError: (e) => toast.error(e.message || "Could not update core-team flag."),
  });
  const toggleCoreTeam = (checked: boolean) => {
    setCoreTeam(checked);
    setCoreTeamMutation.mutate({ id, coreTeam: checked });
  };

  const updateCategories = trpc.vendor.adminUpdateCategories.useMutation({
    onSuccess: () => {
      utils.vendor.adminGet.invalidate({ id });
      utils.vendor.adminSearch.invalidate();
    },
    onError: (e) => toast.error(e.message || "Could not update categories."),
  });

  const appliedCategory = data?.vendor.appliedCategory ?? null;
  const toggleCategory = (cat: string) => {
    if (cat === appliedCategory) return; // applied category is always included
    const next = categories.includes(cat) ? categories.filter((c) => c !== cat) : [...categories, cat];
    setCategories(next);
    updateCategories.mutate({ id, categories: next as ("Technology" | "Finance & Accounting" | "Marketing" | "Family Office")[] });
  };

  const updateProfile = trpc.vendor.adminUpdateProfile.useMutation({
    onSuccess: () => {
      toast.success("Company & links updated.");
      utils.vendor.adminGet.invalidate({ id });
      utils.vendor.adminSearch.invalidate();
      setEditingProfile(false);
    },
    onError: (e) => toast.error(e.message || "Could not save company & links."),
  });

  const updateStatus = trpc.vendor.adminUpdateStatus.useMutation({
    onSuccess: () => {
      toast.success("Vendor status updated.");
      utils.vendor.adminGet.invalidate({ id });
      utils.vendor.adminSearch.invalidate();
    },
    onError: (e) => toast.error(e.message || "Could not update status."),
  });

  const [, navigate] = useLocation();
  const setRemoved = trpc.vendor.adminSetRemoved.useMutation({
    onSuccess: (_res, vars) => {
      utils.vendor.adminSearch.invalidate();
      utils.vendor.adminFacets.invalidate();
      if (vars.removed) {
        toast.success("Vendor removed from your workspace.");
        navigate("/vendorlists");
      } else {
        toast.success("Vendor restored.");
        utils.vendor.adminGet.invalidate({ id });
      }
    },
    onError: (e) => toast.error(e.message || "Could not update vendor."),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Link href="/vendorlists" className="inline-flex items-center gap-1.5 text-sm text-black/60 hover:text-[#0A65FF]">
          <ArrowLeft className="h-4 w-4" />
          Back to inventory
        </Link>

        {detailQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !data ? (
          <div className="rounded-2xl border border-black/10 bg-white p-16 text-center">
            <p className="text-sm font-medium text-black/70">Vendor not found</p>
            <p className="mt-1 text-xs text-black/45">It may have been removed, or the link is incorrect.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-3xl tracking-[-0.05em]">{data.vendor.name}</h1>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      STATUS_STYLES[data.vendor.status] ?? "bg-black/8 text-black/70"
                    }`}
                  >
                    {data.vendor.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-black/60">
                  {data.vendor.vendorTypeLabel} · {data.vendor.email}
                  {data.vendor.role ? ` · ${data.vendor.role}` : ""}
                </p>
                {data.applicationsFromEmail > 1 && (
                  <p className="mt-1 text-xs font-medium text-amber-700">
                    {data.applicationsFromEmail} applications on file from this email.
                  </p>
                )}
                {data.vendor.removed ? (
                  <p className="mt-1 text-xs font-medium text-black/45">Removed from your workspace.</p>
                ) : null}
              </div>
              {data.vendor.removed ? (
                <Button variant="outline" onClick={() => setRemoved.mutate({ id, removed: false })}>
                  Restore to workspace
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    if (confirm(`Remove "${data.vendor.name}" from your vendor workspace? You can restore it later.`))
                      setRemoved.mutate({ id, removed: true });
                  }}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Remove from workspace
                </Button>
              )}
            </div>

            {/* Pipeline status control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vendor List Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="w-48">
                    <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => updateStatus.mutate({ id, status, statusNotes: notes })}
                    disabled={updateStatus.isPending}
                  >
                    {updateStatus.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save status
                  </Button>
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes on this candidate (interview impressions, fit, follow-ups)…"
                  className="min-h-[80px] resize-none"
                />
              </CardContent>
            </Card>

            {/* Category tags — drive which category filters/searches this vendor
                appears under. The applied category is always included. */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-black/55">
                  Tag this vendor into every discipline they can deliver — they&rsquo;ll surface under each
                  category&rsquo;s filter and searches. Their applied category is locked on.
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const checked = categories.includes(cat);
                    const isApplied = cat === appliedCategory;
                    return (
                      <button
                        key={cat}
                        type="button"
                        disabled={isApplied || updateCategories.isPending}
                        onClick={() => toggleCategory(cat)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          checked
                            ? "border-[#0A65FF] bg-[#0A65FF] text-white"
                            : "border-black/15 bg-white text-black/70 hover:border-[#0A65FF]/40 hover:text-[#0A65FF]"
                        } ${isApplied ? "cursor-default opacity-95" : ""}`}
                      >
                        {checked ? <Check className="h-3.5 w-3.5" /> : null}
                        {cat}
                        {isApplied ? (
                          <span className="ml-0.5 text-[0.6rem] font-bold uppercase tracking-wide opacity-80">applied</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Live-engagement gate → reveals the Active Client Engagements section. */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team &amp; engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <Checkbox checked={coreTeam} onCheckedChange={(v) => toggleCoreTeam(v === true)} />
                  <span>
                    <strong>Core team member</strong> — a vendor for whom Digital Therapy is their primary client.
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <Checkbox checked={activeEngaged} onCheckedChange={(v) => toggleActiveEngaged(v === true)} />
                  <span>This vendor is currently active on live Digital Therapy engagements.</span>
                </label>
              </CardContent>
            </Card>

            {activeEngaged ? <ActiveClientEngagements vendorId={id} /> : null}

            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="team">Team ({data.teamMembers.length})</TabsTrigger>
                <TabsTrigger value="certs">Certifications ({data.certifications.length})</TabsTrigger>
                <TabsTrigger value="files">Files ({data.files.length})</TabsTrigger>
                <TabsTrigger value="cases">Case studies ({data.caseStudies.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Company &amp; links</CardTitle>
                      {!editingProfile ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            syncProfile();
                            setEditingProfile(true);
                          }}
                          className="text-black/60"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingProfile ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <EditField
                          label="Company name"
                          value={profile.companyName}
                          placeholder="Company name"
                          onChange={(v) => setProfile((p) => ({ ...p, companyName: v }))}
                        />
                        <EditField
                          label="Company address (for the NDA)"
                          value={profile.companyAddress}
                          placeholder="123 Main St, Suite 100, City, ST 00000"
                          onChange={(v) => setProfile((p) => ({ ...p, companyAddress: v }))}
                        />
                        <EditField
                          label="Website URL"
                          value={profile.websiteUrl}
                          placeholder="https://company.com"
                          onChange={(v) => setProfile((p) => ({ ...p, websiteUrl: v }))}
                        />
                        <EditField
                          label="Personal LinkedIn"
                          value={profile.personalLinkedin}
                          placeholder="https://linkedin.com/in/…"
                          onChange={(v) => setProfile((p) => ({ ...p, personalLinkedin: v }))}
                        />
                        <EditField
                          label="Company LinkedIn / Instagram"
                          value={profile.companySocial}
                          placeholder="https://linkedin.com/company/… or instagram.com/…"
                          onChange={(v) => setProfile((p) => ({ ...p, companySocial: v }))}
                        />
                        <div className="flex gap-2 sm:col-span-2">
                          <Button
                            onClick={() => updateProfile.mutate({ id, ...profile })}
                            disabled={updateProfile.isPending}
                          >
                            {updateProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              syncProfile();
                              setEditingProfile(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Company name" value={data.vendor.companyName} />
                        <Field label="Company address" value={data.vendor.companyAddress} />
                        <LinkField label="Website" value={data.vendor.websiteUrl} />
                        <LinkField label="Personal LinkedIn" value={data.vendor.personalLinkedin} />
                        <LinkField label="Company LinkedIn / Instagram" value={data.vendor.companySocial} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.skills.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {data.skills.map((s) => (
                          <Badge key={s.id} variant="secondary" className="font-normal">
                            {s.skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Empty>No skills tagged.</Empty>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sectors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.sectors.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {data.sectors.map((s) => (
                          <Badge key={s.id} variant="outline" className="font-normal">
                            {s.sector}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Empty>No sectors tagged.</Empty>
                    )}
                  </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Hourly rate" value={data.vendor.hourlyRate} />
                  <Field label="Hours / month" value={data.vendor.hoursPerMonth} />
                  <Field label="Team size" value={data.vendor.teamSize} />
                  <Field label="Source page" value={data.vendor.sourcePage} />
                </div>

                <LongField label="Personal bio" value={data.vendor.personalBio} />
                <LongField label="Company CV" value={data.vendor.companyCv} />
                <LongField label="Availability notes" value={data.vendor.availabilityNotes} />
                <LongField label="Additional skills (free text)" value={data.vendor.additionalSkills} />
              </TabsContent>

              <TabsContent value="team">
                <Card>
                  <CardContent className="pt-6">
                    {data.teamMembers.length ? (
                      <div className="space-y-3">
                        {data.teamMembers.map((m) => (
                          <div key={m.id} className="rounded-lg border border-black/10 p-3 text-sm">
                            <div className="font-medium">{m.fullName || "—"}</div>
                            <div className="text-black/60">
                              {[m.title, m.roleSkills, m.location].filter(Boolean).join(" · ")}
                            </div>
                            {m.yearsTogether && (
                              <div className="text-xs text-black/45">{m.yearsTogether} yr(s) working together</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty>No team members listed.</Empty>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certs">
                <Card>
                  <CardContent className="pt-6">
                    {data.certifications.length ? (
                      <div className="space-y-2">
                        {data.certifications.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between rounded-lg border border-black/10 p-3 text-sm"
                          >
                            <div>
                              <div className="font-medium">{c.name}</div>
                              {c.provider && <div className="text-xs text-black/55">{c.provider}</div>}
                            </div>
                            <Badge variant={c.isCurrent ? "secondary" : "outline"} className="font-normal">
                              {c.isCurrent ? "Current" : "Expired"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty>No certifications listed.</Empty>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files">
                <Card>
                  <CardContent className="pt-6">
                    {data.files.length ? (
                      <div className="space-y-2">
                        {data.files.map((f) => (
                          <div key={f.id} className="flex items-center gap-3 rounded-lg border border-black/10 p-3 text-sm">
                            <FileText className="h-4 w-4 text-black/40" />
                            <div className="flex-1">
                              <div className="font-medium capitalize">{f.field}</div>
                              <div className="text-xs text-black/55">
                                {f.filename} {f.sizeBytes ? `· ${formatBytes(f.sizeBytes)}` : ""}
                              </div>
                            </div>
                            <span className="text-xs text-black/40">stored in portal</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty>No files attached.</Empty>
                    )}
                    <p className="mt-4 text-xs text-black/45">
                      File binaries are stored in the DT Portal. Local storage of attachments is a planned
                      enhancement.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cases">
                <Card>
                  <CardContent className="pt-6">
                    {data.caseStudies.length ? (
                      <div className="space-y-3">
                        {data.caseStudies.map((c) => (
                          <div key={c.id} className="rounded-lg border border-black/10 p-3 text-sm">
                            <div className="font-medium">{c.title}</div>
                            {c.summary && <p className="mt-1 text-black/60">{c.summary}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty>No case studies yet. (Admin-entered case studies arrive in a later phase.)</Empty>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-3">
      <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-black/45">{label}</div>
      <div className="mt-1 text-sm text-black/80">{value || "—"}</div>
    </div>
  );
}

function EditField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-black/45">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-10" />
    </label>
  );
}

function LinkField({ label, value }: { label: string; value: string | null }) {
  const href = value ? (/^https?:\/\//i.test(value) ? value : `https://${value}`) : null;
  return (
    <div className="rounded-lg border border-black/10 bg-white p-3">
      <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-black/45">{label}</div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block truncate text-sm font-medium text-[#0A65FF] hover:underline"
        >
          {value}
        </a>
      ) : (
        <div className="mt-1 text-sm text-black/80">—</div>
      )}
    </div>
  );
}

function LongField({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-6 text-black/75">{value}</p>
      </CardContent>
    </Card>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-black/45">{children}</p>;
}
