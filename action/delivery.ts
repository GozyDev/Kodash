"use server";

import { createClient } from "@/lib/superbase/superbase-server";
import { getUserRole } from "@/lib/utils/role";

interface DeliveryData {
  message: string;
  attachments: Array<{
    file_id?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
  }>;
  links: Array<{ url: string; label: string }>;
}

export async function submitDelivery(taskId: string, data: DeliveryData) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error("Unauthorized");
    }

    const { message, attachments, links } = data;

    if (!message && attachments.length === 0 && links.length === 0) {
      throw new Error(
        "Please provide at least a message, attachment, or link"
      );
    }

    // Get task to verify permissions and get tenant_id
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("tenant_id, title")
      .eq("id", taskId)
      .single();

      console.log("Request",taskId)
    if (taskError || !taskData) {
      console.log(taskError);
      throw new Error("Task not found");
    }

    // Permission check: only FREELANCER can deliver
    const userRole = await getUserRole(authData.user.id, taskData.tenant_id);
    if (userRole !== "FREELANCER") {
      throw new Error("Only freelancers can submit deliveries");
    }

    // Update task status to "delivered"
    const { error: updateTaskError } = await supabase
      .from("tasks")
      .update({ status: "delivered", updated_at: new Date().toISOString() })
      .eq("id", taskId);

    if (updateTaskError) {
      console.error("Failed to update task status:", updateTaskError);
      throw new Error("Failed to update task status");
    }

    // Filter attachments to only include required fields
    const filteredAttachments = attachments.map((att) => {
      const filtered: {
        file_id?: string;
        file_url?: string;
        file_name?: string;
        file_size?: number;
      } = {
        file_id: att.file_id,
        file_url: att.file_url,
        file_name: att.file_name,
      };
      if (att.file_size) {
        filtered.file_size = att.file_size;
      }
      return filtered;
    });

    // Filter links to only include URL and label
    const filteredLinks = links.map((link) => ({
      url: link.url,
      label: link.label,
    }));

    // Create delivery record
    const { error: deliveryError } = await supabase
      .from("deliverables")
      .insert({
        issueId: taskId,
        freelancer_id: authData.user.id,
        message: message || null,
        attachments: filteredAttachments,
        links: filteredLinks,
      });

      console.log(attachments)

    if (deliveryError) {
      console.error("Failed to create delivery record:", deliveryError);
      // Don't fail - task status already updated
    }

    // // Create attachment records if any
    // if (attachments.length > 0) {
    //   const attachmentRecords = attachments.map((att) => ({
    //     request_id: taskId,
    //     file_id: att.file_id,
    //     file_url: att.file_url,
    //     file_name: att.file_name,
    //     uploaded_by: authData.user.id,
    //     attachment_type: "delivery",
    //     created_at: new Date().toISOString(),
    //   }));

    //   const { error: attachmentError } = await supabase
    //     .from("request_attachments")
    //     .insert(attachmentRecords);

    //   if (attachmentError) {
    //     console.error("Failed to create attachment records:", attachmentError);
    //     // Don't fail - task status already updated
    //   }
    // }

    return {
      success: true,
      message: "Delivery submitted successfully",
      taskId: taskId,
      status: "delivered",
    };
  } catch (err: unknown) {
    console.error("Delivery submission error:", err);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Delivery submission failed with an unknown error");
  }
}
