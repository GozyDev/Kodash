"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Search, LogOut, X } from "lucide-react";

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
  const [inviteOpen, setInviteOpen] = useState(false);
  const [role, setRole] = useState<"Client" | "Freelancer">("Client");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      console.log(json.memberships)
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
        <div className="mb-6"></div>

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
              onClick={() => setInviteOpen(true)}
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
                      • {filteredMemberships.length}{" "}
                      {filteredMemberships.length === 1 ? "user" : "users"}
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
      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
            onClick={() => setInviteOpen(false)}
            aria-hidden
          />

          <div className="relative w-full max-w-xl mx-4">
            <div className="bg-cardC text-white rounded-lg shadow-lg overflow-hidden border border-cardICB    ">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1c1f]">
                <h2 className="text-lg font-semibold">
                  Invite a member to this workspace
                </h2>
                <button
                  aria-label="Close"
                  onClick={() => setInviteOpen(false)}
                  className="text-textNd hover:text-textNa p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm mb-2 block text-textNd">
                    Member role
                  </label>
                  <Select
                    defaultValue={role}
                    onValueChange={(v) => setRole(v as any)}
                  >
                    <SelectTrigger
                      className="w-full border-cardICB bg-cardICB/10"
                      aria-label="Member role selector"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-cardICB bg-cardC text-white">
                      <SelectItem value="Client" className="">Client</SelectItem>
                      <SelectItem value="Freelancer">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm mb-2 block text-textNd">
                    Email address
                  </label>
                  <Input
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                    type="email"
                    className="border border-cardCB bg-cardICB/10"
                    aria-label="Email address"
                  />
                  {emailError && (
                    <div className="text-sm text-red-400 mt-2">
                      {emailError}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#1a1c1f]">
                <button
                  onClick={() => setInviteOpen(false)}
                  className="text-textNd hover:text-textNa px-3 py-2 rounded"
                  aria-label="Close invite modal"
                >
                  Close
                </button>
                <Button
                  onClick={async () => {
                    // simple email validation
                    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!re.test(email)) {
                      setEmailError("Enter a valid email address");
                      return;
                    }

                    setSubmitting(true);
                    try {
                      const res = await fetch(
                        `/api/workspaces/${orgId}/invite`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            email,
                            role,
                            workspaceId: orgId,
                          }),
                        }
                      );

                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        console.error("Invite API error:", err);
                        setEmailError(
                          err?.error || "Failed to send invitation"
                        );
                        return;
                      }

                      setInviteOpen(false);
                      setEmail("");
                    } catch (err) {
                      console.error(err);
                      setEmailError("Failed to send invitation");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="px-4 py-2 butt"
                  disabled={submitting}
                >
                  Send invitation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
