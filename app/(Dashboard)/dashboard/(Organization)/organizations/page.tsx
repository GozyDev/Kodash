"use client";

import { Boxes, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type projects = {
  count: number;
};

type Org = {
  id: string;
  name: string;
  plan?: string;
  projects: projects[]; 
  created_at?: string;
};

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function loadOrgs() {
    setLoading(true);
    try {
      const res = await fetch("/api/organizations");
      const json = await res.json();
      setOrgs(json.workspaces ?? []);
    } catch (err) {
      console.error("Error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrgs();
  }, []);

  console.log(orgs);
  const filtered = orgs.filter((o) =>
    o.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen px-4 md:px-6 py-6 md:py-12 text-textNa">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="md:text-3xl font-semibold">Your Workspaces</h1>

          <button
            onClick={() => router.push("/dashboard/new")}
            className="inline-flex items-center gap-2  text-textNa px-4 py-2 rounded-md butt"
          >
            <span className="md:text-2xl leading-none">+</span>
            <span>New Workspace</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2 border bg-cardC/50 border-cardCB rounded-md px-3 py-2 w-96">
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
              placeholder="Search for a workspace"
              className="bg-transparent placeholder-neutral-500 outline-none w-full text-textNb"
            />
          </div>
        </div>

        <div>
          {loading && <div className="text-neutral-400">Loading...</div>}
          {!loading && filtered.length === 0 && (
            <div className="text-textNe">No workspaces found.</div>
          )}

          <div className="grid grid-cols-1  lg:grid-cols-2 xl:grid-cols-3  gap-4">
            {filtered.map((org) => (
              <div
                key={org.id}
                className="flex  gap-4 bg-cardC/60 border border-cardCB rounded-lg p-4  relative h-max group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-black/70 border-cardCB flex items-center justify-center text-textNb">
                  <Boxes size={15} />
                </div>

                <div className="flex-1">
                  <div className="text-sm font-medium">{org.name}</div>
                  <div className="text-sm text-textNd">
                    {org.plan ?? "Free Plan"} • {org.projects[0].count ?? 0}{" "}
                    projects
                  </div>
                </div>

                <div className="absolute  right-5">
                  <a
                    href={`/dashboard/org/${org.id}`}
                    className="text-textNb group-hover:text-primaryC transform group-hover:translate-x-3.5 "
                  >
                    <ChevronRight />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
