"use client";

import { createBrowserClient } from "@supabase/ssr";
import React from "react";

export default function SignOutAndContinueButton({ token }: { token: string }) {
  const [loading, setLoading] = React.useState(false);

  async function handleSignOutAndContinue() {
    setLoading(true);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      );

      await supabase.auth.signOut();

      const redirectTo = encodeURIComponent(`/invite?token=${token}`);
      window.location.href = `/dashboard/auth/sign_in?redirectTo=${redirectTo}`;
    } catch (err) {
      console.error("Sign out error:", err);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOutAndContinue}
      disabled={loading}
      className="mt-4 px-4 py-2 butt text-white rounded disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Sign Out & Continue"}
    </button>
  );
}
