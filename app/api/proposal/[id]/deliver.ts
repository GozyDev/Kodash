import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";
import { getUserRole } from "@/lib/utils/role";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: taskId } = await params;

    // Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, attachments, links } = body as {
      message: string;
      attachments: Array<{
        file_id?: string;
        file_url?: string;
        file_name?: string;
      }>;
      links: Array<{ url: string; label: string }>;
    };

    if (!message && attachments.length === 0 && links.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least a message, attachment, or link" },
        { status: 400 }
      );
    }

    // Get task to verify permissions and get tenant_id
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("tenant_id, title, project_id")
      .eq("id", taskId)
      .single();

    if (taskError || !taskData) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Permission check: only FREELANCER can deliver
    const userRole = await getUserRole(authData.user.id, taskData.tenant_id);
    if (userRole !== "FREELANCER") {
      return NextResponse.json(
        { error: "Only freelancers can submit deliveries" },
        { status: 403 }
      );
    }

    // Update task status to "delivered"
    const { error: updateTaskError } = await supabase
      .from("tasks")
      .update({ status: "delivered", updated_at: new Date().toISOString() })
      .eq("id", taskId);

    if (updateTaskError) {
      console.error("Failed to update task status:", updateTaskError);
      return NextResponse.json(
        { error: "Failed to update task status" },
        { status: 500 }
      );
    }

    // Store delivery details in a delivery record
    // Note: This assumes a 'deliveries' table exists with columns:
    // id, task_id, freelancer_id, message, attachments (JSON), links (JSON), created_at
    const { error: deliveryError } = await supabase
      .from("deliveries")
      .insert({
        task_id: taskId,
        freelancer_id: authData.user.id,
        message: message || null,
        attachments: attachments,
        links: links,
        created_at: new Date().toISOString(),
      });

    if (deliveryError) {
      console.error("Failed to create delivery record:", deliveryError);
      // Don't fail the request - task status was already updated
      // The delivery details can be inferred from task status change
    }

    // Also create attachment records in request_attachments table for visibility
    if (attachments.length > 0) {
      const attachmentRecords = attachments.map((att) => ({
        request_id: taskId,
        file_id: att.file_id,
        file_url: att.file_url,
        file_name: att.file_name,
        uploaded_by: authData.user.id,
        attachment_type: "delivery",
        created_at: new Date().toISOString(),
      }));

      const { error: attachmentError } = await supabase
        .from("request_attachments")
        .insert(attachmentRecords);

      if (attachmentError) {
        console.error("Failed to create attachment records:", attachmentError);
        // Don't fail - task status already updated
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Delivery submitted successfully",
        taskId: taskId,
        status: "delivered",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Delivery submission error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
