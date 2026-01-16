// app/api/tasks/route.ts
import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse } from "next/server";
import { Task } from "@/lib/superbase/type";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  console.log(orgId)

  const query = supabase.from("tasks").select("*").eq("tenant_id", orgId);

  if (id) {
    const { data, error } = await query.eq("id", id).single();

    if (error) {
      console.log("Error", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.log("Error", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.log("Api DATA", data);

  return NextResponse.json(data);
}

// Create Task (POST)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const supabase = await createClient();

  // 1. Auth check
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Permission check: Only CLIENT can create issues/tasks
  const { getUserRole } = await import("@/lib/utils/role");
  const userRole = await getUserRole(authData.user.id, orgId);
  console.log(userRole)
  if (userRole !== "CLIENT") {
    return NextResponse.json(
      { error: "Only clients can create issues" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { title, description, priority, status, due_date } = body;
  if (!title || !title.toString().trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const duecheck = due_date ? due_date : null;
  console.log("check", duecheck);
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        title,
        description,
        priority,
        status: "draft",
        due_date: duecheck,
        tenant_id: orgId,
        created_by: authData.user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.log(error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // If client provided uploaded attachments, insert them into request_attachments
  try {
    const attachments = body.attachments;
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      // dedupe by file_url to avoid duplicates
      const seen = new Set<string>();
      const uniqueInserts: Array<{
        request_id: string;
        file_url: string;
        file_type: string | null;
        file_size: number | null;
        file_name?: string | null;
      }> = [];

      for (const a of attachments) {
        if (!a || !a.file_url) continue;
        if (seen.has(a.file_url)) continue;
        seen.add(a.file_url);
        uniqueInserts.push({
          request_id: data.id,
          file_url: a.file_url,
          file_type: a.file_type || null,
          file_size: a.file_size || null,
          file_name: a.file_name || null,
        });
      }

      if (uniqueInserts.length > 0) {
        const { error: attachErr } = await supabase
          .from("request_attachments")
          .insert(uniqueInserts);
        if (attachErr) {
          console.log(
            "Failed to insert request_attachments:",
            attachErr.message
          );
        }
      }
    }
  } catch (e) {
    console.log("Failed to process attachments:", e);
  }

  return NextResponse.json(data);
}

// Update Task (PATCH)
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { id, priority, status, title, description } = body;
  // const duecheck = updates.due_date ? updates.due_date : null;
  let updateObj: {
    priority?: Task["priority"];
    status?: Task["status"];
    title?: string;
    description?: string | null;
  } = {};

  if (priority !== undefined) {
    updateObj.priority = priority;
  }

  if (status !== undefined) {
    updateObj.status = status;
  }

  if (title !== undefined) {
    updateObj.title = title;
  }

  if (description !== undefined) {
    updateObj.description = description;
  }

  console.log("body", body);
  console.log(updateObj);

  const { data, error } = await supabase
    .from("tasks")
    .update(updateObj)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.log(error?.message);

    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

// Delete Task (DELETE)
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing task id" }, { status: 400 });
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
