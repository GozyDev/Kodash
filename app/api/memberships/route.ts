import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";

// GET: fetch memberships with profiles for a specific tenant
export async function GET(req: Request) {
  const svc = await createClient();
  const url = new URL(req.url);
  const orgId = url.searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  const { data, error } = await svc
    .from("memberships")
    .select(`
      role,
      profiles(*),
      tenants("id","created_by")
    `)
    .eq("tenant_id", orgId);
    console.log("MembershipDAta",data)
  if (error) {
    console.error("Error fetching memberships:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ memberships: data ?? [] });
}


