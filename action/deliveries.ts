"use server";

import { createClient } from "@/lib/superbase/superbase-server";
import { getUserRole } from "@/lib/utils/role";

export interface Delivery {
  id: string;
  issueId: string;
  freelancer_id: string;
  message: string | null;
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
