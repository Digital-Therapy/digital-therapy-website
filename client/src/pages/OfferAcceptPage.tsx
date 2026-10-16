/**
 * Public, token-gated vendor offer acceptance (/offer/:token). The vendor
 * lands here from "Click to accept offer" in their emailed offer letter and
 * works through three steps: e-sign the letter, confirm or edit their ACH
 * payment info, then book a 30-minute technology onboarding with Milton.
 */
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { CalendarClock, CheckCircle2, Landmark, Loader2, PenLine, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRoute } from "wouter";

export default function OfferAcceptPage() {
  const [, params] = useRoute("/offer/:token");
  const token = params?.token ?? "";
  const utils = trpc.useUtils();
  const offerQuery = trpc.offers.getByToken.useQuery({ token }, { enabled: token.length > 0, retry: false });
  const refresh = () => utils.offers.getByToken.invalidate({ token });
  const data = offerQuery.data;

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-[#F7F4EE] px-4 py-10 text-[#111111]">
      <div className="mx-auto max-w-3xl">{children}</div>
    </div>
  );

  if (offerQuery.isLoading) {
    return shell(
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[#0A65FF]" />
      </div>,
    );
  }

  if (!data || data.status === "void") {
    return shell(
      <div className="rounded-2xl border border-black/10 bg-white p-10 text-center">
        <h1 className="font-display text-2xl tracking-[-0.04em]">
          {data ? "This offer has been withdrawn" : "This offer link isn’t valid"}
        </h1>
        <p className="mt-2 text-sm text-black/60">
          Please contact Digital Therapy at{" "}
          <a className="font-medium text-[#0A65FF]" href="mailto:hello@digitaltherapy.io">
            hello@digitaltherapy.io
          </a>
          .
        </p>
      </div>,
    );
  }

  const step = !data.signed ? 1 : !data.achConfirmed ? 2 : 3;

  return shell(
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <img src="/dtlogo.png" alt="Digital Therapy" className="h-10 w-auto object-contain" />
        <div>
          <div className="font-display text-xl tracking-[-0.04em]">Project offer · {data.clientName}</div>
          <div className="text-sm text-black/60">
            {data.projectName ? `${data.projectName} · ` : ""}For {data.vendorName}
          </div>
        </div>
      </div>

      <ol className="grid grid-cols-3 gap-2 text-xs font-medium">
        {["Sign offer", "Payment info", "Tech onboarding"].map((label, i) => {
          const done = i + 1 < step || (i === 2 && data.bookingOpened);
          const active = i + 1 === step;
          return (
            <li
              key={label}
              className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-2 ${
                done ? "bg-emerald-100 text-emerald-800" : active ? "bg-[#0A65FF] text-white" : "bg-black/5 text-black/50"
              }`}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{i + 1}.</span>}
              {label}
            </li>
          );
        })}
      </ol>

      <div className="max-h-[50vh] overflow-y-auto rounded-2xl border border-black/10 bg-white p-6 text-sm leading-6 text-black/80">
        {data.body.map((p, i) => (
          <p key={i} className={i ? "mt-3" : ""}>
            {p}
          </p>
        ))}
        <p className="mt-3">Digital Therapy</p>
      </div>

      {step === 1 ? (
        <SignStep token={token} vendorName={data.vendorName} onDone={refresh} />
      ) : step === 2 ? (
        <AchStep token={token} ach={data.ach} onDone={refresh} />
      ) : (
        <OnboardingStep token={token} onboarding={data.onboarding} booked={data.bookingOpened} onDone={refresh} />
      )}
    </div>,
  );
}

function Card({ icon: Icon, title, children }: { icon: typeof PenLine; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
      <h2 className="flex items-center gap-2 font-display text-xl tracking-[-0.04em]">
        <Icon className="h-5 w-5 text-[#0A65FF]" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function SignStep({ token, vendorName, onDone }: { token: string; vendorName: string; onDone: () => void }) {
  const [signature, setSignature] = useState("");
  const [consent, setConsent] = useState(false);
  const sign = trpc.offers.sign.useMutation({ onSuccess: (r) => r.ok && onDone() });
  const canSign =
    consent && signature.trim().toLowerCase() === vendorName.trim().toLowerCase() && !sign.isPending;
  return (
    <Card icon={PenLine} title="Step 1 · Accept and e-sign">
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-black/80">
        <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-1" />
        <span>
          I accept this offer under the terms of the Digital Therapy Vendor Program and agree to sign electronically. My
          typed signature is the legal equivalent of my handwritten signature.
        </span>
      </label>
      <label className="block text-sm font-semibold text-black/74">
        Signature — type your full name exactly: <span className="text-black/55">{vendorName}</span>
        <Input
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder={vendorName}
          className="mt-2 h-11 font-display text-2xl italic tracking-tight"
        />
      </label>
      {sign.data && !sign.data.ok ? <p className="text-sm text-red-600">{sign.data.error}</p> : null}
      {sign.isError ? <p className="text-sm text-red-600">Something went wrong. Please try again.</p> : null}
      <Button disabled={!canSign} onClick={() => sign.mutate({ token, signatureText: signature.trim() })} size="lg" className="w-full">
        {sign.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
        Accept and sign offer
      </Button>
    </Card>
  );
}

function AchStep({
  token,
  ach,
  onDone,
}: {
  token: string;
  ach: { bankName: string; accountType: string; last4: string } | null;
  onDone: () => void;
}) {
  const [editing, setEditing] = useState(!ach);
  const confirm = trpc.offers.confirmAch.useMutation({ onSuccess: (r) => r.ok && onDone() });
  const update = trpc.offers.updateAch.useMutation({ onSuccess: (r) => r.ok && onDone() });

  const [vendorName, setVendorName] = useState("");
  const [bankName, setBankName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">("checking");
  const [attested, setAttested] = useState(false);
  const digits = (s: string) => s.replace(/\s+/g, "");
  const canSave =
    vendorName.trim().length >= 2 &&
    bankName.trim().length >= 2 &&
    /^\d{9}$/.test(digits(routingNumber)) &&
    digits(accountNumber).length >= 4 &&
    digits(accountNumber) === digits(confirmAccount) &&
    attested &&
    !update.isPending;

  const error = (confirm.data && !confirm.data.ok && confirm.data.error) || (update.data && !update.data.ok && update.data.error);

  return (
    <Card icon={Landmark} title="Step 2 · ACH payment info">
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        <CheckCircle2 className="h-4 w-4" /> Offer signed. Thank you!
      </div>
      {!editing && ach ? (
        <>
          <p className="text-sm text-black/70">We'll pay you by ACH to the account on file:</p>
          <div className="rounded-xl border border-black/10 p-4 text-sm">
            <div className="font-semibold">{ach.bankName}</div>
            <div className="capitalize text-black/60">
              {ach.accountType} · account ending {ach.last4}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button size="lg" onClick={() => confirm.mutate({ token })} disabled={confirm.isPending}>
              {confirm.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm this account
            </Button>
            <Button size="lg" variant="outline" onClick={() => setEditing(true)}>
              Use a different account
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-black/70">
            Enter the business bank account Digital Therapy should pay. The account number is encrypted; we only show the
            last 4 digits.
          </p>
          <Label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Vendor name (as on your Digital Therapy vendor profile)</span>
            <Input value={vendorName} onChange={(e) => setVendorName(e.target.value)} autoComplete="organization" />
          </Label>
          <Label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Bank name</span>
            <Input value={bankName} onChange={(e) => setBankName(e.target.value)} autoComplete="off" />
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {(["checking", "savings"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAccountType(t)}
                className={`rounded-md border px-3 py-2.5 text-sm font-medium capitalize ${
                  accountType === t ? "border-[#0A65FF] bg-[#0A65FF] text-white" : "border-black/15 bg-white text-black/75"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <Label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Routing number</span>
            <Input value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} inputMode="numeric" maxLength={11} placeholder="9 digits" autoComplete="off" />
          </Label>
          <Label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Account number</span>
            <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} inputMode="numeric" autoComplete="off" />
          </Label>
          <Label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Confirm account number</span>
            <Input value={confirmAccount} onChange={(e) => setConfirmAccount(e.target.value)} inputMode="numeric" autoComplete="off" />
          </Label>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-black/80">
            <Checkbox checked={attested} onCheckedChange={(v) => setAttested(v === true)} className="mt-1" />
            <span>I confirm this is a business bank account.</span>
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              size="lg"
              disabled={!canSave}
              onClick={() =>
                update.mutate({
                  token,
                  vendorName: vendorName.trim(),
                  bankName: bankName.trim(),
                  routingNumber: digits(routingNumber),
                  accountNumber: digits(accountNumber),
                  accountType,
                  businessAccountAttested: true,
                })
              }
            >
              {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save payment info
            </Button>
            {ach ? (
              <Button size="lg" variant="outline" onClick={() => setEditing(false)}>
                Keep the account on file
              </Button>
            ) : null}
          </div>
        </div>
      )}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {confirm.isError || update.isError ? (
        <p className="text-sm text-red-600">{(update.error ?? confirm.error)?.message || "Something went wrong."}</p>
      ) : null}
    </Card>
  );
}

function OnboardingStep({
  token,
  onboarding,
  booked,
  onDone,
}: {
  token: string;
  onboarding: { host: string; agenda: string[]; bookingUrl: string | null };
  booked: boolean;
  onDone: () => void;
}) {
  const mark = trpc.offers.markBooking.useMutation({ onSuccess: onDone });
  return (
    <Card icon={CalendarClock} title={`Step 3 · Book your technology onboarding with ${onboarding.host}`}>
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        <CheckCircle2 className="h-4 w-4" /> Offer signed and payment info confirmed.
      </div>
      <p className="text-sm text-black/70">A 30-minute session. Agenda:</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-black/80">
        {onboarding.agenda.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      {onboarding.bookingUrl ? (
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            window.open(onboarding.bookingUrl!, "_blank", "noopener");
            mark.mutate({ token });
          }}
        >
          <CalendarClock className="mr-2 h-4 w-4" />
          {booked ? "Open the booking page again" : `Schedule with ${onboarding.host}`}
        </Button>
      ) : (
        <p className="rounded-xl bg-black/5 p-3 text-sm text-black/70">
          {onboarding.host} will email you a few times to choose from.
        </p>
      )}
    </Card>
  );
}
