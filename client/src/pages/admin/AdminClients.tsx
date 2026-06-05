/**
 * Clients & Projects manager — define the clients, their company details +
 * contacts, and projects that vendors get assigned to. Active clients/projects
 * drive the engagement checkboxes on vendor profiles; the primary contact +
 * legal name feed the tri-party NDA.
 */
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ClientCard } from "./ClientCard";

export default function AdminClients() {
  const utils = trpc.useUtils();
  const clientsQuery = trpc.clients.list.useQuery();
  const vendorsQuery = trpc.vendor.adminBriefList.useQuery();
  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => utils.clients.list.invalidate(),
    onError: (e) => toast.error(e.message || "Something went wrong."),
  });

  const [newClient, setNewClient] = useState("");
  const addClient = () => {
    if (!newClient.trim()) return;
    createClient.mutate({ name: newClient.trim() });
    setNewClient("");
  };

  const clients = clientsQuery.data ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl tracking-[-0.05em]">Clients &amp; Projects</h1>
          <p className="text-sm text-black/60">
            Manage clients (company details + contacts) and the projects vendors are assigned to. Active clients
            and projects appear as checkboxes on vendor profiles.
          </p>
        </div>

        {/* Add client */}
        <div className="flex gap-2 rounded-2xl border border-black/10 bg-white p-4">
          <Input
            value={newClient}
            onChange={(e) => setNewClient(e.target.value)}
            placeholder="New client name"
            className="h-10"
            onKeyDown={(e) => e.key === "Enter" && addClient()}
          />
          <Button onClick={addClient}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add client
          </Button>
        </div>

        {clientsQuery.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : clients.length === 0 ? (
          <p className="text-sm text-black/55">No clients yet — add your first above.</p>
        ) : (
          clients.map((client) => <ClientCard key={client.id} client={client} vendors={vendorsQuery.data ?? []} />)
        )}
      </div>
    </AdminLayout>
  );
}
