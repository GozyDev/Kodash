"use client";


import { useRouter } from "next/navigation";
import React, { useState } from "react";

const NewOrgpage = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("CLIENT"); // 'freelancer' or 'client'
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
      <div className="flex  items-center  justify-center h-screen px-4 md:px-6   py-[120px]">
        <div className="bg-cardC/60 text-neutral-100 rounded-lg w-full max-w-3xl shadow-lg border border-neutral-800 h-max">
          <div className="p-6 space-y-4">
            <form onSubmit={handleCreate} className="grid gap-4">
              <div className="grid  gap-3 items-start">
                <label className="font-medium text-neutral-300 pt-2">
                  Workspace name
                </label>
                <div className="sm:col-span-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Organization name"
                    className="w-full px-3 py-3 bg-cardC border border-cardCB rounded outline-none placeholder-neutral-500 text-neutral-100"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    You can change this later.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 items-start">
                <label className="font-medium text-textNc pt-2">
                  Your role
                </label>

                <div className="sm:col-span-2">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div
                      className={`border  ${role === "CLIENT" ? "bg-primaryC/10 border-[#22c55e]/20" : "bg-cardC border border-cardCB hover:bg-cardC/50"} p-4 flex items-center gap-4 flex-1 cursor-pointer `}
                      onClick={() => setRole("CLIENT")}
                    >
                      <div
                        className={`w-9 h-9 flex justify-center items-center rounded ${role === "CLIENT" ? "text-[#22c55e] bg-primaryC/20" : "bg-cardICB/50 text-textNc"}`}
                      >
                        <p className=" capitalize font-medium">C</p>
                      </div>
                      <span className="">
                        <h3 className="text-sm">I have work to be done</h3>
                        <p className="text-[13px] text-textNd">
                          I want to hire someone and pay securely
                        </p>
                      </span>
                    </div>

                    <div
                      className={`border ${role === "FREELANCER" ? "bg-primaryC/10 border-[#22c55e]/20" : "bg-cardC border border-cardCB hover:bg-cardC/50"} p-4 flex items-center gap-4 flex-1 cursor-pointer `}
                      onClick={() => setRole("FREELANCER")}
                    >
                      <div
                        className={`w-9 h-9 flex justify-center items-center rounded ${role === "FREELANCER" ? "text-[#22c55e] bg-primaryC/20" : "bg-cardICB/50 text-textNc"}`}
                      >
                        <p className=" capitalize font-medium">F</p>
                      </div>
                      <span className="">
                        <h3 className="text-sm">
                          I offer services
                        </h3>
                        <p className="text-[13.5px] text-textNd">
                          I want to deliver work and get paid
                        </p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {error && <div className="text-sm text-red-400">{error}</div>}

              <div className="flex justify-between items-center pt-6 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-3 py-2 rounded bg-neutral-800 text-textNc border border-cardCB hover:bg-cardCB"
                >
                  Cancel
                </button>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded butt text-white"
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
