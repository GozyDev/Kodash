'use client'

import React, { useMemo, useState } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
type Org = { id: string; name: string; plan?: string };

const DropDownContent = ({ orgs }: { orgs: Org[] }) => {
  const [q, setQ] = useState("");
  const router = useRouter();
  // responsive filtered list (simple, immediate)
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return orgs;
    return orgs.filter((o: Org) => o.name.toLowerCase().includes(term));
  }, [orgs, q]);

  // helper navigation: fetch user's role for the org and route accordingly
  const goToOrg = async (id: string) => {
    try {
      const res = await fetch(`/api/role/${id}`);
      if (res.status === 401) {
        router.push("/dashboard/auth/sign_in");
        return;
      }
      if (res.status === 403) {
        router.push("/dashboard/organizations");
        return;
      }

      const json = await res.json();
      const role = json?.role;
      if (role === "freelancer") {
        router.push(`/dashboard/fr-org/${id}`);
      } else {
        router.push(`/dashboard/cl-org/${id}`);
      }
    } catch (err) {
      console.error("Failed to determine org role:", err);
      router.push("/dashboard/organizations");
    }
  };
  const goToAll = () => router.push("/dashboard/organizations");

  return (
    <DropdownMenu >
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded-md">
          <ChevronsUpDown className="w-4 h-4 text-gray-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="bg-cardC border-none text-textNa w-[22rem] min-w-[18rem] text-sm">
        {/* Search input */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 bg-cardC rounded-md px-2 py-1">
            <svg
              className="w-4 h-4 text-textNd/60"
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
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find organization"
              className="bg-transparent outline-none px-2 text-sm w-full placeholder:text-textNd/50"
              aria-label="Search organizations"
            />
          </div>
        </div>

        <DropdownMenuSeparator className="my-2 bg-cardCB" />

        {/* List */}
        <div className="max-h-48 overflow-auto">
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-xs text-textNd">
              No organizations
            </div>
          )}

          {filtered.map((org: Org) => (
            <DropdownMenuItem
              key={org.id}
              className="p-0"
              onSelect={(e) => {
                e.preventDefault();
                goToOrg(org.id);
              }}
            >
              <button className="w-full text-left px-3 py-2 hover:bg-cardCB text-[13px]">
                {org.name}
              </button>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="my-2 bg-cardCB" />

        <div className="px-1">
          <DropdownMenuItem className="p-0">
            <button
              onClick={() => goToAll()}
              className="w-full text-left px-3 py-2 hover:bg-cardCB text-[13px]"
            >
              All Organizations
            </button>
          </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-cardCB" />


          <DropdownMenuItem className="p-0">
            <button
              onClick={() => router.push("/dashboard/new")}
              className="w-full text-left px-3 py-2 hover:bg-cardCB text-[13px] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New organization
            </button>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropDownContent;
