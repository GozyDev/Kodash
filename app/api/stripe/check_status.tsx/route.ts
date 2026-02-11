// app/api/stripe/check-status/route.ts
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Get the ID from your DB
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_connect_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_connect_id) return NextResponse.json({ status: "not_started" });

  // 2. Ask Stripe for the real status
  const account = await stripe.accounts.retrieve(profile.stripe_connect_id);

  // 3. Update your DB based on what Stripe says
  let status = "pending";
  if (account.details_submitted && account.charges_enabled) {
    status = "completed";
  }

  await supabase
    .from("profiles")
    .update({ stripe_onboarding_status: status })
    .eq("id", user.id);

  return NextResponse.json({ status });
}