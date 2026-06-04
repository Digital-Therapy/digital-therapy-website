/**
 * Access — owner-only management of which Tailscale logins may use the console.
 * Owners (milton@/hello@, seeded server-side) are permanent and shown read-only;
 * everyone else is added/removed here and takes effect within seconds.
 */
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminAccess() {
  const utils = trpc.useUtils();
  const accessQuery = trpc.access.list.useQuery(undefined, { retry: false });
  const tailnetQuery = trpc.access.tailnetUsers.useQuery(undefined, { retry: false });
  const refresh = () => utils.access.list.invalidate();
  const onErr = (e: { message?: string }) => toast.error(e.message || "Something went wrong.");

  const addLogin = trpc.access.add.useMutation({
    onSuccess: (r) => {
      if (r.ok) {
        toast.success("Access granted.");
        setLogin("");
        setNote("");
        refresh();
      } else {
        toast.error(r.reason || "Could not add that login.");
      }
    },
    onError: onErr,
  });
  const removeLogin = trpc.access.remove.useMutation({
    onSuccess: (r) => {
      if (r.ok) {
        toast.success("Access removed.");
        refresh();
      } else {
        toast.error(r.reason || "Could not remove that login.");
      }
    },
    onError: onErr,
  });

  const [login, setLogin] = useState("");
  const [note, setNote] = useState("");

  const submit = () => {
    if (!login.trim()) return;
    addLogin.mutate({ login: login.trim(), note: note.trim() });
  };

  // access.list is owner-gated; a non-owner admin gets FORBIDDEN here.
  if (accessQuery.error) {
    return (
      <AdminLayout>
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center">
          <ShieldCheck className="mx-auto mb-3 h-7 w-7 text-[#0A65FF]" />
          <h1 className="font-display text-2xl tracking-[-0.04em]">Owners only</h1>
          <p className="mt-2 text-sm leading-6 text-black/60">
            Managing who can access the console is restricted to the account owners. Contact one of them if
            you need someone added.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const owners = accessQuery.data?.owners ?? [];
  const entries = accessQuery.data?.entries ?? [];

  // Tailnet users not already an owner or on the list -- the assignable set.
  const taken = new Set([...owners, ...entries.map((e) => e.login)]);
  const available = (tailnetQuery.data ?? []).filter((u) => !taken.has(u.login));
  const haveFeed = (tailnetQuery.data?.length ?? 0) > 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl tracking-[-0.05em]">Access</h1>
          <p className="max-w-2xl text-sm text-black/60">
            Control which Tailscale logins can use this console. Anyone here can sign in over Tailscale; everyone
            else on the tailnet -- and the public site -- is denied. Changes take effect within a few seconds.
          </p>
        </div>

        {/* Add a user */}
        <div className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-4 sm:flex-row">
          {haveFeed ? (
            // Pick from the current tailnet members (no guessing the login).
            <Select value={login} onValueChange={setLogin} disabled={available.length === 0}>
              <SelectTrigger className="h-10 sm:flex-1">
                <SelectValue placeholder={available.length === 0 ? "Everyone on the tailnet already has access" : "Select a Tailscale user..."} />
              </SelectTrigger>
              <SelectContent>
                {available.map((u) => (
                  <SelectItem key={u.login} value={u.login}>
                    {u.name} -- {u.login}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            // Fallback if the tailnet feed is unavailable: type the login.
            <Input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="name@digitaltherapy.io (their Tailscale login)"
              className="h-10 sm:flex-1"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          )}
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="h-10 sm:w-56"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Button onClick={submit} disabled={!login.trim() || addLogin.isPending} className="h-10 gap-1.5">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {/* List */}
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="border-b border-black/10 bg-black/[0.02] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-black/45">
            Allowed logins
          </div>

          {accessQuery.isLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {owners.map((o) => (
                <li key={o} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium text-[#111111]">{o}</span>
                    <Badge className="border-[#0A65FF]/20 bg-[#0A65FF]/10 text-[#0A65FF] hover:bg-[#0A65FF]/10">
                      Owner
                    </Badge>
                  </div>
                  <span className="shrink-0 text-xs text-black/40">always admin</span>
                </li>
              ))}

              {entries.map((e) => (
                <li key={e.login} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-[#111111]">{e.login}</div>
                    <div className="truncate text-xs text-black/45">
                      {e.note ? `${e.note} -- ` : ""}
                      added{e.addedBy ? ` by ${e.addedBy}` : ""}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-black/50 hover:text-red-600"
                    disabled={removeLogin.isPending}
                    onClick={() => removeLogin.mutate({ login: e.login })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}

              {entries.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-black/40">
                  No one added yet -- only the owners above can sign in.
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
