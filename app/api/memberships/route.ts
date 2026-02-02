import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";

export async function GET(req: Request) {
  const svc = await createClient();
  const url = new URL(req.url);
  const orgId = url.searchParams.get("orgId");
  const membershipId = url.searchParams.get("id"); // New param

  // Logic: Prioritize single ID fetch for Realtime updates
  if (membershipId) {
    const { data, error } = await svc
      .from("memberships")
      .select(`
        id
        role,
        profiles(*),
        tenants("id","created_by")
      `)
      .eq("id", membershipId)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ membership: data });
  }

  // Fallback: Fetch all for an organization
  if (orgId) {
    const { data, error } = await svc
      .from("memberships")
      .select(`
        id,
        role,
        profiles(*),
        tenants("id","created_by")
      `)
      .eq("tenant_id", orgId);

    if (error){
      console.log(error)
       return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ memberships: data ?? [] });
  }

  return NextResponse.json({ error: "Missing orgId or id" }, { status: 400 });
}