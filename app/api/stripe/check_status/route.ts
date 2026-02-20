import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Get the Stripe ID from your DB
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_connect_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_connect_id) return NextResponse.json({ status: "not_started" });

  // 2. Ask Stripe for the real-time account data
  const account = await stripe.accounts.retrieve(profile.stripe_connect_id);

  // 3. Refined Status Logic
  let status = "pending";
  
  // Check if Stripe has a "To-Do List" for this user
  const hasActionNeeded = (account.requirements?.currently_due?.length ?? 0) > 0;

  if (account.details_submitted && account.charges_enabled) {
    // 🎉 COMPLETE: They can receive money!
    status = "completed";
  } else if (account.requirements?.disabled_reason?.startsWith('rejected')) {
    // ❌ FAILED: Only if Stripe explicitly banned the account (fraud, etc.)
    status = "failed";
  } else if (hasActionNeeded || !account.details_submitted) {
    // ⚠️ PENDING: They closed the tab or forgot a field
    status = "pending"; 
  } else {
    // ⏳ PENDING: They submitted everything, but Stripe is still "verifying" 
    // This usually takes a few minutes to 24 hours.
    status = "pending";
  }

  // 4. Update your DB so your Sidebar/UI reflects the truth
  await supabase
    .from("profiles")
    .update({ stripe_onboarding_status: status })
    .eq("id", user.id);

    console.log(status)
  // 5. Return extra info so your UI can be more helpful
  return NextResponse.json({ 
    status,
    detailsSubmitted: account.details_submitted,
    chargesEnabled: account.charges_enabled,
    requirementsDue: account.requirements?.currently_due || []
  });
}