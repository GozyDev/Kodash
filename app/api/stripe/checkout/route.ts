import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { issueId, proposalId, orgId, returnTo: rawReturnTo } = await req.json();
    // normalize return path: ensure leading slash and default to dashboard later
    const returnTo = rawReturnTo && rawReturnTo.startsWith("/") ? rawReturnTo : `/${rawReturnTo || "dashboard"}`;

    // 1. Fetch the Proposal
    const { data: proposal, error: propError } = await supabase
      .from("request_proposal")
      .select("*, freelancer:freelancer_id(id, email)")
      .eq("id", proposalId)
      .single();

    if (propError || !proposal)
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 },
      );

    // 2. Fetch Freelancer's Stripe ID
    const { data: freelancerProfile } = await supabase
      .from("profiles")
      .select("stripe_connect_id")
      .eq("id", proposal.freelancer.id)
      .single();

    if (!freelancerProfile?.stripe_connect_id) {
      return NextResponse.json(
        { error: "Freelancer has not connected Stripe yet" },
        { status: 400 },
      );
    }

    const { data: RequestData, error: RequestError } = await supabase
      .from("tasks")
      .select("title")
      .eq("id", issueId)
      .single();

    if (!RequestData || RequestError) {
      return NextResponse.json(
        { error: "Can't find the request details for payment" },
        { status: 404 },
      );
    }
    const origin = process.env.NEXT_PUBLIC_URL! || "http://localhost:3000";


    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: proposal.currency || "usd",
            product_data: {
              name: `${RequestData.title}`,
              description: `PROPOSAL DETAILS:\n${proposal.dod.trim()}`,
            },
            unit_amount: Math.round(proposal.price * 100),
          },
          quantity: 1,
        },
      ],

      metadata: {
        issueId: issueId,
        proposalId: proposalId,
        orgId: orgId,
      },

      // encode the return path so query string is valid
      success_url: `${origin}/dashboard/payment/success?return=${encodeURIComponent(returnTo)}`,
      cancel_url: `${origin}/dashboard/payment/cancel?return=${encodeURIComponent(returnTo)}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Checkout Error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      console.error("Checkout Error:", err);
      return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }

  }
}
