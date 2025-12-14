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

  const query = supabase.from("tasks").select("*");

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
  const body = await req.json();
  const { title, description, priority, status, due_date } = body;
  const duecheck = due_date ? due_date : null;
  console.log("check", duecheck);
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        title,
        description,
        priority,
        status,
        due_date: duecheck,
        tenant_id: orgId,
      },
    ])
    .select()
    .single();

  if (error) {
    console.log(error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
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
