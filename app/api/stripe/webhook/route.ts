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
      orgId: string;
    }

    // Cast it while destructuring
    const { proposalId, issueId, orgId } =
      session.metadata as unknown as MyMetadata;

    // 5. SAVE TO DATABASE (The Escrow Record)
    const { error: txError } = await supabase.from("payments").insert({
      amount: session.amount_total, // Stripe gives this in cents
      currency: session.currency,
      status: "held", // Logic: Money is now in escrow
      type: "funding",
      issueId: issueId,
      proposal_id: proposalId,
      stripe_payment_id: session.payment_intent, // THE pi_xxx ID
      orgId: orgId,
    });

    if (txError) {
      console.error("DB Error saving transaction:", txError);
    } else {
      // 6. UPDATE RELATED TABLES AFTER PAYMENT
      const { error: rpError } = await supabase
        .from("request_proposal")
        .update({ status: "accepted" })
        .eq("id", proposalId);
      if (rpError)
        console.error("Failed updating request_proposal status:", rpError);

      const { error: taskError } = await supabase
        .from("tasks")
        .update({ status: "on-going" })
        .eq("id", issueId);
      if (taskError) console.error("Failed updating task status:", taskError);

      console.log(
        `✅ Proposal ${proposalId} accepted and task ${issueId} marked on_going`,
      );
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
      console.log("data", data);
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

  // HANDLE transfer.created - when payment is released to freelancer
  if (event.type === "transfer.created") {
    try {
      const transfer = event.data.object as any;
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      // Extract metadata from transfer
      interface TransferMetadata {
        issueId: string;
        proposalId: string;
        deliveryId: string;
        orgId: string;
        freelancerId: string;
        grossAmount?: string;
        stripeFee?: string;
        platformFee?: string;
        netAmount?: string;
        freelancerAmount?: string;
      }

      const metadata = transfer.metadata as unknown as TransferMetadata;

      if (!metadata.issueId || !metadata.deliveryId || !metadata.orgId) {
        console.log("Transfer missing required metadata:", transfer.id);
        return new NextResponse("Missing metadata", { status: 400 });
      }

      // 1. Update deliverable status to "approved" (if not already)
      const { error: updateDeliverableError } = await supabase
        .from("deliverables")
        .update({ status: "approved"})
        .eq("id", metadata.deliveryId);

      if (updateDeliverableError) {
        console.log("Failed to update deliverable:", updateDeliverableError);
      }

      // 2. Update task status to "completed"
      const { error: updateTaskError } = await supabase
        .from("tasks")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", metadata.issueId);

      if (updateTaskError) {
        console.log("Failed to update task:", updateTaskError);
      }

      // 3. Insert new payment record for payout with fee breakdown
      const payoutAmount = metadata.freelancerAmount
        ? parseInt(metadata.freelancerAmount)
        : transfer.amount;

      const payoutRecord: any = {
        amount: payoutAmount,
        currency: transfer.currency,
        status: "released",
        type: "payout",
        issueId: metadata.issueId,
        proposal_id: metadata.proposalId,
        stripe_payment_id: transfer.id,
        orgId: metadata.orgId,
      };

      // Add fee breakdown if available
      if (metadata.stripeFee) {
        payoutRecord.stripe_fee = parseInt(metadata.stripeFee);
      }
      if (metadata.platformFee) {
        payoutRecord.platform_fee = parseInt(metadata.platformFee);
      }
      if (metadata.grossAmount) {
        payoutRecord.gross_amount = parseInt(metadata.grossAmount);
      }
      if (metadata.netAmount) {
        payoutRecord.net_amount = parseInt(metadata.netAmount);
      }

      const { error: insertPaymentError } = await supabase
        .from("payments")
        .insert(payoutRecord);

      if (insertPaymentError) {
        console.log("Failed to insert payout record:", insertPaymentError);
      } else {
        console.log(
          `✅ Transfer ${transfer.id} completed - payout record created for issue ${metadata.issueId}`,
        );
        console.log("Payout breakdown:", {
          freelancerAmount: payoutAmount / 100,
          stripeFee: metadata.stripeFee
            ? parseInt(metadata.stripeFee) / 100
            : 0,
          platformFee: metadata.platformFee
            ? parseInt(metadata.platformFee) / 100
            : 0,
          grossAmount: metadata.grossAmount
            ? parseInt(metadata.grossAmount) / 100
            : 0,
        });

        const { error: feeError } = await supabase
          .from("payment_fees") // New table to track fees
          .insert({
            issueId: metadata.issueId,
            proposalId: metadata.proposalId,
            stripe_fee: metadata.stripeFee,
            platform_fee: metadata.platformFee,
            stripe_payment_id: transfer.id,
          });

          if(feeError){
        console.log(feeError);

          }
      }
    } catch (err) {
      console.log("Error handling transfer.created webhook", err);
    }
  }

  return new NextResponse("Received", { status: 200 });
}
