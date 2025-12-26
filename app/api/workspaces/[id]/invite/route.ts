import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";
import { randomUUID } from "crypto";

// POST /api/workspaces/:id/invite
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const svc = await createClient();

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
    const { email, role, organizationId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const workspaceId = params.id;

    const token = randomUUID();

    // expire in 24 hours
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

    const payload: Record<string, any> = {
      workspace_id: workspaceId,
      email,
      role,
      token,
      status: "pending",
      expires_at: expiresAt,
    };

    if (organizationId) payload.organization_id = organizationId;

    const { data: insertData, error: insertError } = await svc
      .from("workspace_invites")
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      console.error("Invite insert error:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ invite: insertData }, { status: 201 });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
