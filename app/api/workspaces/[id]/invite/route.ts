import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";
import { randomUUID } from "crypto";
import { Resend } from "resend";

// POST /api/workspaces/:id/invite
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { email, role } = body;

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

    const { data: insertData, error: insertError } = await svc
      .from("workspace_invites")
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      console.error("Invite insert error:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Build invite URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error("NEXT_PUBLIC_APP_URL is not set");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const inviteUrl = `${appUrl.replace(
      /\/$/,
      ""
    )}/invite?token=${encodeURIComponent(token)}`;

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const resend = new Resend(resendKey);
    const fromAddress = process.env.RESEND_FROM_EMAIL || "no-reply@kodash.com";

    const subject = "You've been invited to a workspace on Kodash";
    const html = `
      <div style="font-family:system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial; color:#0f172a;">
        <h2 style="margin:0 0 8px 0">You've been invited to a workspace on Kodash</h2>
        <p style="margin:0 0 16px 0">You were invited to join a workspace. Click the button below to accept the invite. This link expires in 24 hours.</p>
        <p style="margin:0 0 24px 0"><a href="${inviteUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">Accept invitation</a></p>
        <p style="margin:0;color:#64748b;font-size:13px">If the button doesn't work, paste this URL into your browser:</p>
        <p style="word-break:break-all;font-size:13px;color:#0f172a">${inviteUrl}</p>
      </div>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject,
        html,
      });

      console.log("Resend response:", { data, error });

      if (error) {
        throw error;
      }
    } catch (sendErr: any) {
      console.error("Resend send error:", sendErr);
      return NextResponse.json(
        { error: "Failed to send invite email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invite: insertData }, { status: 201 });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
