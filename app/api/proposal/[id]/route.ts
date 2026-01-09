import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";
import { getUserRole } from "@/lib/utils/role";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: issueId } = await params;

    // Fetch proposal for this issue
    const { data, error } = await supabase
      .from("request_proposal")
      .select("id, price, currency, due_date, dod,status")
      .eq("request_id", issueId)
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const proposal = data && data.length > 0 ? data[0] : null;

    // If proposal exists, update task status from "draft" to "proposed"
    if (proposal) {
      // Get the current task status
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("status")
        .eq("id", issueId)
        .single();

      if (!taskError && task && task.status === "draft") {
        // Update status to "proposed"
        const { error: updateError } = await supabase
          .from("tasks")
          .update({ status: "proposed" })
          .eq("id", issueId);

        if (updateError) {
          console.error("Failed to update task status:", updateError);
          // Don't fail the request, just log the error
        }
      }
    }

    return NextResponse.json({ proposal });
  } catch (err) {
    console.error("Proposal fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: issueId } = await params;

    // Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { status, id: proposalId } = body as { status?: string; id: string };
    console.log(status);
    if (!status || !["accepted", "canceled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Permission check: only CLIENT can accept/reject
    // Determine tenant/org for this task
    const { data: taskData, error: taskErr } = await supabase
      .from("tasks")
      .select("tenant_id")
      .eq("id", issueId)
      .single();

    if (taskErr || !taskData) {
      console.log("Task error");
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const userRole = await getUserRole(authData.user.id, taskData.tenant_id);
    if (userRole !== "CLIENT") {
      console.log("invalid role");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the proposal record for this request
    const { data, error } = await supabase
      .from("request_proposal")
      .update({ status: status.toLocaleLowerCase() })
      .eq("id", proposalId)
      .select("id, price, currency, due_date, dod, status")
      .single();

    console.log("Proposal", proposalId);
    console.log("Data", data);
    console.log("Data", issueId);

    if (error) {
      console.log("Failed to update proposal status:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const updated = data && data.length > 0 ? data[0] : null;
    // Also update the related request/task status mapping
    try {
      if (status === "accepted") {
        await supabase
          .from("tasks")
          .update({ status: "on-going" })
          .eq("id", issueId);
      }
    } catch (err) {
      console.log("Failed to update task status after proposal decision:", err);
      // continue, proposal update already succeeded
    }
    return NextResponse.json({ proposal: updated });
  } catch (err) {
    console.log("Proposal PATCH error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
