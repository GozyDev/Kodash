import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Fetch only the expired payments from the View we created
  const { data: expiredPayments, error: fetchError } = await supabase
    .from("expired_held_payments")
    .select("*");

  if (fetchError)
    return new Response(JSON.stringify(fetchError), { status: 500 });

  const results = [];

  for (const payment of expiredPayments) {
    try {
      // 1. Create the Stripe Transfer
      const transfer = await stripe.transfers.create({
        amount: payment.freelancer_pending_amount,
        currency: payment.currency || "usd",
        destination: payment.stripe_connect_id,
        transfer_group: payment.issueId,
        metadata: {
          issueId: payment.issueId,
          proposalId: payment.proposal_id,
          orgId: payment.orgId,
          grossAmount: payment.gross_amount,
          stripeFee: payment.stripe_fee,
          platformFee: payment.platform_fee,
          netAmount: payment.net_amount,
          freelancerAmount: payment.freelancer_pending_amount,
        },
      });
      const { error: updateError } = await supabase
        .from("payments")
        .update({ released_at: new Date().toISOString() })
        .eq("id", payment.payment_id);

      if (updateError) {
        console.error(
          "Payment recorded in Stripe but failed to update DB:",
          updateError,
        );
      }

      results.push({ id: payment.payment_id, status: "success" });
    } catch (err) {
      results.push({
        id: payment.payment_id,
        status: "error",
        message: err.message,
      });
    }
  }

  return new Response(JSON.stringify({ processed: results }), {
    headers: { "Content-Type": "application/json" },
  });
});
