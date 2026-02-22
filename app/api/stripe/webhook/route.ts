import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error(` Webhook signature verification failed.`, err.message);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  //HANDLE THE SUCCESS EVENT
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // NOT the anon key
    );

    // 4. EXTRACT the hidden metadata we saved in Step 1

    // Define what your metadata looks like
    interface MyMetadata {
      proposalId: string;
      issueId: string;
    }

    // Cast it while destructuring
    const { proposalId, issueId } = session.metadata as unknown as MyMetadata;

    // 5. SAVE TO DATABASE (The Escrow Record)
    const { error: txError } = await supabase.from("payments").insert({
      amount: session.amount_total, // Stripe gives this in cents
      currency: session.currency,
      status: "held", // Logic: Money is now in escrow
      type: "funding",
      issueId: issueId,
      proposal_id: proposalId,
      stripe_payment_id: session.payment_intent, // THE pi_xxx ID
    });

    if (txError) {
      console.error("DB Error saving transaction:", txError);
    } else {
      // 6. UPDATE RELATED TABLES AFTER PAYMENT
      const { error: rpError } = await supabase
        .from("request_proposal")
        .update({ status: "accepted" })
        .eq("id", proposalId);
      if (rpError) console.error("Failed updating request_proposal status:", rpError);

      const { error: taskError } = await supabase
        .from("tasks")
        .update({ status: "on-going" })
        .eq("id", issueId);
      if (taskError) console.error("Failed updating task status:", taskError);

      console.log(`✅ Proposal ${proposalId} accepted and task ${issueId} marked on_going`);
    }
  }

  // HANDLE account updates to keep onboarding status in sync
  if (event.type === "account.updated") {
    try {
      const account = event.data.object as any;
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // NOT the anon key
      );
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
      // // 4. PENDING (Processing): They submitted everything, but Stripe is still verifying.
      // else if (account.details_submitted && !account.charges_enabled) {
      //   status = "pending"; // Stripe is "Thinking..."
      // }

      // Update profile where stripe_connect_id matches
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_onboarding_status: status })
        .eq("stripe_connect_id", account.id)
        .select("email");
      console.log("data",data);
      if (updateError) {
        console.error(
          "Failed to update profile onboarding status:",
          updateError,
        );
      } else {
        console.log(`Updated onboarding status for ${account.id} -> ${status}`);
      }
    } catch (err) {
      console.error("Error handling account.updated webhook", err);
    }
  }

  return new NextResponse("Received", { status: 200 });
}
