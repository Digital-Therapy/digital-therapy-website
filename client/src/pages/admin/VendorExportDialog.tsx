/**
 * Pre-export step: set the client-facing hourly rate (pre-filled at 2× the
 * vendor's listed rate) and hours/month (entered each time) for each selected
 * vendor before generating the PDF. The entered values replace the listed
 * rate/hours in the exported profile.
 */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import type { ExportProfile } from "./vendorPdf";

function firstInt(value: string | null | undefined): number | null {
  if (!value) return null;
  const m = value.replace(/,/g, "").match(/\d+/);
  return m ? Number.parseInt(m[0], 10) : null;
}

type Override = { rate: string; hours: string };

export function VendorExportDialog({
  profiles,
  open,
  onOpenChange,
  onGenerate,
}: {
  profiles: ExportProfile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (profiles: ExportProfile[]) => void;
}) {
  const [rows, setRows] = useState<Record<string, Override>>({});

  // Pre-fill rate at 2× the listed rate; hours always start blank.
  useEffect(() => {
    const init: Record<string, Override> = {};
    for (const p of profiles) {
      const n = firstInt(p.hourlyRate);
      init[p.id] = { rate: n != null ? `$${n * 2}/hr` : "", hours: "" };
    }
    setRows(init);
  }, [profiles]);

  const setField = (id: string, field: keyof Override, value: string) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const generate = () => {
    const withOverrides = profiles.map((p) => {
      const o = rows[p.id] ?? { rate: "", hours: "" };
      return {
        ...p,
        hourlyRate: o.rate.trim() || p.hourlyRate,
        hoursPerMonth: o.hours.trim() || p.hoursPerMonth,
      };
    });
    onGenerate(withOverrides);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Set rate &amp; hours for export</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-black/60">
          Rate is pre-filled at <strong>2× each vendor&rsquo;s listed rate</strong> (your client-facing bill rate) —
          adjust as needed. Enter the proposed hours/month for this engagement.
        </p>

        <ScrollArea className="max-h-[55vh]">
          <div className="space-y-2 pr-3">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_130px_130px] items-center gap-3 px-1 pb-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-black/45">
              <span>Vendor</span>
              <span>Hourly rate</span>
              <span>Hours / month</span>
            </div>
            {profiles.map((p) => (
              <div key={p.id} className="grid grid-cols-[1fr_130px_130px] items-center gap-3 rounded-lg border border-black/10 px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="truncate text-xs text-black/50">
                    {p.hourlyRate ? `Listed: ${p.hourlyRate}` : "No listed rate"}
                  </div>
                </div>
                <Input
                  value={rows[p.id]?.rate ?? ""}
                  onChange={(e) => setField(p.id, "rate", e.target.value)}
                  placeholder="$ / hr"
                  className="h-9"
                />
                <Input
                  value={rows[p.id]?.hours ?? ""}
                  onChange={(e) => setField(p.id, "hours", e.target.value)}
                  placeholder="e.g. 40"
                  inputMode="numeric"
                  className="h-9"
                />
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={generate}>
            <FileDown className="mr-1.5 h-4 w-4" />
            Generate PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
