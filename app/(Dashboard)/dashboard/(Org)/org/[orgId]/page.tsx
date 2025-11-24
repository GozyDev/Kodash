"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Funnel } from "lucide-react";

type Project = {
  id: string;
  title: string;
  project_type?: string;
  status?: string;
  created_at?: string;
};

export default function OrgProjectsPage() {
  const params = useParams() as { orgId?: string };
  const orgId = params?.orgId ?? "";
  const router = useRouter();

  const [orgName, setOrgName] = useState("Organization");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectPassword, setProjectPassword] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all");
  const [loading, setLoading] = useState(false);

  // modal state
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [ptype, setPtype] = useState("Feature");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orgId) return;
    loadOrg();
    loadProjects();
  }, [orgId]);

  async function loadOrg() {
    // optional: fetch org details if you have an endpoint, or embed server-rendered org name
    try {
      const res = await fetch(`/api/organizations?orgId=${orgId}`);
      if (!res.ok) return;
      const json = await res.json();
      const org = (json.organizations ?? [])[0];
      if (org) setOrgName(org.name);
    } catch (e) {}
  }

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?orgId=${orgId}`);
      const json = await res.json();
      setProjects(json.projects ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createProject(e?: React.FormEvent) {
    e?.preventDefault();
    if (!title.trim()) return setError("Project title required");
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          orgId,
          project_password: projectPassword,
          description: description || null,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Create failed");
      }
      setTitle("");
      setProjectPassword("");
      setDescription("");
      setShowCreate(false);
      await loadProjects();
    } catch (err: any) {
      setError(err?.message || "Error");
    }
  }

  const filtered = projects.filter((p) => {
    if (filter === "active" && p.status !== "active") return false;
    if (filter === "archived" && p.status !== "active") return false;
    if (!query) return true;
    return p.title.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <div className="p-12 w-full text-textNa">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl">Projects</h1>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 ">
            <div className="flex items-center gap-2 bg-cardC rounded-md px-3 py-2 w-96">
              <svg
                className="w-5 h-5 text-textNd"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="11"
                  cy="11"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects"
                className="bg-transparent outline-none px-2 text-textNb"
              />
            </div>

            <Funnel size={15} fill="white" className="cursor-pointer" />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/new/${orgId}`)}
              className="inline-flex items-center gap-2  text-textNa px-4 py-2 rounded-md butt"
            >
              + New project
            </button>
          </div>
        </div>

        <div>
          {loading && <div className="text-neutral-400">Loading...</div>}
          {!loading && filtered.length === 0 && (
            <div className="text-neutral-500">No projects</div>
          )}

          <div className="grid grid-cols-1  lg:grid-cols-2 xl:grid-cols-3  gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-cardC/60 cursor-pointer border border-cardCB rounded-lg p-4  relative h-[176] group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-neutral-400">
                      {p.project_type ?? "General"} • {p.status}
                    </div>
                  </div>
                  <div>
                    <a
                      href={`/dashboard/project/${p.id}`}
                      className="text-textNb group-hover:text-primaryC transform group-hover:translate-x-3.5 "
                    >
                      <ChevronRight />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-neutral-900 text-neutral-100 rounded-lg w-full max-w-3xl shadow-lg border border-neutral-800">
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Create a new project</h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Your project will have its own workspace and metadata. Provide
                  a name, short description and a project password for access.
                </p>
              </div>

              <form onSubmit={createProject} className="grid gap-4">
                {/* Title */}
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
                      Optional: simple access key for the project (not DB
                      password).
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
                    onClick={() => setShowCreate(false)}
                    className="px-3 py-2 rounded-md bg-neutral-800 text-neutral-300 border border-cardCB hover:bg-cardCB"
                  >
                    Cancel
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-primaryC hover:bg-emerald-700 text-white"
                    >
                      Create project
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
