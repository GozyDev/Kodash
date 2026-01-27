// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const svc = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId");
    if (!orgId)
      return NextResponse.json({ error: "orgId required" }, { status: 400 });

    const { data, error } = await svc
      .from("projects")
      .select("*")
      .eq("tenant_id", orgId)
      .order("created_at", { ascending: false });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ projects: data ?? [] });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      return NextResponse.json(String(err), { status: 500 });
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, project_password, orgId } = body;
    if (!title || !orgId)
      return NextResponse.json(
        { error: "title and orgId required" },
        { status: 400 }
      );

    const { data, error } = await svc
      .from("projects")
      .insert([
        {
          title,
          description,
          project_password,
          tenant_id: orgId,
        },
      ])
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ project: data }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      return NextResponse.json(String(err), { status: 500 });
    }
  }
}
