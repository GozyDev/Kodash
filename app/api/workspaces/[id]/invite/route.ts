import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";
import { randomUUID } from "crypto";
import { Resend } from "resend";

// POST /api/workspaces/:id/invite
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
    console.log(email);

    const param = await params;

    const workspaceId = param.id;
    const token = randomUUID();

    // expire in 24 hours
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

    const payload: Record<string, string> = {
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
        { status: 500 },
      );
    }

    const inviteUrl = `${appUrl.replace(
      /\/$/,
      "",
    )}/invite?token=${encodeURIComponent(token)}`;

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 },
      );
    }

    const resend = new Resend(resendKey);
    const fromAddress =
      process.env.RESEND_FROM_EMAIL || "no-reply@kodash.online";

    const subject = "You've been invited to a workspace on Kodash";
    const html = `
      <div style="background-color: #020617; padding: 50px 20px; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #f8fafc;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          
          <div style="margin-bottom: 32px;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.05em; color: #ffffff;">KODASH</h1>
          </div>

          <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #ffffff;">You've been invited!</h2>
          <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
            You were invited to join a workspace on <strong>Kodash</strong>. Collaborate on requests, manage members, and track payments in one place.
          </p>

          <div style="margin-bottom: 32px;">
            <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #22c55e; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; text-align: center;">
              Accept Invitation
            </a>
          </div>

          <div style="border-top: 1px solid #1e293b; margin-bottom: 24px;"></div>

          <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Expiry</p>
          <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 13px;">This invitation link will expire in 24 hours.</p>
        </div>
        
        <div style="text-align: center; margin-top: 24px;">
          <p style="color: #475569; font-size: 12px;">&copy; ${new Date().getFullYear()} Kodash. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: email,
        subject,
        html,
      });

      console.log("Resend response:", { data, error, fromAddress }, "yh");

      if (error) {
        throw error;
      }
    } catch (sendErr: unknown) {
      if (sendErr instanceof Error) {
        console.error("Resend send error:", sendErr);
        return NextResponse.json({ error: sendErr.message }, { status: 500 });
      } else {
        return NextResponse.json(String(sendErr), { status: 500 });
      }
    }

    return NextResponse.json({ invite: insertData }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Resend send error:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      return NextResponse.json(String(err), { status: 500 });
    }
  }
}
