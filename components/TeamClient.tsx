"use client";

import { useCallback, useEffect, useState } from "react";
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
import Image from "next/image";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "react-toastify";

type Profile = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
};
type Tenants = {
  id: string;
  created_by: string;
};
type Membership = {
  id: string;
  role: string;
  profiles: Profile | null;
  tenants: Tenants | null;
};

type User = {
  id: string;
  email: string | null;
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
  const [user, setUser] = useState<User | null>(null);

  const [error, setError] = useState<string | null>(null);

  const loadMemberships = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/memberships?orgId=${orgId}`);
      if (!res.ok) {
        console.error("Failed to fetch memberships");
        return;
      }
      const json = await res.json();
      setMemberships(json.memberships ?? []);
    } catch (err: unknown) {
      // Handling the error safely for ESLint as we discussed earlier
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Error loading memberships:", message);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    loadMemberships();
  }, [orgId, loadMemberships]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/user");

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Failed to fetch user");
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!orgId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      channel = supabase
        .channel(`memberhip${orgId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "memberships",
            filter: `tenant_id=eq.${orgId}`,
          },
          async (payload) => {
            // --- THE CHANGE IS HERE ---
            // Call your internal API instead of calling Supabase directly
            try {
              const res = await fetch(`/api/memberships?id=${payload.new.id}`);
              if (res.ok) {
                const { membership } = await res.json();
                if (membership) {
                  // Use functional update to avoid stale state issues
                  setMemberships((prev) => [...prev, membership]);
                  toast.success(
                    `${membership.profiles?.full_name || "A new member"} joined the team!`,
                  );
                }
              }
            } catch (err) {
              console.error("Error fetching new member details:", err);
            }
          },
        )
        // --- DELETE LISTENER (The new addition) ---
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "memberships",
            filter: `tenant_id=eq.${orgId}`,
          },
          (payload) => {
            // payload.old contains the record that was just removed
            const deletedId = payload.old.id;

            // Remove the member from the UI state immediately
            setMemberships((prev) =>
              prev.filter((m: Membership) => m.id !== deletedId),
            );
          },
        )
        .subscribe((stat) => console.log(stat));
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [orgId]); // Removed 'memberships' from deps to prevent loop

  const tenantCreatorId = memberships[0]?.tenants?.created_by;
  const isCreator = tenantCreatorId === user?.id;

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
    <div className="px-2  md:px-[20px] py-[10px] w-full text-textNa">
      <div className="mx-auto space-y-6">
        <div className="uppercase tracking-wider text-sm">
          {" "}
          <p className="py-1 px-2 bg-cardC w-max rounded">
            {isCreator ? "created" : "invited"}
          </p>
        </div>

        <div className="flex items-center justify-between md:justify-start gap-10 md:gap-6   ">
          <div className="flex items-center gap-2 border bg-cardC/50 border-cardCB rounded-md px-3 flex-1  md:w-96 md:flex-none">
            <Search className="w-5 h-5 text-textNd" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="bg-transparent placeholder-neutral-500 outline-none w-full text-textNb"
            />
          </div>

          <Button
            className="inline-flex items-center md:gap-2 text-white px-4 py-2 butt rounded"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus className="w-5 h-5" strokeWidth={2.5} />
            <p className="hidden md:block">Invite Member</p>
          </Button>
        </div>

        <div className="bg-cardC/60 border border-cardCB rounded-lg overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-[90vh]">
              <Image
                src="/Logo.png"
                alt="Kodash Logo"
                width={100}
                height={100}
                className="mb-5 animate-pulse"
              />
            </div>
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
                  const isCurrentUser = membership.profiles?.id === user?.id;
                  const profile = membership.profiles;
                  if (!profile) return null;

                  return (
                    <div
                      key={profile.id || index}
                      className="p-2 py-4 md:p-4 hover:bg-cardC transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex  gap-4">
                          <Avatar className="w-10 h-10 border-2 border-cardCB">
                            <AvatarImage
                              src={profile.avatar_url || undefined}
                              alt={profile.full_name || profile.email || "User"}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                              {getInitials(profile)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex flex-col md:flex-row justify-start gap-2 md:gap-7 md:items-end">
                            <div className="flex flex-col">
                              <div className="font-medium text-textNa">
                                {profile.full_name ||
                                  profile.email ||
                                  "Unknown"}
                              </div>
                              <div className="text-sm text-textNd">
                                {profile.email}
                              </div>
                            </div>
                            <div className="text-[10px] tracking-widest text-textNb capitalize bg-cardICB/50 p-1 px-3 rounded-3xl w-max h-max">
                              <p className="sm">{membership.role}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {isCurrentUser && !isCreator && (
                            <Button className="hover:bg-cardICB/ cursor-pointer text-[12px]  bg-red-900/50 tracking-wider">
                              <LogOut className="w-4 h-4 md:mr-2 " />

                              <span className="hidden md:block">Leave</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {error}
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
                    onValueChange={(v: "Client" | "Freelancer") => setRole(v)}
                  >
                    <SelectTrigger
                      className="w-full border-cardICB bg-cardICB/10"
                      aria-label="Member role selector"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-cardICB bg-cardC text-white">
                      <SelectItem value="Client" className="">
                        Client
                      </SelectItem>
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
                        },
                      );

                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        console.error("Invite API error:", err);
                        setEmailError(
                          err?.error || "Failed to send invitation",
                        );
                        return;
                      }

                       toast.success(
                    `Invite sent successfully to ${email}`,
                  );

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
