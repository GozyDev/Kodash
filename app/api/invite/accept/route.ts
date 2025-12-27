import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";

// POST /api/invite/accept
export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    // 1. Auth check
    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = authData.user;

    // 2. Read token
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Invite token is required" },
        { status: 400 }
      );
    }

    // 3. Fetch invite
    const { data: invite, error: inviteError } = await supabase
      .from("workspace_invites")
      .select("*")
      .eq("token", token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Invalid invite" },
        { status: 404 }
      );
    }

    // 4. Validate invite state
    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "Invite already used or revoked" },
        { status: 400 }
      );
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invite has expired" },
        { status: 400 }
      );
    }

    // 5. Email match (CRITICAL)
    if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "Invite email does not match logged-in user" },
        { status: 403 }
      );
    }

    // 6. Create membership (use tenant_id column used elsewhere in the codebase)
    const { error: memberError } = await supabase
      .from("memberships")
      .insert({
        tenant_id: invite.workspace_id,
        user_id: user.id,
        role: invite.role.toUpperCase(),
      });

    if (memberError) {
      return NextResponse.json(
        { error: memberError.message },
        { status: 500 }
      );
    }

    // 7. Mark invite accepted
    const { error: updateError } = await supabase
      .from("workspace_invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Accept invite error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
