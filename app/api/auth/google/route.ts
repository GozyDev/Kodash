import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";

export async function GET(request: NextRequest) {
  const supabaseServer = await createClient();
  const { searchParams } = new URL(request.url);
  
  // 1. Capture the intended final destination
  const next = searchParams.get("redirectTo") || "/dashboard/organizations";

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 2. ALWAYS point to your callback handler route
  // We append the 'next' path as a query param to our own internal URL
  const authCallbackUrl = `${origin.replace(/\/$/, "")}/dashboard/auth/callback`;
  const redirectTo = `${authCallbackUrl}?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabaseServer.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo,
      // Optional: force select account if needed
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error || !data?.url) return NextResponse.json({ error: error?.message });
  return NextResponse.redirect(data.url);
}