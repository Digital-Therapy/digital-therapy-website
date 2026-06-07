/**
 * Public, token-gated NDA signing page (/nda/sign/:token). No auth — external
 * parties (client contact, vendor) open it from their emailed link, review the
 * filled tri-party NDA, and type their signature. Renders the shared NDA
 * template so wording matches the executed PDF exactly.
 */
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ndaHeadingSplit } from "@shared/ndaTemplate";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRoute } from "wouter";

const PARTY_LABEL: Record<string, string> = {
  client: "Client",
  dt: "Digital Therapy",
  vendor: "Vendor",
};

export default function NdaSigningPage() {
  const [, params] = useRoute("/nda/sign/:token");
  const token = params?.token ?? "";
  const utils = trpc.useUtils();
  const ndaQuery = trpc.nda.getByToken.useQuery({ token }, { enabled: token.length > 0, retry: false });

  const [signature, setSignature] = useState("");
  const [consent, setConsent] = useState(false);
  const [justSigned, setJustSigned] = useState(false);

  const sign = trpc.nda.sign.useMutation({
    onSuccess: (res) => {
      if (res.ok) {
        setJustSigned(true);
        utils.nda.getByToken.invalidate({ token });
      }
    },
  });

  const data = ndaQuery.data;

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-[#F7F4EE] px-4 py-10 text-[#111111]">
      <div className="mx-auto max-w-3xl">{children}</div>
    </div>
  );

  if (ndaQuery.isLoading) {
    return shell(
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[#0A65FF]" />
      </div>,
    );
  }

  if (!data) {
    return shell(
      <div className="rounded-2xl border border-black/10 bg-white p-10 text-center">
        <h1 className="font-display text-2xl tracking-[-0.04em]">This signing link isn’t valid</h1>
        <p className="mt-2 text-sm text-black/60">
          The link may have expired or already been used. Please contact Digital Therapy at{" "}
          <a className="font-medium text-[#0A65FF]" href="mailto:jon@digitaltherapy.io">
            jon@digitaltherapy.io
          </a>
          .
        </p>
      </div>,
    );
  }

  const [title, ...bodyParas] = data.bodyParagraphs;
  const alreadySigned = data.signed || justSigned;
  const fullyExecuted = data.status === "completed";
  const canSign =
    signature.trim().length > 0 &&
    signature.trim().toLowerCase() === data.signerName.trim().toLowerCase() &&
    consent &&
    !sign.isPending;

  return shell(
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0A65FF] text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display text-xl tracking-[-0.04em]">Digital Therapy · Mutual NDA</div>
          <div className="text-sm text-black/60">
            You are signing as <strong>{PARTY_LABEL[data.party] ?? data.party}</strong> — {data.signerName}
          </div>
        </div>
      </div>

      {/* Signing status of all parties */}
      <div className="flex flex-wrap gap-2">
        {data.signers.map((s) => (
          <span
            key={s.party}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              s.signed ? "bg-emerald-100 text-emerald-800" : "bg-black/8 text-black/55"
            }`}
          >
            {s.signed ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            {PARTY_LABEL[s.party] ?? s.party}: {s.signed ? "Signed" : "Pending"}
          </span>
        ))}
      </div>

      {/* The agreement */}
      <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-black/10 bg-white p-6 text-sm leading-6 text-black/80">
        <h1 className="text-center font-display text-2xl tracking-[-0.04em] text-[#111111]">{title}</h1>
        {bodyParas.map((p, i) => {
          const { head, rest } = ndaHeadingSplit(p);
          return (
            <p key={i} className="mt-3 whitespace-pre-line">
              {head ? <strong className="font-semibold text-[#111111]">{head}</strong> : null}
              {rest}
            </p>
          );
        })}
      </div>

      {/* Sign / status */}
      {alreadySigned ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
          <h2 className="mt-2 font-display text-xl tracking-[-0.04em]">Thank you — your signature is recorded.</h2>
          <p className="mt-1 text-sm text-black/65">
            {fullyExecuted
              ? "All parties have signed. A fully executed copy has been emailed to everyone."
              : "We’ll email all parties a fully executed copy once everyone has signed."}
          </p>
        </div>
      ) : fullyExecuted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-black/65">
          This NDA is fully executed.
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-black/80">
            <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-1" />
            <span>
              I have read this Agreement and agree to sign it electronically. I understand my typed signature is the
              legal equivalent of my handwritten signature and is binding.
            </span>
          </label>
          <label className="block text-sm font-semibold text-black/74">
            Signature — type your full name exactly: <span className="text-black/55">{data.signerName}</span>
            <Input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder={data.signerName}
              className="mt-2 h-11 font-display text-2xl italic tracking-tight"
            />
          </label>
          {sign.data && !sign.data.ok ? <p className="text-sm text-red-600">{sign.data.error}</p> : null}
          {sign.isError ? <p className="text-sm text-red-600">Something went wrong. Please try again.</p> : null}
          <Button
            disabled={!canSign}
            onClick={() => sign.mutate({ token, signatureText: signature.trim() })}
            size="lg"
            className="w-full"
          >
            {sign.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Sign NDA
          </Button>
        </div>
      )}
    </div>,
  );
}
