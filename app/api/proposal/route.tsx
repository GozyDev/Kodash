import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/utils/role";

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    // 1. Auth check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dod, price, requestId, deadline } = await req.json();

    console.log(dod, price, requestId, deadline);

    // Hard validation
    if (!dod || !price || !requestId || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Get the task/issue to find the orgId and check status
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("tenant_id, status")
      .eq("id", requestId)
      .single();

    if (taskError || !taskData) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // 3. Permission check: Only FREELANCER can create proposals
    const userRole = await getUserRole(authData.user.id, taskData.tenant_id);
    if (userRole !== "FREELANCER") {
      return NextResponse.json(
        { error: "Only freelancers can create proposals" },
        { status: 403 }
      );
    }

    // 4. Check if proposal already exists for this freelancer and request
    // const { data: existingProposal } = await supabase
    //   .from("request_proposal")
    //   .select("id")
    //   .eq("request_id", requestId)
    //   .eq("freelancer_id", authData.user.id)
    //   .single();

    // if (existingProposal) {
    //   return NextResponse.json(
    //     { error: "You have already submitted a proposal for this request" },
    //     { status: 400 }
    //   );
    // }

    // 5. Create proposal
    const { data: requestData, error } = await supabase
      .from("request_proposal")
      .insert([
        {
          dod,
          price,
          request_id: requestId,
          due_date: deadline,
          freelancer_id: authData.user.id,
          status: 'pending'
        },
      ])
      .select("id, dod, price, request_id, due_date")
      .single();

    if (error) {
      console.error("Create proposal error:", error);
      return NextResponse.json(
        { error: "Failed to create proposal" },
        { status: 500 }
      );
    }

    // 6. Update task status from "draft" to "proposed" if proposal was created successfully
    if (taskData.status === "draft" && requestData) {
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ status: "proposed" })
        .eq("id", requestId);

      if (updateError) {
        console.error("Failed to update task status:", updateError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json(requestData, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
