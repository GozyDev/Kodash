// app/api/tasks/route.ts
import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ project_id: string }> }
) {
  const { project_id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", project_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error", error);
    return NextResponse.json({ error: error.message });
  }

  console.log("Api DATA", data);

  return NextResponse.json(data);
}

// Create Task (POST)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ project_id: string }> }
) {
  const { project_id } = await params;
  const supabase = await createClient();
  const body = await req.json();
  const { title, description, priority, status, due_date } = body;
  const duecheck = due_date ? due_date : null;
  console.log("check", duecheck);
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      { project_id, title, description, priority, status, due_date: duecheck },
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
  const { id, ...updates } = body;
  const duecheck = updates.due_date ? updates.due_date : null;
  console.log("body", body);

  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, due_date: duecheck })
    .eq("id", id)
    .select()
    .single();

  if (error) {
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
