/**
 * Offer Letters — send Vendor Program members their offers for a signed client
 * engagement. Fill the engagement fact sheet, paste the vendor line items from
 * the "Vendor Offer Letter & Onboarding Kit" doc, preview, then "Send Offer
 * Letters": each vendor gets an email with a "Click to accept offer" link
 * (/offer/:token). Below, every offer's progress: signed, ACH, onboarding.
 */
import AdminLayout from "@/components/AdminLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { parseVendorRows, renderOfferLetter, type OfferEngagement } from "@shared/offerTemplate";
import { Copy, Loader2, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const EMPTY: OfferEngagement = {
  clientName: "",
  clientObjective: "",
  projectName: "",
  kickoffDate: "",
  completionDate: "",
  projectLead: "",
  responseDeadline: "",
  paymentTerms: "",
};

const FIELDS: { key: keyof OfferEngagement; label: string; long?: boolean }[] = [
  { key: "clientName", label: "Client name" },
  { key: "projectName", label: "Project name" },
  { key: "clientObjective", label: "Client objective (“Client seeks to …”)", long: true },
  { key: "kickoffDate", label: "Kickoff date" },
  { key: "completionDate", label: "Target completion" },
  { key: "projectLead", label: "DT project lead (name, email)" },
  { key: "responseDeadline", label: "Response deadline" },
  { key: "paymentTerms", label: "Payment terms" },
];

const when = (d: string | null) => (d ? new Date(d).toLocaleDateString() : "—");

export default function AdminOffers() {
  const utils = trpc.useUtils();
  const listQuery = trpc.offers.adminList.useQuery(undefined, { retry: false });
  const [engagement, setEngagement] = useState<OfferEngagement>(EMPTY);
  const [pasted, setPasted] = useState("");
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [previewIdx, setPreviewIdx] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const parsed = useMemo(() => parseVendorRows(pasted), [pasted]);
  const rows = parsed.filter((_, i) => !removed.has(i));
  const preview = rows[Math.min(previewIdx, rows.length - 1)];

  const send = trpc.offers.adminSend.useMutation({
    onSuccess: (r) => {
      utils.offers.adminList.invalidate();
      const notEmailed = r.sent.filter((s) => !s.emailed).length;
      toast.success(`Sent ${r.sent.length} offer${r.sent.length === 1 ? "" : "s"}.`);
      if (notEmailed) toast.warning(`${notEmailed} email(s) didn't go out. Copy their links from the list below.`);
      if (r.skipped.length)
        toast.error(`Skipped ${r.skipped.length}: ${r.skipped.map((s) => `${s.vendorName || s.vendorEmail} (${s.reason})`).join("; ")}`);
      if (!r.skipped.length) {
        setPasted("");
        setRemoved(new Set());
      }
    },
    onError: (e) => toast.error(e.message || "Could not send offers."),
  });
  const voidOffer = trpc.offers.adminVoid.useMutation({ onSuccess: () => utils.offers.adminList.invalidate() });

  const missingEmail = rows.filter((r) => !r.vendorEmail).length;
  const canSend = engagement.clientName.trim().length > 0 && rows.length > 0 && missingEmail === 0 && !send.isPending;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl tracking-[-0.04em]">Offer Letters</h1>
          <p className="mt-1 text-sm text-black/60">
            Invite Vendor Program members onto a signed engagement. Each vendor e-signs, confirms ACH, then books tech
            onboarding with Milton.
          </p>
        </div>

        <section className="grid gap-4 rounded-2xl border border-black/10 bg-white p-6 sm:grid-cols-2">
          <h2 className="font-display text-xl tracking-[-0.04em] sm:col-span-2">1. Engagement fact sheet</h2>
          {FIELDS.map((f) => (
            <Label key={f.key} className={`flex flex-col gap-2 ${f.long ? "sm:col-span-2" : ""}`}>
              <span className="text-sm font-medium">{f.label}</span>
              {f.long ? (
                <Textarea
                  value={engagement[f.key]}
                  onChange={(e) => setEngagement({ ...engagement, [f.key]: e.target.value })}
                  rows={3}
                />
              ) : (
                <Input value={engagement[f.key]} onChange={(e) => setEngagement({ ...engagement, [f.key]: e.target.value })} />
              )}
            </Label>
          ))}
        </section>

        <section className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="font-display text-xl tracking-[-0.04em]">2. Vendor line items</h2>
          <p className="text-sm text-black/60">
            Copy the rows of the doc's Vendor line items table and paste them here. The Vendor cell needs the vendor's
            name and the email on their Vendor Program profile.
          </p>
          <Textarea
            value={pasted}
            onChange={(e) => {
              setPasted(e.target.value);
              setRemoved(new Set());
              setPreviewIdx(0);
            }}
            rows={5}
            placeholder={"Jane Doe, jane@example.com\tForensic Accountant\tHourly x est. hours\t40 h × $100/h\t40 h × $90/h\t$3,600"}
            className="font-mono text-xs"
          />
          {parsed.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-black/50">
                  <tr>
                    <th className="py-2 pr-3">Vendor</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Role</th>
                    <th className="py-2 pr-3">Pricing</th>
                    <th className="py-2 pr-3">Requested</th>
                    <th className="py-2 pr-3">Offered</th>
                    <th className="py-2 pr-3">Total</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((r, i) =>
                    removed.has(i) ? null : (
                      <tr key={i} className="border-t border-black/5">
                        <td className="py-2 pr-3 font-medium">{r.vendorName}</td>
                        <td className={`py-2 pr-3 ${r.vendorEmail ? "" : "text-red-600"}`}>{r.vendorEmail || "missing"}</td>
                        <td className="py-2 pr-3">{r.role}</td>
                        <td className="py-2 pr-3">{r.pricingModel}</td>
                        <td className="py-2 pr-3">{r.requested}</td>
                        <td className="py-2 pr-3">{r.offered}</td>
                        <td className="py-2 pr-3">{r.offeredTotal}</td>
                        <td className="py-2 text-right">
                          <Button variant="ghost" size="sm" onClick={() => setRemoved(new Set(removed).add(i))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        {preview ? (
          <section className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl tracking-[-0.04em]">3. Preview</h2>
              <div className="flex flex-wrap gap-1">
                {rows.map((r, i) => (
                  <Button key={i} size="sm" variant={preview === r ? "default" : "outline"} onClick={() => setPreviewIdx(i)}>
                    {r.vendorName || r.vendorEmail}
                  </Button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-black/10 bg-[#F7F4EE] p-5 text-sm leading-6">
              {renderOfferLetter(engagement, preview).map((p, i) => (
                <p key={i} className={i ? "mt-3" : ""}>
                  {p}
                </p>
              ))}
              <p className="mt-4">
                <span className="inline-block rounded-lg bg-[#0A65FF] px-4 py-2 font-semibold text-white">Click to accept offer</span>
              </p>
            </div>
            {missingEmail ? <p className="text-sm text-red-600">Add an email for every vendor before sending.</p> : null}
            <Button size="lg" disabled={!canSend} onClick={() => setConfirmOpen(true)}>
              {send.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Offer Letters
            </Button>
          </section>
        ) : null}

        <section className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="font-display text-xl tracking-[-0.04em]">Sent offers</h2>
          {listQuery.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-black/40" />
          ) : !listQuery.data?.length ? (
            <p className="text-sm text-black/60">No offers sent yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-black/50">
                  <tr>
                    <th className="py-2 pr-3">Vendor</th>
                    <th className="py-2 pr-3">Engagement</th>
                    <th className="py-2 pr-3">Total</th>
                    <th className="py-2 pr-3">Sent</th>
                    <th className="py-2 pr-3">Signed</th>
                    <th className="py-2 pr-3">ACH</th>
                    <th className="py-2 pr-3">Onboarding</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {listQuery.data.map((o) => (
                    <tr key={o.id} className="border-t border-black/5">
                      <td className="py-2 pr-3">
                        <div className="font-medium">{o.vendorName}</div>
                        <div className="text-xs text-black/50">{o.vendorEmail}</div>
                      </td>
                      <td className="py-2 pr-3">
                        {o.clientName}
                        {o.projectName ? <div className="text-xs text-black/50">{o.projectName}</div> : null}
                      </td>
                      <td className="py-2 pr-3">{o.offeredTotal}</td>
                      <td className="py-2 pr-3">{when(o.sentAt)}</td>
                      <td className="py-2 pr-3">
                        {o.status === "void" ? <Badge variant="outline">Withdrawn</Badge> : when(o.signedAt)}
                      </td>
                      <td className="py-2 pr-3">{when(o.achConfirmedAt)}</td>
                      <td className="py-2 pr-3">{o.bookingOpenedAt ? `Opened ${when(o.bookingOpenedAt)}` : "—"}</td>
                      <td className="whitespace-nowrap py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Copy acceptance link"
                          onClick={() => navigator.clipboard.writeText(o.link).then(() => toast.success("Link copied."))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {!o.signedAt && o.status !== "void" ? (
                          <Button variant="ghost" size="sm" title="Withdraw offer" onClick={() => voidOffer.mutate({ id: o.id })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Send {rows.length} offer letter{rows.length === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Each vendor below will get an email for {engagement.clientName} with a "Click to accept offer" link:
              {" "}
              {rows.map((r) => r.vendorName || r.vendorEmail).join(", ")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => send.mutate({ engagement, rows })}>Send</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
