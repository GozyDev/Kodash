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

  // Add stripe_return parameter to mark this as a Stripe redirect
  const returnUrl = `${origin}/${returnTo}${returnTo.includes("?") ? "&" : "?"}stripe_return=true`;

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    type: "account_onboarding",
    refresh_url: returnUrl,
    return_url: returnUrl,
  });

  redirect(accountLink.url);
}


export async function getStripeDashboardLink() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // 1. Get the Stripe ID from DB
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_connect_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_connect_id) {
    throw new Error("No Stripe account found");
  }

  // 2. Generate the Login Link
  // This creates a one-time use link that logs them into their Express Dashboard
  const loginLink = await stripe.accounts.createLoginLink(
    profile.stripe_connect_id
  );

  return loginLink.url;
}
