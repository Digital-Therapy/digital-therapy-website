/**
 * VendorPaymentInfoSection — ACH banking details for a vendor.
 *
 * Displays the saved bank name, routing number, and masked account (last 4).
 * Full account number reveal is OWNER-only. Payment info can be entered by an
 * admin here OR collected via a token-gated public form; the "Send collection
 * link" button generates a URL that Karina can text to the vendor's phone.
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Copy, Eye, KeyRound, Link as LinkIcon, MessageSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = { vendorId: string; vendorName: string };

export function VendorPaymentInfoSection({ vendorId, vendorName }: Props) {
  const utils = trpc.useUtils();
  const infoQuery = trpc.vendor.adminGetPaymentInfo.useQuery({ id: vendorId }, { enabled: vendorId.length > 0 });
  const tokensQuery = trpc.vendor.adminListPaymentTokens.useQuery({ id: vendorId }, { enabled: vendorId.length > 0 });
  const ownerQuery = trpc.access.amIOwner.useQuery();
  const isOwner = ownerQuery.data === true;

  const upsertMutation = trpc.vendor.adminUpsertPaymentInfo.useMutation({
    onSuccess: () => {
      utils.vendor.adminGetPaymentInfo.invalidate({ id: vendorId });
      toast.success("Payment info saved.");
      setEditing(false);
    },
    onError: (e) => toast.error(e.message || "Could not save payment info."),
  });
  const deleteMutation = trpc.vendor.adminDeletePaymentInfo.useMutation({
    onSuccess: () => {
      utils.vendor.adminGetPaymentInfo.invalidate({ id: vendorId });
      toast.success("Payment info removed.");
    },
    onError: (e) => toast.error(e.message || "Could not delete payment info."),
  });
  const revealMutation = trpc.vendor.adminRevealAccountNumber.useMutation({
    onSuccess: (data) => setRevealedAccount(data.accountNumber),
    onError: (e) => toast.error(e.message || "Could not reveal account number."),
  });
  const generateLinkMutation = trpc.vendor.adminGeneratePaymentToken.useMutation({
    onSuccess: (data) => {
      setLinkResult(data);
      utils.vendor.adminListPaymentTokens.invalidate({ id: vendorId });
    },
    onError: (e) => toast.error(e.message || "Could not generate link."),
  });

  const [editing, setEditing] = useState(false);
  const [vendorNameField, setVendorNameField] = useState("");
  const [bankName, setBankName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">("checking");
  const [businessAttested, setBusinessAttested] = useState(false);
  const [revealedAccount, setRevealedAccount] = useState<string | null>(null);
  const [linkResult, setLinkResult] = useState<{ url: string; expiresAt: string } | null>(null);

  const info = infoQuery.data;
  const canSave =
    vendorNameField.trim().length >= 2 &&
    bankName.trim().length >= 2 &&
    /^\d{9}$/.test(routingNumber.replace(/\s+/g, "")) &&
    accountNumber.replace(/\s+/g, "").length >= 4 &&
    accountNumber.replace(/\s+/g, "") === confirmAccount.replace(/\s+/g, "") &&
    businessAttested;

  const startEdit = () => {
    setVendorNameField(info?.vendorName ?? vendorName);
    setBankName(info?.bankName ?? "");
    setRoutingNumber(info?.routingNumber ?? "");
    setAccountNumber("");
    setConfirmAccount("");
    setAccountType(info?.accountType ?? "checking");
    setBusinessAttested(false);
    setEditing(true);
  };

  const save = () => {
    if (!canSave) return;
    upsertMutation.mutate({
      id: vendorId,
      vendorName: vendorNameField.trim(),
      bankName: bankName.trim(),
      routingNumber: routingNumber.replace(/\s+/g, ""),
      accountNumber: accountNumber.replace(/\s+/g, ""),
      accountType,
      businessAccountAttested: businessAttested,
    });
  };

  const remove = () => {
    if (!confirm("Delete this vendor's payment info? This cannot be undone.")) return;
    deleteMutation.mutate({ id: vendorId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payment info (ACH)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {/* Saved info summary */}
        {info ? (
          <div className="space-y-3 rounded-lg border border-black/10 bg-white p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryField label="Vendor name" value={info.vendorName ?? "—"} />
              <SummaryField label="Bank" value={info.bankName} />
              <SummaryField label="Routing number" value={info.routingNumber} mono />
              <SummaryField
                label={`Account (${info.accountType})`}
                value={revealedAccount ?? `••••${info.accountNumberLast4}`}
                mono
              />
            </div>
            {info.businessAccountAttestedAt && (
              <p className="text-[0.7rem] font-medium text-black/50">
                Vendor attested this is a business account on{" "}
                {new Date(info.businessAccountAttestedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                .
              </p>
            )}
            <p className="flex flex-wrap items-center gap-2 text-xs text-black/50">
              <span>
                Last updated {new Date(info.updatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                {" · "}
                Entered via{" "}
                <span className="font-medium">
                  {info.createdVia === "vendor_self_service" ? "vendor link" : "admin"}
                </span>
              </span>
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={startEdit}>
                Edit
              </Button>
              {isOwner && !revealedAccount && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revealMutation.mutate({ id: vendorId })}
                  disabled={revealMutation.isPending}
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Reveal full account
                </Button>
              )}
              {revealedAccount && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(revealedAccount);
                    toast.success("Copied.");
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy account #
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={remove}
                className="text-[#c83a3a] hover:bg-[#c83a3a]/10 hover:text-[#c83a3a]"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
            {!isOwner && (
              <p className="flex items-center gap-1.5 text-[0.7rem] text-black/45">
                <KeyRound className="h-3 w-3" />
                Full account number reveal is owner-only (Milton / hello@).
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-black/15 bg-white/50 p-6 text-center text-sm text-black/55">
            No payment info on file yet.
          </div>
        )}

        {/* Editor */}
        {editing && (
          <div className="space-y-4 rounded-lg border border-[#0A65FF]/25 bg-[#0A65FF]/[0.04] p-4">
            <p className="text-sm font-medium text-[#111111]">
              {info ? "Update payment info" : "Enter payment info"}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-xs font-medium text-black/70">Vendor / business name</span>
                <Input value={vendorNameField} onChange={(e) => setVendorNameField(e.target.value)} />
              </Label>
              <Label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-black/70">Bank name</span>
                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Chase, Wells Fargo, etc." />
              </Label>
              <fieldset className="flex flex-col gap-1.5">
                <legend className="text-xs font-medium text-black/70">Account type</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["checking", "savings"] as const).map((type) => {
                    const active = accountType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAccountType(type)}
                        className={`h-9 rounded-md border px-3 text-sm font-medium capitalize transition-colors ${
                          active
                            ? "border-[#0A65FF] bg-[#0A65FF] text-white"
                            : "border-black/15 bg-white text-black/75 hover:border-black/30"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <Label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-black/70">Routing number (9 digits)</span>
                <Input
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="123456789"
                />
              </Label>
              <Label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-black/70">Account number</span>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  inputMode="numeric"
                  maxLength={20}
                  autoComplete="off"
                />
              </Label>
              <Label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-black/70">Confirm account number</span>
                <Input
                  value={confirmAccount}
                  onChange={(e) => setConfirmAccount(e.target.value)}
                  inputMode="numeric"
                  maxLength={20}
                  autoComplete="off"
                />
              </Label>
            </div>
            {accountNumber && confirmAccount && accountNumber !== confirmAccount && (
              <p className="text-xs text-[#c83a3a]">Account numbers do not match.</p>
            )}
            <label className="flex cursor-pointer items-start gap-2 rounded-md border border-black/10 bg-white p-3">
              <input
                type="checkbox"
                checked={businessAttested}
                onChange={(e) => setBusinessAttested(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/30 text-[#0A65FF] focus:ring-[#0A65FF]"
              />
              <span className="text-xs leading-5 text-black/75">
                I confirm this is a <strong>business bank account</strong> — not a personal account.
              </span>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={!canSave || upsertMutation.isPending}>
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Send collection link */}
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <p className="flex items-center gap-2 text-sm font-medium text-[#111111]">
                <LinkIcon className="h-4 w-4 text-[#0A65FF]" />
                Send collection link
              </p>
              <p className="mt-1 text-xs leading-5 text-black/60">
                Generates a single-use, 7-day link for {vendorName} to enter their bank info from their phone.
                Text or email the link — the form auto-fits their screen.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => generateLinkMutation.mutate({ id: vendorId })}
              disabled={generateLinkMutation.isPending}
              className="sm:shrink-0"
            >
              Generate link
            </Button>
          </div>
        </div>

        {/* Token history */}
        {tokensQuery.data && tokensQuery.data.length > 0 && (
          <div className="rounded-lg border border-black/10 bg-white p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-black/55">Link history</p>
            <div className="divide-y divide-black/5">
              {tokensQuery.data.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 text-xs">
                  <span className="text-black/70">
                    Sent {new Date(t.createdAt).toLocaleString(undefined, { month: "short", day: "numeric" })}
                    {" · expires "}
                    {new Date(t.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                  {t.usedAt ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[0.65rem] font-semibold text-green-800">
                      <CheckCircle2 className="h-3 w-3" />
                      Submitted
                    </span>
                  ) : new Date(t.expiresAt).getTime() < Date.now() ? (
                    <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[0.65rem] font-semibold text-black/55">
                      Expired
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#0A65FF]/10 px-2 py-0.5 text-[0.65rem] font-semibold text-[#0040c9]">
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Link ready dialog */}
      <Dialog open={linkResult !== null} onOpenChange={(v) => !v && setLinkResult(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Collection link ready</DialogTitle>
          </DialogHeader>
          {linkResult && (
            <div className="space-y-5 pt-2">
              <p className="text-sm text-black/70">
                Text or email this link to <strong>{vendorName}</strong>. It expires{" "}
                {new Date(linkResult.expiresAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                and can be used once.
              </p>
              <div className="flex items-stretch gap-2">
                <Input value={linkResult.url} readOnly className="font-mono text-xs" />
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(linkResult.url);
                    toast.success("Link copied.");
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href={`sms:?&body=${encodeURIComponent(
                    `Hi ${vendorName.split(" ")[0]}, please use this secure link to enter your bank info for Digital Therapy payments: ${linkResult.url}`,
                  )}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0A65FF] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0040c9]"
                >
                  <MessageSquare className="h-4 w-4" />
                  Open in Messages
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(
                    "Digital Therapy — Enter your payment info",
                  )}&body=${encodeURIComponent(
                    `Hi ${vendorName.split(" ")[0]},\n\nPlease use this secure link to enter your bank info so Digital Therapy can pay you for project work:\n\n${linkResult.url}\n\nThe link is single-use and expires in 7 days.\n\nThank you,\nDigital Therapy`,
                  )}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black/80 transition-colors hover:border-black/30 hover:bg-black/5"
                >
                  Open in Mail
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function SummaryField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-black/45">{label}</p>
      <p className={`mt-1 text-sm text-[#111111] ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
