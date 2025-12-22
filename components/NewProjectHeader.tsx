"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronsUpDown, Plus, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type Org = { id: string; name: string; plan?: string };

export default function NewProjectHeader({
  orgs: initialOrgs = [],
  orgId,
}: {
  orgs?: Org[];
  orgId?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [orgs, setOrgs] = useState<Org[]>(initialOrgs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialOrgs || initialOrgs.length === 0) loadOrgs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOrgs() {
    setLoading(true);
    try {
      const res = await fetch("/api/organizations");
      if (!res.ok) throw new Error("Failed to fetch orgs");
      const json = await res.json();
      setOrgs(json.workspaces ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return orgs;
    return orgs.filter((o: Org) => o.name.toLowerCase().includes(term));
  }, [orgs, q]);

  const goToOrg = (id: string) => router.push(`/dashboard/new/${id}`);
  const goToAll = () => router.push("/dashboard/organization");

  return (
    <header className="flex justify-between items-center  text-neutral-100 px-6 py-3 border-b border-gray-800/70 fixed top-0 left-0 w-full">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Image
            src="/Logo.png"
            alt="Supabase Logo"
            width={35}
            height={35}
            className="text-white"
          />
          <span className="font-light text-gray-700/50 text-lg">/</span>
        </div>

        <div className="flex items-center gap-3">
          <p className="font-medium text-sm text-gray-100">
            {orgs.find((o) => o.id === orgId)?.name ?? "Workspaces"}
          </p>

          <button className="px-2 text-sm font-light border border-gray-800 rounded-xl transition-colors capitalize">
            {orgs.find((o) => o.id === orgId)?.plan ?? "Free Plan"}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md">
                <ChevronsUpDown className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-cardC border-none text-textNa w-[22rem] min-w-[18rem] text-sm">
              <div className="px-2 py-2">
                  <div className="flex items-center gap-2 bg-cardC rounded-md px-2 py-1">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Find workspace"
                    className="bg-transparent outline-none px-2 text-sm w-full placeholder:text-textNd/50"
                    aria-label="Search workspaces"
                  />
                </div>
              </div>

              <DropdownMenuSeparator className="my-2 bg-cardCB" />

              <div className="max-h-48 overflow-auto">
                {loading && (
                  <div className="px-3 py-2 text-xs text-textNd">
                    Loading...
                  </div>
                )}
                {!loading && filtered.length === 0 && (
                  <div className="px-3 py-2 text-xs text-textNd">No workspaces</div>
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
                    All Workspaces
                  </button>
                </DropdownMenuItem>

                <DropdownMenuItem className="p-0">
                    <button
                    onClick={() => router.push("/dashboard/new")}
                    className="w-full text-left px-3 py-2 hover:bg-cardCB text-[13px] flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> New workspace
                  </button>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 mr-2">
          <button className="p-2 text-sm font-light border border-gray-800 rounded-lg hover:bg-gray-800">
            Feedback
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-800">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-700/50">
          <div className="relative group cursor-pointer">
            <Avatar className="w-9 h-9 border-2 border-transparent group-hover:border-blue-500">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="User Avatar"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900" />
          </div>
        </div>
      </div>
    </header>
  );
}
