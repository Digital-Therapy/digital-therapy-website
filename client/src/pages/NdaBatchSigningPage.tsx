/**
 * Public batch NDA signing page (/nda/sign/all/:token). A signer who is awaiting
 * the same role (party + email) across several NDAs — e.g. a client rep on
 * multiple vendor NDAs that are identical but for the vendor — reviews them all
 * in one view, checks which to include, and applies ONE typed signature to all
 * selected at once. The single-NDA page (/nda/sign/:token) is unaffected.
 */
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ndaHeadingSplit } from "@shared/ndaTemplate";
import { CheckCircle2, ChevronDown, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useRoute } from "wouter";

const PARTY_LABEL: Record<string, string> = { client: "Client", dt: "Digital Therapy", vendor: "Vendor" };

export default function NdaBatchSigningPage() {
  const [, params] = useRoute("/nda/sign/all/:token");
  const token = params?.token ?? "";
  const utils = trpc.useUtils();
  const batchQuery = trpc.nda.getBatch.useQuery({ token }, { enabled: token.length > 0, retry: false });
  const data = batchQuery.data;

  const [selected, setSelected] = useState<Set<number> | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [signature, setSignature] = useState("");
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<{ signed: number; completed: number } | null>(null);

  const sign = trpc.nda.signBatch.useMutation({
    onSuccess: (res) => {
      if (res?.ok) {
        setResult({ signed: res.signed ?? 0, completed: res.completed ?? 0 });
        utils.nda.getBatch.invalidate({ token });
      }
    },
  });

  // Unsigned NDAs are the ones the signer still needs to sign.
  const pending = useMemo(() => (data?.ndas ?? []).filter((n) => !n.signed), [data]);
  const done = useMemo(() => (data?.ndas ?? []).filter((n) => n.signed), [data]);
  // Default selection = all pending (computed lazily once data arrives).
  const sel = selected ?? new Set(pending.map((n) => n.ndaId));
  const toggle = (id: number) => {
    const next = new Set(sel);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const selectedCount = pending.filter((n) => sel.has(n.ndaId)).length;

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-[#F7F4EE] px-4 py-10 text-[#111111]">
      <div className="mx-auto max-w-3xl">{children}</div>
    </div>
  );

  if (batchQuery.isLoading) {
    return shell(
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[#0A65FF]" />
      </div>,
    );
  }
  if (!data || data.ndas.length === 0) {
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

  const nameMatches = signature.trim().toLowerCase() === data.signerName.trim().toLowerCase();
  const canSign = selectedCount > 0 && nameMatches && consent && !sign.isPending;
  const allHandled = pending.length === 0 || (result && result.signed > 0 && pending.length === 0);

  return shell(
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0A65FF] text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display text-xl tracking-[-0.04em]">Digital Therapy · Mutual NDAs</div>
          <div className="text-sm text-black/60">
            You are signing as <strong>{PARTY_LABEL[data.party] ?? data.party}</strong> — {data.signerName}
          </div>
        </div>
      </div>

      {result ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
          <h2 className="mt-2 font-display text-xl tracking-[-0.04em]">
            Signed {result.signed} {result.signed === 1 ? "NDA" : "NDAs"}.
          </h2>
          <p className="mt-1 text-sm text-black/65">
            {result.completed > 0
              ? `${result.completed} ${result.completed === 1 ? "is" : "are"} now fully executed — a copy has been emailed to all parties.`
              : "We’ll email a fully executed copy of each once every party has signed."}
          </p>
        </div>
      ) : (
        <p className="text-sm text-black/65">
          You have <strong>{pending.length}</strong> {pending.length === 1 ? "NDA" : "NDAs"} awaiting your signature.
          They are identical except for the vendor. Review each, choose which to include, and sign them all at once
          below.
        </p>
      )}

      {/* Already-signed (this session or before) */}
      {done.length > 0 ? (
        <div className="space-y-1.5">
          {done.map((n) => (
            <div key={n.ndaId} className="flex items-center gap-2 text-sm text-black/55">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Signed · Vendor: <strong className="font-medium text-black/70">{n.vendorName || n.vendorCompany}</strong>
            </div>
          ))}
        </div>
      ) : null}

      {/* Pending NDAs with checkboxes + review */}
      {pending.length > 0 && !result ? (
        <div className="space-y-3">
          {pending.map((n) => {
            const open = expanded.has(n.ndaId);
            const [title, ...body] = n.bodyParagraphs;
            return (
              <div key={n.ndaId} className="rounded-2xl border border-black/10 bg-white">
                <div className="flex items-start gap-3 p-4">
                  <Checkbox
                    checked={sel.has(n.ndaId)}
                    onCheckedChange={() => toggle(n.ndaId)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">
                      <span className="text-black/55">Vendor:</span>{" "}
                      <strong>{n.vendorName || n.vendorCompany}</strong>
                      {n.vendorCompany && n.vendorName !== n.vendorCompany ? (
                        <span className="text-black/55"> · {n.vendorCompany}</span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((p) => {
                          const next = new Set(p);
                          next.has(n.ndaId) ? next.delete(n.ndaId) : next.add(n.ndaId);
                          return next;
                        })
                      }
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#0A65FF]"
                    >
                      {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      {open ? "Hide agreement" : "Review full agreement"}
                    </button>
                  </div>
                </div>
                {open ? (
                  <div className="max-h-[42vh] overflow-y-auto border-t border-black/10 px-5 py-4 text-sm leading-6 text-black/80">
                    <h3 className="text-center font-display text-xl tracking-[-0.04em] text-[#111111]">{title}</h3>
                    {body.map((p, i) => {
                      const { head, rest } = ndaHeadingSplit(p);
                      return (
                        <p key={i} className="mt-3 whitespace-pre-line">
                          {head ? <strong className="font-semibold text-[#111111]">{head}</strong> : null}
                          {rest}
                        </p>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* One signature for all selected */}
      {pending.length > 0 && !result ? (
        <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-6">
          <div className="text-sm font-medium text-black/74">
            Applying your signature to <strong>{selectedCount}</strong> of {pending.length} NDAs.
          </div>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-black/80">
            <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-1" />
            <span>
              I have read each selected Agreement and agree to sign them electronically. I understand my typed signature
              is the legal equivalent of my handwritten signature on each and is binding.
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
            onClick={() =>
              sign.mutate({
                token,
                ndaIds: pending.filter((n) => sel.has(n.ndaId)).map((n) => n.ndaId),
                signatureText: signature.trim(),
              })
            }
            size="lg"
            className="w-full"
          >
            {sign.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Sign {selectedCount} selected {selectedCount === 1 ? "NDA" : "NDAs"}
          </Button>
        </div>
      ) : null}

      {allHandled && !result ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-black/65">
          You have signed every NDA awaiting you. Thank you.
        </div>
      ) : null}
    </div>,
  );
}
