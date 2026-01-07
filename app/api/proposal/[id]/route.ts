import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";

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
