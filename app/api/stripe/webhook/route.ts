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
      console.error("Webhook signature verification failed.", err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    interface MyMetadata {
      proposalId: string;
      issueId: string;
      orgId: string;
    }

    const { proposalId, issueId, orgId } =
      session.metadata as unknown as MyMetadata;

    const { error: txError } = await supabase.from("payments").insert({
      amount: session.amount_total,
      currency: session.currency,
      status: "held",
      type: "funding",
      issueId: issueId,
      proposal_id: proposalId,
      stripe_payment_id: session.payment_intent,
      orgId: orgId,
    });

    if (txError) {
      console.error("DB Error saving transaction:", txError);
    } else {
      const { error: rpError } = await supabase
        .from("request_proposal")
        .update({ status: "accepted" })
        .eq("id", proposalId);
      if (rpError) console.error("Failed updating request_proposal:", rpError);

      const { error: taskError } = await supabase
        .from("tasks")
        .update({ status: "on-going" })
        .eq("id", issueId);
      if (taskError) console.error("Failed updating task:", taskError);

      console.log(`✅ Proposal ${proposalId} accepted, task ${issueId} on-going`);
    }
  }

  if (event.type === "transfer.created") {
    try {
      const transfer = event.data.object as Stripe.Transfer;
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

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
      const { grossAmount, stripeFee, netAmount, freelancerAmount, issueId, proposalId, orgId, platformFee } = metadata;

      if (!grossAmount || !stripeFee || !platformFee || !freelancerAmount || !netAmount || !issueId || !proposalId || !orgId) {
        throw new Error("Transfer metadata missing");
      }

      const { error: updateTaskError } = await supabase
        .from("tasks")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", issueId);
      if (updateTaskError) console.error("Failed to update task:", updateTaskError);

      const { error: insertPaymentError } = await supabase
        .from("payments")
        .insert({
          amount: parseInt(freelancerAmount),
          currency: transfer.currency,
          status: "released",
          type: "payout",
          issueId,
          proposal_id: proposalId,
          stripe_payment_id: transfer.id,
          orgId,
          gross_amount: grossAmount,
          stripe_fee: stripeFee,
          platform_fee: platformFee,
          net_amount: netAmount,
          freelancer_pending_amount: freelancerAmount,
        });

      if (insertPaymentError) {
        console.error("Failed to insert payout record:", insertPaymentError);
      } else {
        console.log(`✅ Transfer ${transfer.id} - payout record created for issue ${issueId}`);
      }
    } catch (err) {
      console.error("Error handling transfer.created:", err);
    }
  }

  if (event.type === "charge.succeeded") {
    const charge = event.data.object as Stripe.Charge;
    await handleChargeAccounting(charge.id);
  }

  if (event.type === "charge.updated") {
    const charge = event.data.object as Stripe.Charge;
    if (charge.balance_transaction) {
      await handleChargeAccounting(charge.id);
    }
  }

  return new NextResponse("Received", { status: 200 });
}

async function handleChargeAccounting(chargeId: string) {
  const charge = await stripe.charges.retrieve(chargeId);
  if (!charge.balance_transaction) return false;

  const balanceTx = await stripe.balanceTransactions.retrieve(
    charge.balance_transaction as string,
  );

  const grossAmount = balanceTx.amount;
  const stripeFee = balanceTx.fee;
  const netAmount = balanceTx.net;
  const platformFee = Math.round(grossAmount * 0.04);
  const freelancerPending = grossAmount - stripeFee - platformFee;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: existing } = await supabase
    .from("payments")
    .select("stripe_fee")
    .eq("stripe_payment_id", charge.payment_intent)
    .single();

  if (existing?.stripe_fee) return true;

  await supabase
    .from("payments")
    .update({ gross_amount: grossAmount, stripe_fee: stripeFee, net_amount: netAmount, platform_fee: platformFee, freelancer_pending_amount: freelancerPending })
    .eq("stripe_payment_id", charge.payment_intent)
    .eq("type", "funding");

  return true;
}