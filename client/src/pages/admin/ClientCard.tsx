/**
 * One client card: header (status / NDA Wall / delete), editable company
 * details (legal name, address, website), projects, and contact people (with a
 * markable primary signer). The primary contact + legal name/address feed the
 * upcoming tri-party NDA.
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import { Check, Pencil, Plus, ShieldCheck, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ClientRow = RouterOutputs["clients"]["list"][number];
type Contact = ClientRow["contacts"][number];

const blankContact = { name: "", title: "", email: "", phone: "" };

export function ClientCard({ client }: { client: ClientRow }) {
  const utils = trpc.useUtils();
  const refresh = () => utils.clients.list.invalidate();
  const onErr = (e: { message?: string }) => toast.error(e.message || "Something went wrong.");
  const m = (opts = {}) => ({ onSuccess: refresh, onError: onErr, ...opts });

  const updateClient = trpc.clients.update.useMutation(m());
  const removeClient = trpc.clients.remove.useMutation(m());
  const createProject = trpc.clients.createProject.useMutation(m());
  const updateProject = trpc.clients.updateProject.useMutation(m());
  const removeProject = trpc.clients.removeProject.useMutation(m());
  const addContact = trpc.clients.addContact.useMutation(m());
  const updateContact = trpc.clients.updateContact.useMutation(m());
  const removeContact = trpc.clients.removeContact.useMutation(m());
  const setPrimary = trpc.clients.setPrimaryContact.useMutation(m());

  // Company details edit
  const [editingDetails, setEditingDetails] = useState(false);
  const [details, setDetails] = useState({
    legalName: client.legalName ?? "",
    address: client.address ?? "",
    website: client.website ?? "",
  });
  useEffect(() => {
    setDetails({ legalName: client.legalName ?? "", address: client.address ?? "", website: client.website ?? "" });
  }, [client.legalName, client.address, client.website]);

  const [newProject, setNewProject] = useState("");
  const [newContact, setNewContact] = useState(blankContact);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [contactDraft, setContactDraft] = useState(blankContact);

  const startEditContact = (c: Contact) => {
    setEditingContactId(c.id);
    setContactDraft({ name: c.name, title: c.title ?? "", email: c.email ?? "", phone: c.phone ?? "" });
  };

  return (
    <Card>
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
                if (confirm(`Delete client "${client.name}" and all its projects/contacts?`))
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

      <CardContent className="space-y-5">
        {/* Company details */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-black/45">Company details</h3>
            {!editingDetails ? (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-black/55" onClick={() => setEditingDetails(true)}>
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
            ) : null}
          </div>
          {editingDetails ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                value={details.legalName}
                onChange={(e) => setDetails((d) => ({ ...d, legalName: e.target.value }))}
                placeholder="Legal entity name (for the NDA)"
                className="h-9 sm:col-span-2"
              />
              <Input
                value={details.address}
                onChange={(e) => setDetails((d) => ({ ...d, address: e.target.value }))}
                placeholder="Address"
                className="h-9"
              />
              <Input
                value={details.website}
                onChange={(e) => setDetails((d) => ({ ...d, website: e.target.value }))}
                placeholder="Website"
                className="h-9"
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button
                  size="sm"
                  onClick={() => {
                    updateClient.mutate({ id: client.id, ...details });
                    setEditingDetails(false);
                  }}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDetails({
                      legalName: client.legalName ?? "",
                      address: client.address ?? "",
                      website: client.website ?? "",
                    });
                    setEditingDetails(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <Detail label="Legal name" value={client.legalName} className="sm:col-span-2" />
              <Detail label="Address" value={client.address} />
              <Detail label="Website" value={client.website} />
            </div>
          )}
        </section>

        {/* Contacts */}
        <section>
          <h3 className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-black/45">Contacts</h3>
          <div className="space-y-2">
            {client.contacts.length === 0 ? (
              <p className="text-xs text-black/45">No contacts yet.</p>
            ) : (
              client.contacts.map((c) =>
                editingContactId === c.id ? (
                  <div key={c.id} className="grid gap-2 rounded-lg border border-black/10 p-3 sm:grid-cols-2">
                    <Input
                      value={contactDraft.name}
                      onChange={(e) => setContactDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Name"
                      className="h-9"
                    />
                    <Input
                      value={contactDraft.title}
                      onChange={(e) => setContactDraft((d) => ({ ...d, title: e.target.value }))}
                      placeholder="Title"
                      className="h-9"
                    />
                    <Input
                      value={contactDraft.email}
                      onChange={(e) => setContactDraft((d) => ({ ...d, email: e.target.value }))}
                      placeholder="Email"
                      className="h-9"
                    />
                    <Input
                      value={contactDraft.phone}
                      onChange={(e) => setContactDraft((d) => ({ ...d, phone: e.target.value }))}
                      placeholder="Phone"
                      className="h-9"
                    />
                    <div className="flex gap-2 sm:col-span-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          updateContact.mutate({ id: c.id, ...contactDraft });
                          setEditingContactId(null);
                        }}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingContactId(null)}>
                        <X className="mr-1 h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-3 py-2">
                    <div className="min-w-0 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.name}</span>
                        {c.isPrimary ? (
                          <Badge className="gap-1 bg-[#0A65FF]/10 font-normal text-[#0A65FF] hover:bg-[#0A65FF]/10">
                            <Star className="h-3 w-3 fill-[#0A65FF]" />
                            Primary signer
                          </Badge>
                        ) : null}
                      </div>
                      <div className="truncate text-xs text-black/55">
                        {[c.title, c.email, c.phone].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!c.isPrimary ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-black/55"
                          onClick={() => setPrimary.mutate({ clientId: client.id, contactId: c.id })}
                        >
                          <Star className="mr-1 h-3.5 w-3.5" />
                          Make primary
                        </Button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => startEditContact(c)}
                        aria-label="Edit contact"
                        className="p-1 text-black/40 hover:text-[#0A65FF]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeContact.mutate({ id: c.id })}
                        aria-label="Remove contact"
                        className="p-1 text-black/40 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ),
              )
            )}

            {/* Add contact */}
            <div className="grid gap-2 rounded-lg border border-dashed border-black/15 p-3 sm:grid-cols-2">
              <Input
                value={newContact.name}
                onChange={(e) => setNewContact((d) => ({ ...d, name: e.target.value }))}
                placeholder="Contact name"
                className="h-9"
              />
              <Input
                value={newContact.title}
                onChange={(e) => setNewContact((d) => ({ ...d, title: e.target.value }))}
                placeholder="Title"
                className="h-9"
              />
              <Input
                value={newContact.email}
                onChange={(e) => setNewContact((d) => ({ ...d, email: e.target.value }))}
                placeholder="Email"
                className="h-9"
              />
              <Input
                value={newContact.phone}
                onChange={(e) => setNewContact((d) => ({ ...d, phone: e.target.value }))}
                placeholder="Phone"
                className="h-9"
              />
              <div className="sm:col-span-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!newContact.name.trim()) return;
                    addContact.mutate({ clientId: client.id, ...newContact, name: newContact.name.trim() });
                    setNewContact(blankContact);
                  }}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add contact
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section>
          <h3 className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-black/45">Projects</h3>
          <div className="space-y-2">
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
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                placeholder="New project name"
                className="h-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newProject.trim()) {
                    createProject.mutate({ clientId: client.id, name: newProject.trim() });
                    setNewProject("");
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!newProject.trim()) return;
                  createProject.mutate({ clientId: client.id, name: newProject.trim() });
                  setNewProject("");
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add project
              </Button>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value, className = "" }: { label: string; value: string | null; className?: string }) {
  return (
    <div className={className}>
      <span className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-black/40">{label}: </span>
      <span className="text-black/80">{value || "—"}</span>
    </div>
  );
}
