import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Get the Stripe ID from your DB
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_connect_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_connect_id)
    return NextResponse.json({ status: "not_started" });

  // 2. Ask Stripe for the real-time account data
  const account = await stripe.accounts.retrieve(profile.stripe_connect_id);

  // 3. Refined Status Logic
  let status = "pending";

  // 1. COMPLETED: Everything is green.
  if (account.details_submitted && account.charges_enabled) {
    status = "completed";
  }
  // 2. FAILED/REJECTED: Explicit rejection from Stripe.
  else if (account.requirements?.disabled_reason?.startsWith("rejected")) {
    status = "failed";
  }
  // 3. PENDING (Action Required): They entered some info but didn't finish.
  // We check if there are "currently_due" requirements.
  else if (
    account.requirements?.currently_due &&
    account.requirements.currently_due.length > 0
  ) {
    status = "pending"; // They have work to do!
  }
  //   // ⏳ PENDING: They submitted everything, but Stripe is still "verifying"
  //   // This usually takes a few minutes to 24 hours.
  //   status = "pending";
  // }

  // 4. Update your DB so your Sidebar/UI reflects the truth
  await supabase
    .from("profiles")
    .update({ stripe_onboarding_status: status })
    .eq("id", user.id);

  console.log("CHECK", status);
  // 5. Return extra info so your UI can be more helpful
  return NextResponse.json({
    status,
    detailsSubmitted: account.details_submitted,
    chargesEnabled: account.charges_enabled,
    requirementsDue: account.requirements?.currently_due || [],
  });
}
