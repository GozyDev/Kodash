"use client";
import React from "react";

export default function AcceptButton({ token }: { token: string }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleAccept() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to accept invite");
      }
      const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const redirectTo = `${origin.replace(/\/$/, "")}`;
      const { workspaceID, role } = await res.json();

      if (role === "FREELANCER") {
        window.location.assign(`${redirectTo}/dashboard/fl-org/${workspaceID}/issues`);
      }else{
        window.location.assign(`${redirectTo}/dashboard/cl-org/${workspaceID}/issues`);

      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleAccept}
        disabled={loading}
        className="px-4 py-2  butt text-white rounded"
      >
        {loading ? "Accepting…" : "Accept Invite"}
      </button>
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}
