import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server"; // server supabase client

export async function GET() {
  const supabaseServer = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const redirectTo = `${origin.replace(/\/$/, "")}/dashboard/auth/callback`
  const { data, error } = await supabaseServer.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:redirectTo,
    },
  });

  if (error || !data?.url) return NextResponse.json({ error: error?.message });
  return NextResponse.redirect(data.url);
}
