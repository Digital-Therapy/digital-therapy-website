/**
 * PipelineTasksDialog — aggregated task list across every open opportunity.
 *
 * A "task" is the Next Step on an opportunity that isn't Closed-Won or
 * Closed-Lost. Ticking the checkbox appends a system activity to that
 * opportunity ("Completed task: ...") and clears its next_step + next_step_due
 * so it disappears from this list.
 */
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, ListChecks } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenOpportunity?: (id: number) => void;
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return iso < new Date().toISOString().slice(0, 10);
}

export function PipelineTasksDialog({ open, onOpenChange, onOpenOpportunity }: Props) {
  const utils = trpc.useUtils();
  const opportunitiesQuery = trpc.pipeline.list.useQuery(undefined, { enabled: open });
  const completeMutation = trpc.pipeline.completeTask.useMutation({
    onSuccess: () => {
      utils.pipeline.list.invalidate();
      toast.success("Task completed.");
    },
    onError: (e) => toast.error(e.message || "Could not complete task."),
  });

  const tasks = useMemo(() => {
    const opps = opportunitiesQuery.data ?? [];
    return opps
      .filter(
        (o) =>
          o.stage !== "closed_won" &&
          o.stage !== "closed_lost" &&
          o.nextStep &&
          o.nextStep.trim().length > 0,
      )
      .map((o) => ({
        opportunityId: o.id,
        text: o.nextStep!,
        due: o.nextStepDue,
        overdue: isOverdue(o.nextStepDue),
        title: o.title,
        party:
          o.kind === "new_project"
            ? o.clientName ?? "(unset client)"
            : o.prospectCompany || o.prospectName || "(unnamed prospect)",
        owner: o.ownerEmail,
      }))
      .sort((a, b) => {
        // Overdue first, then earliest due, then no-due last.
        if (a.overdue && !b.overdue) return -1;
        if (!a.overdue && b.overdue) return 1;
        if (a.due && b.due) return a.due.localeCompare(b.due);
        if (a.due && !b.due) return -1;
        if (!a.due && b.due) return 1;
        return 0;
      });
  }, [opportunitiesQuery.data]);

  const overdueCount = tasks.filter((t) => t.overdue).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl tracking-[-0.03em]">
            <ListChecks className="h-5 w-5 text-[#0A65FF]" />
            Outstanding tasks
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-black/65">
            <span>
              <strong>{tasks.length}</strong> open across the pipeline
            </span>
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#c83a3a]/10 px-2 py-0.5 text-[0.7rem] font-semibold text-[#c83a3a]">
                <AlertCircle className="h-3 w-3" />
                {overdueCount} overdue
              </span>
            )}
          </div>

          {opportunitiesQuery.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-black/15 bg-white/50 px-6 py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-black/30" />
              <p className="text-sm text-black/55">All caught up — no outstanding tasks.</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
              {tasks.map((task) => (
                <li key={task.opportunityId} className="flex items-start gap-3 px-4 py-3">
                  <button
                    type="button"
                    aria-label="Mark task complete"
                    title="Mark task complete"
                    onClick={() => completeMutation.mutate({ id: task.opportunityId })}
                    disabled={completeMutation.isPending}
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-black/25 text-white transition-colors hover:border-[#0A65FF] hover:bg-[#0A65FF]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A65FF]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#111111]">{task.text}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-black/55">
                      {onOpenOpportunity ? (
                        <button
                          type="button"
                          onClick={() => onOpenOpportunity(task.opportunityId)}
                          className="text-[#0A65FF] hover:underline"
                        >
                          {task.title}
                        </button>
                      ) : (
                        <span>{task.title}</span>
                      )}
                      <span>·</span>
                      <span>{task.party}</span>
                      {task.owner && (
                        <>
                          <span>·</span>
                          <span>{task.owner}</span>
                        </>
                      )}
                    </p>
                  </div>
                  {task.due && (
                    <span
                      className={`shrink-0 self-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                        task.overdue
                          ? "bg-[#c83a3a]/10 text-[#c83a3a]"
                          : "bg-black/[0.06] text-black/60"
                      }`}
                      title={task.overdue ? "Overdue" : "Due"}
                    >
                      {formatDate(task.due)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
