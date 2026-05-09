import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET!,
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Connect webhook signature verification failed.", err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }

  if (event.type === "account.updated") {
    try {
      const account = event.data.object as Stripe.Account;
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      let status = "pending";

      if (account.details_submitted && account.charges_enabled) {
        status = "completed";
      } else if (account.requirements?.disabled_reason?.startsWith("rejected")) {
        status = "failed";
      } else if (account.requirements?.currently_due && account.requirements.currently_due.length > 0) {
        status = "pending";
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_onboarding_status: status })
        .eq("stripe_connect_id", account.id)
        .select("email");

      if (updateError) {
        console.error("Failed to update profile onboarding status:", updateError);
      } else {
        console.log(`✅ Onboarding status for ${account.id} → ${status}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        return NextResponse.json({ error: err.message }, { status: 500 });
      }
      return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
  }

  return new NextResponse("Received", { status: 200 });
}