"use server";

import { createClient } from "@/lib/superbase/superbase-server";
import { getUserRole } from "@/lib/utils/role";
import { stripe } from "@/lib/stripe";

export interface Delivery {
  id: string;
  issueId: string;
  freelancer_id: string;
  message: string | null;
  status: "pending" | "in_review" | "approved" | "rejected";
  attachments: Array<{
    file_id: string;
    file_url: string;
    file_name: string;
    file_size?: number;
  }>;
  links: Array<{
    url: string;
    label: string;
  }>;
  created_at: string;
}
 
export async function fetchDeliveries(taskId: string): Promise<Delivery[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("deliverables")
      .select("*")
      .eq("issueId", taskId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch deliveries:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Deliveries fetch error:", err);
    return [];
  }
}

export async function releaseFunds(taskId: string, orgId: string) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error("Unauthorized");
    }

    // Get task to verify permissions
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("tenant_id")
      .eq("id", taskId)
      .single();

    if (taskError || !taskData) {
      throw new Error("Task not found");
    }

    // Permission check: only CLIENT can release funds
    const userRole = await getUserRole(authData.user.id, taskData.tenant_id);
    if (userRole !== "CLIENT") {
      throw new Error("Only clients can release funds");
    }

    // Find the payment record for this task
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .select("id, status")
      .eq("issueId", taskId)
      .eq("orgId", orgId)
      .single();

    if (paymentError || !paymentData) {
      throw new Error("Payment record not found");
    }

    // Update payment status to "releasing"
    const { error: updateError } = await supabase
      .from("payments")
      .update({ status: "releasing", updated_at: new Date().toISOString() })
      .eq("id", paymentData.id);

    if (updateError) {
      throw new Error("Failed to update payment status");
    }

    return {
      success: true,
      message: "Funds release initiated successfully",
    };
  } catch (err: any) {
    console.error("Release funds error:", err);
    throw err;
  }
}

export async function markDeliveryAsInReview(deliveryId: string) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error("Unauthorized");
    }

    // Get delivery to verify permissions and check current status
    const { data: deliveryData, error: deliveryError } = await supabase
      .from("deliverables")
      .select("id, issueId, status")
      .eq("id", deliveryId)
      .single();

    if (deliveryError || !deliveryData) {
      throw new Error("Delivery not found");
    }

    // Only update if current status is "pending" to avoid overwriting approved/rejected
    if (deliveryData.status !== "pending") {
      return {
        success: true,
        message: "Delivery status already updated",
      };
    }

    // Get task to verify user role
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("tenant_id")
      .eq("id", deliveryData.issueId)
      .single();

    if (taskError || !taskData) {
      throw new Error("Task not found");
    }

    // Permission check: only CLIENT can mark as in_review
    const userRole = await getUserRole(authData.user.id, taskData.tenant_id);
    if (userRole !== "CLIENT") {
      throw new Error("Only clients can review deliveries");
    }

    // Update delivery status to "in_review"
    const { error: updateError } = await supabase
      .from("deliverables")
      .update({ status: "in_review"})
      .eq("id", deliveryId);

    if (updateError) {
      throw new Error("Failed to update delivery status");
    }

    return {
      success: true,
      message: "Delivery marked as in review",
    };
  } catch (err: any) {
    console.error("Mark delivery as in review error:", err);
    throw err;
  }
}

export async function approveDelivery(
  deliveryId: string,
  taskId: string,
  orgId?: string
) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error("Unauthorized");
    }

    // Get task to verify user role and get tenant_id
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("tenant_id")
      .eq("id", taskId)
      .single();

    if (taskError || !taskData) {
      throw new Error("Task not found");
    }

    // Use provided orgId or fall back to task's tenant_id
    const finalOrgId = orgId || taskData.tenant_id;

    // Permission check: only CLIENT can approve
    const userRole = await getUserRole(authData.user.id, taskData.tenant_id);
    if (userRole !== "CLIENT") {
      throw new Error("Only clients can approve deliveries");
    }

    // Get delivery to verify it exists
    const { data: deliveryData, error: deliveryError } = await supabase
      .from("deliverables")
      .select("id, issueId, status")
      .eq("id", deliveryId)
      .single();

    if (deliveryError || !deliveryData) {
      throw new Error("Delivery not found");
    }

    // Query payments table for the original funding record
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .select("id, amount, proposal_id, currency, stripe_payment_id")
      .eq("issueId", taskId)
      .eq("type", "funding")
      .eq("status", "held")
      .single();

    if (paymentError || !paymentData) {
      throw new Error("Payment record not found or not in held status");
    }

    const { amount, proposal_id, currency, stripe_payment_id } = paymentData;

    // Fetch Stripe payment intent to get actual fees charged
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(stripe_payment_id);
    } catch (err) {
      console.error("Failed to retrieve payment intent:", err);
      throw new Error("Failed to retrieve payment details from Stripe");
    }

    // Calculate net amount and fees
    const stripeFeeCharged = amount - (paymentIntent.amount_received || amount);
    const netAmount = paymentIntent.amount_received || amount;
    const platformFee = Math.round(netAmount * 0.04); // 4% platform fee
    const freelancerAmount = netAmount - platformFee;

    console.log("Payment breakdown:", {
      originalAmount: amount / 100,
      stripeFee: stripeFeeCharged / 100,
      netAmount: netAmount / 100,
      platformFee: platformFee / 100,
      freelancerAmount: freelancerAmount / 100,
    });

    // Query request_proposal to get freelancer_id
    const { data: proposalData, error: proposalError } = await supabase
      .from("request_proposal")
      .select("freelancer_id")
      .eq("id", proposal_id)
      .single();

    if (proposalError || !proposalData) {
      throw new Error("Proposal record not found");
    }

    const { freelancer_id } = proposalData;

    // Query profiles to get stripe_connect_id
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_connect_id, stripe_onboarding_status")
      .eq("id", freelancer_id)
      .single();

    if (profileError || !profileData) {
      throw new Error("Freelancer profile not found");
    }

    const { stripe_connect_id, stripe_onboarding_status } = profileData;

    // Verify stripe_connect_id exists and is completed
    if (!stripe_connect_id) {
      throw new Error("Freelancer has not set up Stripe Connect");
    }

    if (stripe_onboarding_status !== "completed") {
      throw new Error("Freelancer's Stripe onboarding is not completed");
    }

    // Create Stripe transfer with freelancer's net amount (after fees)
    let transfer;
    try {
      transfer = await stripe.transfers.create({
        amount: freelancerAmount, // Transfer only what freelancer earns
        currency: currency || "usd",
        destination: stripe_connect_id,
        metadata: {
          issueId: taskId,
          proposalId: proposal_id,
          deliveryId: deliveryId,
          orgId: finalOrgId,
          freelancerId: freelancer_id,
          grossAmount: amount.toString(), // Original amount in cents
          stripeFee: stripeFeeCharged.toString(),
          platformFee: platformFee.toString(),
          netAmount: netAmount.toString(),
          freelancerAmount: freelancerAmount.toString(),
        },
      });
    } catch (stripeError: any) {
      console.error("Stripe transfer error:", stripeError);
      throw new Error(`Stripe transfer failed: ${stripeError.message}`);
    }

    // Update delivery status to "approved"
    const { error: updateDeliveryError } = await supabase
      .from("deliverables")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", deliveryId);

    if (updateDeliveryError) {
      throw new Error("Failed to update delivery status");
    }

    // Return transfer ID for reference
    return {
      success: true,
      message: "Delivery approved and payment released",
      transferId: transfer.id,
    };
  } catch (err: any) {
    console.error("Approve delivery error:", err);
    throw err;
  }
}

export async function requestDeliveryRevision(
  deliveryId: string,
  taskId: string,
  reason: string
) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error("Unauthorized");
    }

    // Get task to verify user role
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("tenant_id")
      .eq("id", taskId)
      .single();

    if (taskError || !taskData) {
      throw new Error("Task not found");
    }

    // Permission check: only CLIENT can request revisions
    const userRole = await getUserRole(authData.user.id, taskData.tenant_id);
    if (userRole !== "CLIENT") {
      throw new Error("Only clients can request revisions");
    }

    // Update delivery status to "rejected" with reason
    const { error: updateError } = await supabase
      .from("deliverables")
      .update({
        status: "rejected",
        revision_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", deliveryId);

    if (updateError) {
      throw new Error("Failed to request revision");
    }

    return {
      success: true,
      message: "Revision requested",
    };
  } catch (err: any) {
    console.error("Request revision error:", err);
    throw err;
  }
}
