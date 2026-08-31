/**
 * VendorHeadshotForm — public, token-gated. Vendor lands here from a link
 * texted by the admin. Sees composition rules and uploads up to 3 headshots.
 */
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Image as ImageIcon, Loader2, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";

const RULES = [
  "Smile.",
  "Don’t crop the image right above your head — include at least 60 px above your head.",
  "Don’t chop your shoulders or arms off — keep a margin of at least 40 px on both sides.",
  "The bottom margin should be no higher than your waist.",
  "One full-body shot is potentially useful but not mandatory.",
];

const MAX_FILES = 3;
// 10 MB per file — enough for a high-quality phone photo without base64-blowing
// the JSON body.
const MAX_FILE_BYTES = 10 * 1024 * 1024;

type StagedFile = {
  file: File;
  previewUrl: string;
};

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = String(reader.result ?? "");
      // strip "data:<mime>;base64,"
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

export default function VendorHeadshotForm() {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";
  const tokenQuery = trpc.vendorHeadshot.lookupToken.useQuery({ token }, { enabled: token.length > 0, retry: false });

  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = trpc.vendorHeadshot.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => setError(e.message || "Something went wrong. Please try again."),
  });

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setError(null);
    const incoming: StagedFile[] = [];
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("image/")) {
        setError(`"${f.name}" is not an image.`);
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        setError(`"${f.name}" is too large — please keep each image under 10 MB.`);
        continue;
      }
      incoming.push({ file: f, previewUrl: URL.createObjectURL(f) });
    }
    setStaged((prev) => {
      const next = [...prev, ...incoming].slice(0, MAX_FILES);
      if (prev.length + incoming.length > MAX_FILES) {
        setError(`You can upload up to ${MAX_FILES} images.`);
      }
      return next;
    });
  };

  const removeStaged = (idx: number) => {
    setStaged((prev) => {
      const next = [...prev];
      const [removed] = next.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const submit = async () => {
    if (!staged.length) return;
    setError(null);
    try {
      const files = await Promise.all(
        staged.map(async (s) => ({
          filename: s.file.name,
          mimeType: s.file.type,
          dataBase64: await readAsBase64(s.file),
        })),
      );
      submitMutation.mutate({ token, files });
    } catch (e) {
      setError((e as Error).message || "Could not read the selected files.");
    }
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
          <SuccessState count={staged.length} />
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
                Upload fresh headshots.
              </h1>
              <p className="mt-3 text-base leading-7 text-black/70">
                So Digital Therapy has a current photo of you for use in vendor profiles and client-facing
                materials. Please pick up to <strong>{MAX_FILES}</strong> images.
              </p>
            </div>

            {/* Rules card */}
            <div className="mb-6 rounded-2xl border border-[#0A65FF]/20 bg-[#0A65FF]/[0.04] p-5">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#0040c9]">
                What makes a good headshot
              </p>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-[#111111]">
                {RULES.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0A65FF] text-[0.7rem] font-bold text-white">
                      {i + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Upload card */}
            <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:p-6">
              {/* Staged previews */}
              {staged.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {staged.map((s, i) => (
                    <div
                      key={i}
                      className="relative overflow-hidden rounded-lg border border-black/10 bg-black/[0.03]"
                    >
                      <img
                        src={s.previewUrl}
                        alt={s.file.name}
                        className="aspect-square w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeStaged(i)}
                        aria-label="Remove"
                        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* File picker */}
              {staged.length < MAX_FILES && (
                <label
                  htmlFor="headshot-input"
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-black/20 bg-black/[0.02] p-6 text-center transition-colors hover:border-[#0A65FF]/50 hover:bg-[#0A65FF]/[0.04]"
                >
                  <ImageIcon className="h-8 w-8 text-black/40" />
                  <span className="text-sm font-medium text-[#111111]">
                    Tap to add a photo{staged.length > 0 ? ` (${MAX_FILES - staged.length} left)` : ""}
                  </span>
                  <span className="text-xs text-black/50">JPG, PNG, HEIC · up to 10 MB each</span>
                  <input
                    id="headshot-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      // reset so re-selecting the same file works
                      e.target.value = "";
                    }}
                  />
                </label>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-[#c83a3a]/30 bg-[#c83a3a]/[0.06] p-3 text-sm text-[#c83a3a]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={submit}
                disabled={staged.length === 0 || submitMutation.isPending}
                className="h-12 w-full bg-[#0c65ff] text-base font-semibold text-white hover:bg-[#0040c9]"
              >
                {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitMutation.isPending ? "Uploading…" : `Submit ${staged.length || ""} ${staged.length === 1 ? "image" : "images"}`.trim()}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SuccessState({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0A65FF]/10 text-[#0A65FF]">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <div className="space-y-2">
        <h1 className="font-display text-3xl tracking-[-0.03em]">Received.</h1>
        <p className="mx-auto max-w-md text-base leading-7 text-black/70">
          Thank you — {count === 1 ? "your headshot is" : "your headshots are"} safely on file. You can close this
          page.
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
      ? "This link has already been used. If you need to upload new photos, please ask Digital Therapy for a new link."
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
