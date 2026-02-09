"use server";

import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/superbase/superbase-server";
import { redirect } from "next/navigation";

export default async function onboardFreelancer({
  returnTo,
}: {
  returnTo: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    throw new Error("Not authenticated");
  }

  // Create Stripe Express account
  const account = await stripe.accounts.create({
    type: "express",
  });

  // Save Stripe account ID
  const { error: dbError } = await supabase
    .from("profiles")
    .update({ stripe_connect_id: account.id })
    .eq("id", user.id);

  if (dbError) {
    throw new Error("Failed to save Stripe account");
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL;
  if (!origin) {
    throw new Error("NEXT_PUBLIC_APP_URL not set");
  }

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    type: "account_onboarding",
    refresh_url: `${origin}/${returnTo}`,
    return_url: `${origin}/${returnTo}`,
  });

  redirect(accountLink.url);
}
