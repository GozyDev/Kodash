import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";

// GET: fetch tenants (workspaces) + projects count
export async function GET() {
  const svc = await createClient();

  const { data: authData, error: authError } = await svc.auth.getUser();

  if (authError) {
    console.error("User fetch error:", authError.message);
    return NextResponse.json({ error: authError.message }, { status: 401 });
  }

  const user = authData?.user;
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }
  // inside request scope

    const { data: tenants, error: getError } = await svc
    .from("memberships")
    .select(
      `
    role,
    tenant:tenants (
      id,
      name,
      plan,
      created_at,
      created_by
    )
  `
    )
    .eq("user_id", user.id)

    .order("created_at", { ascending: false });

  if (getError) {
    console.error("Error fetching tenants:", getError.message);
    return NextResponse.json({ error: getError.message }, { status: 500 });
  }

  return NextResponse.json({ workspaces: tenants ?? [] });
}

// POST: create a new workspace + membership
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
    const { name, role } = body; // role: 'freelancer' | 'client'

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (
      !role ||
      !["freelancer", "client"].includes(String(role).toLowerCase())
    ) {
      return NextResponse.json(
        { error: "Role must be 'freelancer' or 'client'" },
        { status: 400 }
      );
    }


    const { data, error } = await svc.rpc("debug_auth_uid");
console.log('Debug',data);


    // Create workspace (stored in tenants table)
    const { data: tenantData, error: tenantError } = await svc
      .from("tenants")
      .insert({ name, created_by: user.id })
      .select("id")
      .single();

    if (tenantError || !tenantData) {
      console.error("Tenant insert error:", tenantError?.message);
      return NextResponse.json(
        { error: tenantError?.message ?? "Failed to create tenant" },
        { status: 500 }
      );
    }

    // Create membership - use provided role (map to uppercase)
    const membershipRole = String(role).toUpperCase();
    const { data: membershipData, error: membershipError } = await svc
      .from("memberships")
      .insert({
        user_id: user.id,
        tenant_id: tenantData.id,
        role: membershipRole,
      });

    if (membershipError) {
      console.error("Membership insert error:", membershipError.message);
      return NextResponse.json(
        { error: membershipError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ workspace: tenantData }, { status: 201 });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
