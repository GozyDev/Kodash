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
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(` Webhook signature verification failed.`, err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    } else {
      console.error(` Webhook signature verification failed.`, err);
      return NextResponse.json({ error: "Unknown error" }, { status: 400 });
    }
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
      const account = event.data.object as Stripe.Account;
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
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_onboarding_status: status })
        .eq("stripe_connect_id", account.id)
        .select("email");

      if (updateError) {
        console.error(
          "Failed to update profile onboarding status:",
          updateError,
        );
      } else {
        console.log(`Updated onboarding status for ${account.id} -> ${status}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error handling account.updated webhook", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
      } else {
        console.error("Error handling account.updated webhook", err);
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
      }
    }
  }

  // HANDLE transfer.created - when payment is released to freelancer
    if (event.type === "transfer.created") {
      console.log("EVENT TYPE:", event.type);
      console.log("TRANSFER:", event.data.object);
      console.log("METADATA:", event.data.object.metadata);
      try {
        const transfer = event.data.object as Stripe.Transfer;
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

        const {
          grossAmount,
          stripeFee,
          netAmount,
          freelancerAmount,
          issueId,
          proposalId,
          orgId,
          platformFee,
        } = metadata;

        if (
          !grossAmount ||
          !stripeFee ||
          !platformFee ||
          !freelancerAmount ||
          !netAmount ||
          !issueId ||
          !proposalId ||
          !orgId
        ) {
          console.log("TRANSFER METADATA:", transfer.metadata);
          throw new Error("metadata missing");
        }

        // 2. Update task status to "completed"
        const { error: updateTaskError } = await supabase
          .from("tasks")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .eq("id", issueId);

        if (updateTaskError) {
          console.log("Failed to update task:", updateTaskError);
        }

        // 3. Insert new payment record for payout with fee breakdown
        const payoutAmount = metadata.freelancerAmount
          ? parseInt(freelancerAmount)
          : transfer.amount;

        interface PayoutRecord {
          amount: number;
          currency: string;
          status: "released";
          type: "payout";
          issueId: string;
          proposal_id: string;
          stripe_payment_id: string;
          orgId: string;
          stripe_fee?: string;
          platform_fee?: string;
          gross_amount?: string;
          net_amount?: string;
          freelancer_pending_amount: string;
        }

        const payoutRecord: PayoutRecord = {
          amount: payoutAmount,
          currency: transfer.currency,
          status: "released",
          type: "payout",
          issueId: issueId,
          proposal_id: proposalId,
          stripe_payment_id: transfer.id,
          orgId: orgId,
          gross_amount: grossAmount,
          stripe_fee: stripeFee,
          platform_fee: platformFee,
          net_amount: netAmount,
          freelancer_pending_amount: freelancerAmount,
        };

        const { error: insertPaymentError } = await supabase
          .from("payments")
          .insert(payoutRecord);

        if (insertPaymentError) {
          console.log("Failed to insert payout record:", insertPaymentError);
        } else {
          console.log(
            `✅ Transfer ${transfer.id} completed - payout record created for issue ${metadata.issueId}`,
          );
        }
      } catch (err) {
        console.log("Error handling transfer.created webhook", err);
      }
    }

  // HANDLE charge.succeeded
  if (event.type === "charge.succeeded") {
    const charge = event.data.object as Stripe.Charge;

    await handleChargeAccounting(charge.id);
  }

  if (event.type === "charge.updated") {
    const charge = event.data.object as Stripe.Charge;
    if (charge.balance_transaction) {
      await handleChargeAccounting(charge.id);
    } else {
      console.log("Pending");
    }
  }

  return new NextResponse("Received", { status: 200 });
}

async function handleChargeAccounting(chargeId: string) {
  const charge = await stripe.charges.retrieve(chargeId);

  if (!charge.balance_transaction) {
    return false; // not ready
  }

  const balanceTx = await stripe.balanceTransactions.retrieve(
    charge.balance_transaction as string,
  );

  const grossAmount = balanceTx.amount;
  const stripeFee = balanceTx.fee;
  const netAmount = balanceTx.net;

  const PLATFORM_PERCENT = 0.04;
  const platformFee = Math.round(grossAmount * PLATFORM_PERCENT);
  const freelancerPending = grossAmount - stripeFee - platformFee;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 🔒 Idempotency guard
  const { data: existing } = await supabase
    .from("payments")
    .select("stripe_fee")
    .eq("stripe_payment_id", charge.payment_intent)
    .single();

  if (existing?.stripe_fee) {
    return true; // already processed
  }

  await supabase
    .from("payments")
    .update({
      gross_amount: grossAmount,
      stripe_fee: stripeFee,
      net_amount: netAmount,
      platform_fee: platformFee,
      freelancer_pending_amount: freelancerPending,
    })
    .eq("stripe_payment_id", charge.payment_intent)
    .eq("type", "funding");

  return true;
}
