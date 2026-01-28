"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

const NewOrgpage = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("freelancer"); // 'freelancer' or 'client'
  const [error, setError] = useState("");
  const router = useRouter();
  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) return setError("Name required");
    setError("");
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role }),
      });
      if (!res.ok) {
        throw new Error("Create failed");
      } else {
        setName("");
        router.push("/dashboard/organizations");
      }
    } catch (err: unknown) {
      console.error(err);
    
      // Check if it's a standard Error object
      if (err instanceof Error) {
        setError(err.message);
      } else {
        // Fallback for strings or weirdly shaped objects
        setError(String(err) || "An unexpected error occurred");
      }
    }
  }
  return (
    <div>
      <div className="flex  justify-center h-screen px-4 md:px-6   py-[120px]">
        
        <div className="bg-cardC/60 text-neutral-100 rounded-lg w-full max-w-3xl shadow-lg border border-neutral-800 h-max">
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-semibold">Create a new workspace</h3>
              <p className="text-sm text-neutral-400 mt-1">
                Workspaces are a way to group your projects. Each workspace can
                be configured with team members and billing settings.
              </p>
            </div>

            <form onSubmit={handleCreate} className="grid gap-4">
              <div className="grid sm:grid-cols-3 gap-3 items-start">
                <label className="text-sm text-neutral-300 pt-2">Name</label>
                <div className="sm:col-span-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Organization name"
                    className="w-full px-3 py-2 bg-cardC border border-cardCB rounded-md outline-none placeholder-neutral-500 text-neutral-100"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    What&apos;s the name of your company or team? You can change this
                    later.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 items-start">
                <label className="text-sm text-neutral-300 pt-2">Who are you?</label>
                <div className="sm:col-span-2">
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        value="freelancer"
                        checked={role === "FREELANCER"}
                        onChange={() => setRole("FREELANCER")}
                        className="form-radio "
                      />
                      <span className="text-sm">Offering services (Freelancer)</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        value="client"
                        checked={role === "CLIENT"}
                        onChange={() => setRole("CLIENT")}
                        className="form-radio"
                      />
                      <span className="text-sm">Paying for services (Client)</span>
                    </label>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Choose whether this workspace represents a freelancer or a client.
                  </p>
                </div>
              </div>

              {error && <div className="text-sm text-red-400">{error}</div>}

              <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-3 py-2 rounded-md bg-neutral-800 text-textNc border border-cardCB hover:bg-cardCB"
                >
                  Cancel
                </button>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md butt text-white"
                  >
                    Create workspace
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrgpage;
