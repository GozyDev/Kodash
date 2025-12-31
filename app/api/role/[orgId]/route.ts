import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";
import { getUserRole } from "@/lib/utils/role";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getUserRole(authData.user.id, orgId);
  if (!role) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  return NextResponse.json({ role: role.toLowerCase() });
}

