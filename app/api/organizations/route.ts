import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";

// GET: fetch tenants + projects count
export async function GET() {
  const svc = await createClient(); // inside request scope

  const { data: tenants, error: getError } = await svc
    .from("tenants")
    .select(`id, name, plan, created_at, projects(count)`)
    .order("created_at", { ascending: false });

  if (getError) {
    console.error("Error fetching tenants:", getError.message);
    return NextResponse.json({ error: getError.message }, { status: 500 });
  }

  return NextResponse.json({ organizations: tenants ?? [] });
}

// POST: create a new tenant + membership
export async function POST(request: Request) {
  const svc = await createClient(); // inside request scope

  try {
    const { data: authData, error: authError } = await svc.auth.getUser();

    if (authError) {
      console.error("User fetch error:", authError.message);
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    const user = authData?.user;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const body = await request.json();
    const { name, plan, type } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create tenant
    const { data: tenantData, error: tenantError } = await svc
      .from("tenants")
      .insert({ name, plan, type, created_by: user.id })
      .select("id")
      .single();

    if (tenantError || !tenantData) {
      console.error("Tenant insert error:", tenantError?.message);
      return NextResponse.json({ error: tenantError?.message ?? "Failed to create tenant" }, { status: 500 });
    }

    // Create membership
    const { data: membershipData, error: membershipError } = await svc
      .from("memberships")
      .insert({
        user_id: user.id,
        tenant_id: tenantData.id,
        role: "member",
      });

    if (membershipError) {
      console.error("Membership insert error:", membershipError.message);
      return NextResponse.json({ error: membershipError.message }, { status: 500 });
    }

    return NextResponse.json({ organization: tenantData }, { status: 201 });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
