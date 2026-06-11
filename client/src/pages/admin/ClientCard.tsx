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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc, type RouterOutputs } from "@/lib/trpc";
import { Check, ChevronDown, ChevronRight, FileText, Pencil, Plus, ShieldCheck, Star, Trash2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ClientRow = RouterOutputs["clients"]["list"][number];
type Contact = ClientRow["contacts"][number];

const blankContact = { name: "", title: "", email: "", phone: "" };

type VendorBrief = { id: string; name: string; coreTeam: boolean };

export function ClientCard({ client, vendors }: { client: ClientRow; vendors: VendorBrief[] }) {
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
  const setResource = trpc.clients.setResource.useMutation(m());

  // Originator = whoever on the team introduced the client. Everyone is a vendor,
  // so offer the full pool (core-team members first), not only those flagged core.
  const originatorOptions = [...vendors].sort(
    (a, b) => Number(b.coreTeam) - Number(a.coreTeam) || a.name.localeCompare(b.name),
  );
  const vendorName = (vid: string) => vendors.find((v) => v.id === vid)?.name ?? "Unknown";
  const assigned = client.resourceIds ?? [];

  // Company details edit
  const detailsFromClient = () => ({
    legalName: client.legalName ?? "",
    address: client.address ?? "",
    website: client.website ?? "",
    originator: client.originator ?? "",
    intakeDate: client.intakeDate ?? "",
    referrer: client.referrer ?? "",
  });
  const [editingDetails, setEditingDetails] = useState(false);
  const [details, setDetails] = useState(detailsFromClient);
  useEffect(() => {
    setDetails(detailsFromClient());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.legalName, client.address, client.website, client.originator, client.intakeDate, client.referrer]);

  // Client-specific NDA document
  const [editingNda, setEditingNda] = useState(false);
  const [ndaDraft, setNdaDraft] = useState(client.ndaTemplate ?? "");
  useEffect(() => {
    setNdaDraft(client.ndaTemplate ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.ndaTemplate]);

  const [resourceSearch, setResourceSearch] = useState("");

  const [newProject, setNewProject] = useState("");
  const [newContact, setNewContact] = useState(blankContact);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [contactDraft, setContactDraft] = useState(blankContact);

  const startEditContact = (c: Contact) => {
    setEditingContactId(c.id);
    setContactDraft({ name: c.name, title: c.title ?? "", email: c.email ?? "", phone: c.phone ?? "" });
  };

  // Accordion: each client container can be minimized to just its header row.
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand client" : "Minimize client"}
              aria-expanded={!collapsed}
              className="-ml-1 rounded-md p-1 text-black/45 hover:bg-black/5 hover:text-black/70"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <CardTitle className="truncate text-lg">{client.name}</CardTitle>
            {!client.active ? <Badge variant="outline">On Deck</Badge> : null}
            {client.ndaWall ? (
              <Badge className="gap-1 bg-amber-100 font-normal text-amber-800 hover:bg-amber-100">
                <ShieldCheck className="h-3 w-3" />
                NDA Wall
              </Badge>
            ) : null}
            {client.ndaTemplate ? (
              <Badge className="gap-1 bg-indigo-100 font-normal text-indigo-800 hover:bg-indigo-100">
                <FileText className="h-3 w-3" />
                Custom NDA
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

      {collapsed ? null : (
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
              <label className="flex flex-col gap-1 text-xs text-black/55">
                Originator (introduced by)
                <Select
                  value={details.originator || "__none__"}
                  onValueChange={(v) => setDetails((d) => ({ ...d, originator: v === "__none__" ? "" : v }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {(() => {
                      const seen = new Set<string>();
                      return originatorOptions
                        .filter((t) => t.name && !seen.has(t.name) && seen.add(t.name))
                        .map((t) => (
                          <SelectItem key={t.id} value={t.name}>
                            {t.name}
                            {t.coreTeam ? "  · Core" : ""}
                          </SelectItem>
                        ));
                    })()}
                  </SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-black/55">
                Intake date
                <Input
                  type="date"
                  value={details.intakeDate}
                  onChange={(e) => setDetails((d) => ({ ...d, intakeDate: e.target.value }))}
                  className="h-9"
                />
              </label>
              <Input
                value={details.referrer}
                onChange={(e) => setDetails((d) => ({ ...d, referrer: e.target.value }))}
                placeholder="External referrer (name)"
                className="h-9 sm:col-span-2"
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
                    setDetails(detailsFromClient());
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
              <Detail label="Originator" value={client.originator} />
              <Detail label="Intake date" value={client.intakeDate} />
              <Detail label="Referrer" value={client.referrer} className="sm:col-span-2" />
            </div>
          )}
        </section>

        {/* NDA document — client-specific override of the default mutual NDA */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-black/45">NDA document</h3>
            {!editingNda ? (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-black/55" onClick={() => setEditingNda(true)}>
                <Pencil className="mr-1 h-3.5 w-3.5" />
                {client.ndaTemplate ? "Edit" : "Use a client-specific NDA"}
              </Button>
            ) : null}
          </div>
          {editingNda ? (
            <div className="space-y-2">
              <p className="text-xs leading-5 text-black/55">
                Paste this client's exact NDA wording. End at the “IN WITNESS WHEREOF…” line — the three signature
                blocks (Client · Digital Therapy · Vendor) are appended automatically. Placeholders filled per vendor:{" "}
                <code className="rounded bg-black/5 px-1">[INSERT VENDOR]</code>,{" "}
                <code className="rounded bg-black/5 px-1">[INSERT ADDRESS]</code>,{" "}
                <code className="rounded bg-black/5 px-1">[EFFECTIVE DATE]</code>. Leave blank to use the default
                mutual NDA. Changes apply to NDAs sent from now on; reissue any in-flight NDA to pick up new wording.
              </p>
              <Textarea
                value={ndaDraft}
                onChange={(e) => setNdaDraft(e.target.value)}
                placeholder="MUTUAL NON-DISCLOSURE AGREEMENT…"
                className="min-h-[260px] font-mono text-xs leading-5"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    updateClient.mutate({ id: client.id, ndaTemplate: ndaDraft.trim() });
                    setEditingNda(false);
                  }}
                >
                  Save NDA
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNdaDraft(client.ndaTemplate ?? "");
                    setEditingNda(false);
                  }}
                >
                  Cancel
                </Button>
                {client.ndaTemplate ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (!confirm("Reset this client to the default mutual NDA?")) return;
                      updateClient.mutate({ id: client.id, ndaTemplate: "" });
                      setNdaDraft("");
                      setEditingNda(false);
                    }}
                  >
                    Reset to default
                  </Button>
                ) : null}
              </div>
            </div>
          ) : client.ndaTemplate ? (
            <p className="line-clamp-3 whitespace-pre-line rounded-lg border border-black/10 bg-black/[0.02] p-3 text-xs leading-5 text-black/65">
              {client.ndaTemplate}
            </p>
          ) : (
            <p className="text-xs text-black/45">Using the default mutual NDA template.</p>
          )}
        </section>

        {/* Resource Assignments */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-black/45">Resource assignments</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-black/55">
                  <Users className="mr-1 h-3.5 w-3.5" />
                  Assign
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0">
                <div className="border-b border-black/8 p-2">
                  <Input
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    placeholder="Search team & vendors…"
                    className="h-8"
                  />
                </div>
                <ScrollArea className="h-64">
                  <div className="p-2">
                    {(() => {
                      const filtered = vendors.filter((v) =>
                        v.name.toLowerCase().includes(resourceSearch.toLowerCase()),
                      );
                      if (filtered.length === 0)
                        return <p className="px-2 py-6 text-center text-xs text-black/45">No matches</p>;
                      return filtered.map((v) => (
                        <label
                          key={v.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-black/5"
                        >
                          <Checkbox
                            checked={assigned.includes(v.id)}
                            onCheckedChange={(checked) =>
                              setResource.mutate({
                                clientId: client.id,
                                vendorApplicationId: v.id,
                                assigned: checked === true,
                              })
                            }
                          />
                          <span className="flex-1 truncate">{v.name}</span>
                          {v.coreTeam ? <span className="text-[0.6rem] font-bold text-[#0A65FF]">CORE</span> : null}
                        </label>
                      ));
                    })()}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
          {assigned.length === 0 ? (
            <Badge variant="outline" className="font-normal text-black/45">
              Unassigned
            </Badge>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {assigned.map((vid) => {
                const isCore = vendors.find((v) => v.id === vid)?.coreTeam;
                return (
                  <button
                    key={vid}
                    type="button"
                    onClick={() =>
                      setResource.mutate({ clientId: client.id, vendorApplicationId: vid, assigned: false })
                    }
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      isCore ? "bg-[#0A65FF]/10 text-[#0A65FF] hover:bg-[#0A65FF]/20" : "bg-black/8 text-black/70 hover:bg-black/15"
                    }`}
                    title="Remove from this client"
                  >
                    {vendorName(vid)}
                    <X className="h-3 w-3" />
                  </button>
                );
              })}
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
              <div className="flex items-center gap-2 sm:col-span-2">
                <Button
                  size="sm"
                  disabled={!newContact.name.trim() || addContact.isPending}
                  onClick={() => {
                    if (!newContact.name.trim()) return;
                    addContact.mutate({ clientId: client.id, ...newContact, name: newContact.name.trim() });
                    setNewContact(blankContact);
                  }}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Save contact
                </Button>
                {!newContact.name.trim() ? (
                  <span className="text-xs text-black/40">Enter a contact name to save.</span>
                ) : null}
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
      )}
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
