/**
 * VendorPaymentForm — public, token-gated. Vendors land here from a link
 * texted or emailed by the admin, enter their bank/routing/account numbers,
 * and submit. Mobile-first (that's the primary channel).
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";

export default function VendorPaymentForm() {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";
  const tokenQuery = trpc.vendorPayment.lookupToken.useQuery({ token }, { enabled: token.length > 0, retry: false });

  const [bankName, setBankName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = trpc.vendorPayment.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => setError(e.message || "Something went wrong. Please try again."),
  });

  const canSubmit =
    bankName.trim().length >= 2 &&
    /^\d{9}$/.test(routingNumber.replace(/\s+/g, "")) &&
    accountNumber.replace(/\s+/g, "").length >= 4 &&
    accountNumber.replace(/\s+/g, "") === confirmAccount.replace(/\s+/g, "");

  const submit = () => {
    if (!canSubmit) return;
    setError(null);
    submitMutation.mutate({
      token,
      bankName: bankName.trim(),
      routingNumber: routingNumber.replace(/\s+/g, ""),
      accountNumber: accountNumber.replace(/\s+/g, ""),
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-[#111111]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
          <img src="/dtlogo.png" alt="Digital Therapy" className="h-10 w-auto object-contain" />
          <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#0040c9]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 py-8 sm:py-12">
        {submitted ? (
          <SuccessState />
        ) : tokenQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-black/40" />
          </div>
        ) : tokenQuery.data?.ok !== true ? (
          <InvalidTokenState reason={tokenQuery.data?.reason ?? "not_found"} />
        ) : (
          <>
            <div className="mb-6">
              <h1 className="font-display text-[2rem] leading-[1.1] tracking-[-0.03em] sm:text-[2.5rem]">
                Enter your payment info.
              </h1>
              <p className="mt-3 text-base leading-7 text-black/70">
                So Digital Therapy can pay you via ACH for project work. This link is single-use — please
                complete it in one sitting.
              </p>
            </div>

            <div className="space-y-5 rounded-2xl border border-black/10 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-6">
              <Label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#111111]">Bank name</span>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Chase, Wells Fargo, etc."
                  autoComplete="off"
                />
              </Label>
              <Label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#111111]">Routing number</span>
                <Input
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="9 digits"
                  autoComplete="off"
                />
                <span className="text-xs text-black/50">Your bank&rsquo;s 9-digit routing number.</span>
              </Label>
              <Label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#111111]">Account number</span>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  inputMode="numeric"
                  maxLength={20}
                  autoComplete="off"
                />
              </Label>
              <Label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#111111]">Confirm account number</span>
                <Input
                  value={confirmAccount}
                  onChange={(e) => setConfirmAccount(e.target.value)}
                  inputMode="numeric"
                  maxLength={20}
                  autoComplete="off"
                />
                {accountNumber && confirmAccount && accountNumber !== confirmAccount && (
                  <span className="text-xs text-[#c83a3a]">Account numbers do not match.</span>
                )}
              </Label>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-[#c83a3a]/30 bg-[#c83a3a]/[0.06] p-3 text-sm text-[#c83a3a]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={submit}
                disabled={!canSubmit || submitMutation.isPending}
                className="h-12 w-full bg-[#0c65ff] text-base font-semibold text-white hover:bg-[#0040c9]"
              >
                {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>

              <div className="flex items-start gap-2 pt-2 text-xs leading-5 text-black/55">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0040c9]" />
                <span>
                  Your account number is encrypted before being stored. Only Digital Therapy&rsquo;s owner can
                  reveal the full number to process a payment.
                </span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0A65FF]/10 text-[#0A65FF]">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <div className="space-y-2">
        <h1 className="font-display text-3xl tracking-[-0.03em]">Received.</h1>
        <p className="mx-auto max-w-md text-base leading-7 text-black/70">
          Thank you — your payment info is safely on file. You can close this page.
        </p>
      </div>
    </div>
  );
}

function InvalidTokenState({ reason }: { reason: "not_found" | "expired" | "used" }) {
  const message =
    reason === "expired"
      ? "This link has expired. Please ask Digital Therapy to send you a fresh one."
      : reason === "used"
      ? "This link has already been used. If you need to update your info, please ask Digital Therapy for a new link."
      : "This link is invalid. Please double-check the URL or ask Digital Therapy to send you a fresh one.";
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#c83a3a]/10 text-[#c83a3a]">
        <AlertCircle className="h-7 w-7" />
      </span>
      <div className="space-y-2">
        <h1 className="font-display text-3xl tracking-[-0.03em]">Link unavailable</h1>
        <p className="mx-auto max-w-md text-base leading-7 text-black/70">{message}</p>
      </div>
      <a
        href="mailto:hello@digitaltherapy.io"
        className="text-sm font-medium text-[#0A65FF] underline underline-offset-2"
      >
        Contact hello@digitaltherapy.io
      </a>
    </div>
  );
}
