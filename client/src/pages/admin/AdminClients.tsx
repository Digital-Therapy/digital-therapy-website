/**
 * Clients & Projects manager — define the clients and projects that vendors get
 * assigned to (and which drive the engagement checkboxes on vendor profiles).
 */
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminClients() {
  const utils = trpc.useUtils();
  const clientsQuery = trpc.clients.list.useQuery();
  const refresh = () => utils.clients.list.invalidate();
  const onErr = (e: { message?: string }) => toast.error(e.message || "Something went wrong.");

  const createClient = trpc.clients.create.useMutation({ onSuccess: refresh, onError: onErr });
  const updateClient = trpc.clients.update.useMutation({ onSuccess: refresh, onError: onErr });
  const removeClient = trpc.clients.remove.useMutation({ onSuccess: refresh, onError: onErr });
  const createProject = trpc.clients.createProject.useMutation({ onSuccess: refresh, onError: onErr });
  const updateProject = trpc.clients.updateProject.useMutation({ onSuccess: refresh, onError: onErr });
  const removeProject = trpc.clients.removeProject.useMutation({ onSuccess: refresh, onError: onErr });

  const [newClient, setNewClient] = useState("");
  const [newProject, setNewProject] = useState<Record<number, string>>({});

  const clients = clientsQuery.data ?? [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl tracking-[-0.05em]">Clients &amp; Projects</h1>
          <p className="text-sm text-black/60">
            Manage the clients and projects that vendors are assigned to. Active clients and projects appear as
            checkboxes on vendor profiles.
          </p>
        </div>

        {/* Add client */}
        <div className="flex gap-2 rounded-2xl border border-black/10 bg-white p-4">
          <Input
            value={newClient}
            onChange={(e) => setNewClient(e.target.value)}
            placeholder="New client name"
            className="h-10"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newClient.trim()) {
                createClient.mutate({ name: newClient.trim() });
                setNewClient("");
              }
            }}
          />
          <Button
            onClick={() => {
              if (!newClient.trim()) return;
              createClient.mutate({ name: newClient.trim() });
              setNewClient("");
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add client
          </Button>
        </div>

        {clientsQuery.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : clients.length === 0 ? (
          <p className="text-sm text-black/55">No clients yet — add your first above.</p>
        ) : (
          clients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    {!client.active ? <Badge variant="outline">On Deck</Badge> : null}
                    {client.ndaWall ? (
                      <Badge className="gap-1 bg-amber-100 font-normal text-amber-800 hover:bg-amber-100">
                        <ShieldCheck className="h-3 w-3" />
                        NDA Wall
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-black/60">
                      <Checkbox
                        checked={client.ndaWall}
                        onCheckedChange={(v) => updateClient.mutate({ id: client.id, ndaWall: v === true })}
                      />
                      NDA Wall
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-black/60">
                      <Checkbox
                        checked={client.active}
                        onCheckedChange={(v) => updateClient.mutate({ id: client.id, active: v === true })}
                      />
                      Active
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete client "${client.name}" and all its projects?`))
                          removeClient.mutate({ id: client.id });
                      }}
                      aria-label="Delete client"
                      className="text-black/40 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {client.projects.length === 0 ? (
                  <p className="text-xs text-black/45">No projects yet.</p>
                ) : (
                  client.projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span>{project.name}</span>
                        {!project.active ? <Badge variant="outline">On Deck</Badge> : null}
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex cursor-pointer items-center gap-2 text-xs text-black/60">
                          <Checkbox
                            checked={project.active}
                            onCheckedChange={(v) => updateProject.mutate({ id: project.id, active: v === true })}
                          />
                          Active
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete project "${project.name}"?`)) removeProject.mutate({ id: project.id });
                          }}
                          aria-label="Delete project"
                          className="text-black/40 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <div className="flex gap-2 pt-1">
                  <Input
                    value={newProject[client.id] ?? ""}
                    onChange={(e) => setNewProject((p) => ({ ...p, [client.id]: e.target.value }))}
                    placeholder="New project name"
                    className="h-9"
                    onKeyDown={(e) => {
                      const name = (newProject[client.id] ?? "").trim();
                      if (e.key === "Enter" && name) {
                        createProject.mutate({ clientId: client.id, name });
                        setNewProject((p) => ({ ...p, [client.id]: "" }));
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const name = (newProject[client.id] ?? "").trim();
                      if (!name) return;
                      createProject.mutate({ clientId: client.id, name });
                      setNewProject((p) => ({ ...p, [client.id]: "" }));
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
