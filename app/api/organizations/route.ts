import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";

const svc = await createClient();

export async function GET() {
  const { data, error } = await svc
    .from("tenants")
    .select("id, name, plan, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ organizations: data ?? [] });
}

export async function POST(request: Request) {
  try {
    // get user session if you’re using client tokens
    const {
      data: { user },
      error: userError,
    } = await svc.auth.getUser();

    if (userError) {
      console.error("User fetch error:", userError.message);
      return NextResponse.json({ error: userError.message }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const body = await request.json();
    const { name, plan, type } = body;

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const { data, error } = await svc
      .from("tenants")
      .insert({ name, plan, type, created_by: user.id })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ organization: data }, { status: 201 });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
