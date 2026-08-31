/**
 * VendorHeadshotsSection — thumbnails of vendor-uploaded headshots + a
 * Request-new-headshot button that mints a token-gated upload link Karina
 * texts / emails to the vendor.
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Copy, Image as ImageIcon, Link as LinkIcon, MessageSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = { vendorId: string; vendorName: string };

export function VendorHeadshotsSection({ vendorId, vendorName }: Props) {
  const utils = trpc.useUtils();
  const headshotsQuery = trpc.vendor.adminListHeadshots.useQuery({ id: vendorId }, { enabled: vendorId.length > 0 });
  const tokensQuery = trpc.vendor.adminListHeadshotTokens.useQuery({ id: vendorId }, { enabled: vendorId.length > 0 });

  const deleteMutation = trpc.vendor.adminDeleteHeadshot.useMutation({
    onSuccess: () => {
      utils.vendor.adminListHeadshots.invalidate({ id: vendorId });
      toast.success("Headshot removed.");
    },
    onError: (e) => toast.error(e.message || "Could not delete headshot."),
  });
  const generateLinkMutation = trpc.vendor.adminGenerateHeadshotToken.useMutation({
    onSuccess: (data) => {
      setLinkResult(data);
      utils.vendor.adminListHeadshotTokens.invalidate({ id: vendorId });
    },
    onError: (e) => toast.error(e.message || "Could not generate link."),
  });

  const [linkResult, setLinkResult] = useState<{ url: string; expiresAt: string } | null>(null);
  const headshots = headshotsQuery.data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">Headshots</CardTitle>
        <Button
          size="sm"
          onClick={() => generateLinkMutation.mutate({ id: vendorId })}
          disabled={generateLinkMutation.isPending}
        >
          <LinkIcon className="mr-1.5 h-3.5 w-3.5" />
          Request new headshots
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {/* Thumbnails grid */}
        {headshots.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-black/15 bg-white/50 px-6 py-10 text-center">
            <ImageIcon className="h-8 w-8 text-black/25" />
            <p className="text-sm text-black/55">No headshots on file yet.</p>
            <p className="text-xs text-black/40">
              Click Request new headshots to send {vendorName} a mobile upload link.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {headshots.map((h) => (
              <div
                key={h.id}
                className="group relative overflow-hidden rounded-lg border border-black/10 bg-white"
              >
                <a href={h.url} target="_blank" rel="noopener" className="block">
                  <img
                    src={h.url}
                    alt={h.filename}
                    className="aspect-[4/5] w-full object-cover"
                    loading="lazy"
                  />
                </a>
                <div className="flex items-center justify-between gap-2 border-t border-black/8 bg-white/95 px-2 py-1.5">
                  <span
                    className="truncate text-[0.7rem] text-black/60"
                    title={`${h.filename} · ${new Date(h.createdAt).toLocaleDateString()}`}
                  >
                    {new Date(h.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete this headshot? (${h.filename})`)) deleteMutation.mutate({ id: h.id });
                    }}
                    aria-label="Delete headshot"
                    className="shrink-0 p-1 text-black/35 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link history */}
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
                      Uploaded
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
            <DialogTitle>Headshot upload link ready</DialogTitle>
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
                and can be used once. They can upload up to 3 images.
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
                    `Hi ${vendorName.split(" ")[0]}, please upload fresh headshots for Digital Therapy using this secure link: ${linkResult.url}`,
                  )}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0A65FF] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0040c9]"
                >
                  <MessageSquare className="h-4 w-4" />
                  Open in Messages
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(
                    "Digital Therapy — Upload fresh headshots",
                  )}&body=${encodeURIComponent(
                    `Hi ${vendorName.split(" ")[0]},\n\nPlease upload fresh headshots for our records using this secure link:\n\n${linkResult.url}\n\nYou can upload up to 3 images. The link is single-use and expires in 7 days.\n\nThank you,\nDigital Therapy`,
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
