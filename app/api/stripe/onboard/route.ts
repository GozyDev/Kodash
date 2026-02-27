import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { returnTo } = body as { returnTo?: string };

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Create Stripe Express account
    const account = await stripe.accounts.create({ type: "express" });

    // Save Stripe account ID on profile
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ stripe_connect_id: account.id })
      .eq("id", user.id);

    if (dbError) {
      console.error("Failed to save Stripe account id", dbError);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL;
    if (!origin) {
      return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL not set" }, { status: 500 });
    }

    // Build return URL (ensure single slash)
    const prefix = returnTo && returnTo.startsWith("/") ? "" : "/";
    const returnUrl = `${origin}${prefix}${returnTo || ""}${(returnTo || "").includes("?") ? "&" : "?"}stripe_return=true`;
    console.log(returnUrl)

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: "account_onboarding",
      refresh_url: returnUrl,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err:unknown) {
    if (err instanceof Error) {
      console.error("/api/stripe/onboard error", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      console.error("/api/stripe/onboard error", err);
      return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
  }
}
