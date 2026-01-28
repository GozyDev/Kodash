"use client";

import { Membership, Workspace } from "@/lib/superbase/type";
import { Boxes, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Workspace[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function loadOrgs() {
    setLoading(true);
    try {
      const res = await fetch("/api/organizations");
      const json = await res.json();

      const data = json.workspaces.map((m: Membership) => ({
        id: m.tenant.id,
        name: m.tenant.name,
        plan: m.tenant.plan,
        role: m.role,
        created_at: m.tenant.created_at,
        created_by: m.tenant.created_by,
      }));
      setOrgs(data ?? []);
    } catch (err) {
      console.error("Error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrgs();
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/user");
        const json = await res.json();
        setCurrentUserId(json?.user?.id ?? null);
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    }

    loadUser();
  }, []);

  console.log(orgs);

  const filtered = orgs.filter((o) =>
    o.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen px-4 md:px-6 py-6 pt-12 md:py-12 text-textNa">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-3xl font-semibold">Your Workspaces</h1>

          
        </div>

        {/* Search */}
        <div className="flex items-center  gap-6 mb-6 ">
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
          <button
            onClick={() => router.push("/dashboard/new")}
            className="inline-flex items-center gap-2  text-textNa px-4 py-2 rounded-md butt h-[100%]"
          >
            <span className="md:text-2xl leading-none">+</span>
            <span className=" hidden md:block">New Workspace</span>
          </button>
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
                className="flex  gap-4 bg-cardC/60 border border-cardCB rounded-lg p-4 py-8  relative h-max group cursor-pointer"
                onClick={() =>
                  router.push(
                    org.role === "FREELANCER"
                      ? `/dashboard/fr-org/${org.id}`
                      : `/dashboard/cl-org/${org.id}`
                  )
                }
              >
                <div className="w-9 h-9 rounded-full bg-black/70 border-cardCB flex items-center justify-center text-textNb">
                  <Boxes size={15} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-medium text-textNc">
                      {org.name}
                    </div>
                    {currentUserId ? (
                      <div className="text-xs px-2 py-0.5 rounded-md bg-cardC/40 text-textNd">
                        {org.created_by && org.created_by === currentUserId
                          ? "Created"
                          : "Invited"}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="absolute  right-5">
                  <button className="text-textNb group-hover:text-primaryC transform group-hover:translate-x-0.5 transition-all ">
                    <ChevronRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
