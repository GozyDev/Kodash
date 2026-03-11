// app/actions/get-payout-timing.ts
"use server";

import { createClient } from "@/lib/superbase/superbase-server"; // Use your server-side client

export async function getPayoutTiming(issueId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select("delivered_at, amount")
    .eq("issueId", issueId)
    .eq("status", "held")
    .eq("type", "funding")
    .single();

  if (error || !data?.delivered_at) return null;

  return {
    deliveredAt: data.delivered_at,
    // Calculate the deadline (e.g., delivered_at + 10 minutes)
    // Match this logic to your Edge Function's INTERVAL
 autoPayoutAt: new Date(
  new Date(data.delivered_at).getTime() + 7 * 24 * 60 * 60 * 1000
).toISOString()

   
  };
}
