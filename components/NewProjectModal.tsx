"use client";

import React, { useEffect, useState } from "react";
import NewProjectHeader from "./NewProjectHeader";
import { useRouter } from "next/navigation";
import { CircleCheck, RefreshCcw } from "lucide-react";

type Org = { id: string; name: string; plan?: string };

const NewProjectModal = ({ orgId }: { orgId: string }) => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [projectPassword, setProjectPassword] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOrg = orgs.find((o) => o.id === orgId);
  console.log("Selected Org", selectedOrg);

  useEffect(() => {
    loadOrgs();
  }, []);

  async function loadOrgs() {
    setLoadingOrgs(true);
    try {
      const res = await fetch("/api/organizations");
      if (!res.ok) throw new Error("Failed to load orgs");
      const json = await res.json();
      setOrgs(json.workspaces ?? []);
      // pick first if none selected
      if (!selectedOrg && (json.organizations?.length ?? 0) > 0) {
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrgs(false);
    }
  }

  // create project POST
  async function createProject(e?: React.FormEvent) {
    e?.preventDefault();
    if (!title.trim()) return setError("Project title required");
    if (!selectedOrg) return setError("Select an organization");
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          orgId:orgId,
          project_password: projectPassword || null,
          description: description || null,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Create failed");
      }
      const json = await res.json();
      // optional: route to new project page (if API returns id)
      if (json?.project?.id) {
        router.push(`/dashboard/org/${orgId}/`);
        return;
      }
      // fallback: reload organization page
      router.push(`/dashboard/org/${selectedOrg}`);
    } catch (err: any) {
      setError(err?.message || "Error");
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  // simple client-side filtered org list for select-like behavior
  const filteredOrgs = query
    ? orgs.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
    : orgs;

  return (
    <div className=" h-screen flex items-start justify-center py-24 overflow-y-scroll">
      <NewProjectHeader orgs={orgs} orgId={orgId ?? undefined} />
      <div className="bg-cardC/60 h-max text-neutral-100 rounded-lg w-full max-w-3xl shadow-lg border border-neutral-800">
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold">Create a new project</h3>
            <p className="text-sm text-neutral-400 mt-1">
              Your project will have its own workspace and metadata. Provide a
              name, short description and a project password for access.
            </p>
          </div>

          <form onSubmit={createProject} className="grid gap-4">
            {/* Organization selector */}
            <div className="grid sm:grid-cols-3 gap-3 items-start">
              <label className="text-sm text-neutral-300 pt-2">Workspace</label>
              <div className="sm:col-span-2">
                <div className="w-full h-[40] px-3 py-2 bg-cardC border border-cardCB rounded-md outline-none placeholder-neutral-500 text-neutral-100 cursor-pointer flex items-center">
                  <div className="text-sm flex gap-1">
                    {selectedOrg ? (
                      <div className="text-sm items-center flex gap-2">
                        <span className="text-[13px]">{selectedOrg?.name}</span>{" "}
                        <span className="border py-1 px-2 rounded-xl text-[10px]">
                          {selectedOrg?.plan}
                        </span>{" "}
                      </div>
                    ) : (
                      <>
                        <RefreshCcw
                          size={15}
                          className="animate-spin text-textNc"
                        />
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-neutral-500 mt-2">
                  Choose which workspace the project belongs to.
                </p>
              </div>
            </div>

            {/* Project name */}
            <div className="grid sm:grid-cols-3 gap-3 items-start">
              <label className="text-sm text-neutral-300 pt-2">
                Project name
              </label>
              <div className="sm:col-span-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project name"
                  className="w-full px-3 py-2 bg-cardC border border-cardCB rounded-md outline-none placeholder-neutral-500 text-neutral-100"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  A short, unique name for this project.
                </p>
              </div>
            </div>

            {/* Project password */}
            <div className="grid sm:grid-cols-3 gap-3 items-start">
              <label className="text-sm text-neutral-300 pt-2">
                Project password
              </label>
              <div className="sm:col-span-2">
                <input
                  value={projectPassword}
                  onChange={(e) => setProjectPassword(e.target.value)}
                  placeholder="Set a project password (optional)"
                  className="w-full px-3 py-2 bg-cardC border border-cardCB rounded-md outline-none text-neutral-100"
                  type="password"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Optional: simple access key for the project (not DB password).
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="grid sm:grid-cols-3 gap-3 items-start">
              <label className="text-sm text-neutral-300 pt-2">
                Description
              </label>
              <div className="sm:col-span-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short project description"
                  className="w-full px-3 py-2 bg-cardC border border-cardCB rounded-md outline-none text-neutral-100 min-h-[88px] resize-none"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Optional description for this project.
                </p>
              </div>
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-3 py-2 rounded-md bg-neutral-800 text-neutral-300 border border-cardCB hover:bg-cardCB"
              >
                Cancel
              </button>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-md bg-primaryC hover:bg-emerald-700 text-white"
                >
                  {creating ? "Creating…" : "Create project"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;
