"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, LogOut } from "lucide-react";

type Profile = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
};

type Membership = {
  role: string;
  profiles: Profile | null;
};

export default function TeamClient({ orgId }: { orgId: string }) {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!orgId) return;
    loadMemberships();
  }, [orgId]);

  async function loadMemberships() {
    setLoading(true);
    try {
      const res = await fetch(`/api/memberships?orgId=${orgId}`);
      if (!res.ok) {
        console.error("Failed to fetch memberships");
        return;
      }
      const json = await res.json();
      setMemberships(json.memberships ?? []);
    } catch (err) {
      console.error("Error loading memberships:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredMemberships = memberships.filter((membership) => {
    if (!searchQuery.trim()) return true;
    const profile = membership.profiles;
    if (!profile) return false;
    const email = profile.email?.toLowerCase() || "";
    const name = profile.full_name?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return email.includes(query) || name.includes(query);
  });

  const getInitials = (profile: Profile | null) => {
    if (!profile) return "?";
    if (profile.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (profile.email) {
      return profile.email.slice(0, 2).toUpperCase();
    }
    return "?";
  };

  return (
    <div className="p-12 w-full text-textNa">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl">Team</h1>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-cardC rounded-md px-3 py-2 w-96 border border-cardCB">
              <Search className="w-5 h-5 text-textNd" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="bg-transparent outline-none border-0 px-2 text-textNb placeholder:text-textNd focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="default"
              className="inline-flex items-center gap-2 text-white px-4 py-2 butt"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </Button>
          </div>
        </div>

        <div className="bg-cardC/60 border border-cardCB rounded-lg overflow-hidden">
          {loading && (
            <div className="p-8 text-center text-neutral-400">Loading...</div>
          )}

          {!loading && filteredMemberships.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              {searchQuery ? "No members found" : "No members yet"}
            </div>
          )}

          {!loading && filteredMemberships.length > 0 && (
            <>
              {/* Header with role and user count */}
              <div className="px-4 py-3 border-b border-cardCB bg-cardC/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-textNa capitalize">
                      {filteredMemberships[0]?.role || "Member"}
                    </span>
                    <span className="text-sm text-textNd">
                      • {filteredMemberships.length} {filteredMemberships.length === 1 ? "user" : "users"}
                    </span>
                  </div>
                </div>
              </div>

              {/* User list */}
              <div className="divide-y divide-cardCB">
                {filteredMemberships.map((membership, index) => {
                  const profile = membership.profiles;
                  if (!profile) return null;

                  return (
                    <div
                      key={profile.id || index}
                      className="p-4 hover:bg-cardC transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10 border-2 border-cardCB">
                            <AvatarImage
                              src={profile.avatar_url || undefined}
                              alt={profile.full_name || profile.email || "User"}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                              {getInitials(profile)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex flex-col">
                            <div className="font-medium text-textNa">
                              {profile.full_name || profile.email || "Unknown"}
                            </div>
                            <div className="text-sm text-textNd">
                              {profile.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-sm text-textNd capitalize">
                            {membership.role}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-textNd hover:text-textNa"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Leave
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

