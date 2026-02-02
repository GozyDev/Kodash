import React from "react";
import { createClient } from "@/lib/superbase/superbase-server";
import AcceptButton from "@/app/invite/AcceptButton";
import Image from "next/image";

type Props = {
  searchParams?: { token?: string };
};

export default async function InvitePage({ searchParams }: Props) {
  const token = searchParams?.token;

  if (!token) {
    return (
      <div className="p-6 text-textNa h-screen flex flex-col justify-center items-center">
        <Image
          src="/Logo.png"
          alt="Kodash Logo"
          width={100}
          height={100}
          className="mb-5"
        />

        <h1 className="text-xl font-semibold">Invalid invite link</h1>
        <p className="mt-2">No invite token was provided.</p>
      </div>
    );
  }

  const svc = await createClient();

  // validate invite
  const now = new Date().toISOString();
  const { data: invite, error: inviteError } = await svc
    .from("workspace_invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .gt("expires_at", now)
    .maybeSingle();

  if (inviteError || !invite) {
    return (
      <div className="p-6 text-textNa h-screen flex flex-col justify-center items-center">
        <Image
          src="/Logo.png"
          alt="Kodash Logo"
          width={100}
          height={100}
          className="mb-5"
        />
        <h1 className="text-xl font-semibold">Invite expired or invalid</h1>
        <p className="mt-2">This invite is either invalid or has expired.</p>
      </div>
    );
  }

  const { data: authData } = await svc.auth.getUser();
  const user = authData?.user || null;

  // If not authenticated, show summary and prompt to sign in/up
  if (!user) {
    const redirect = encodeURIComponent(`/invite?token=${token}`);
    return (
      <div className="p-6 text-textNa h-screen flex flex-col justify-center items-center">
        <Image
          src="/Logo.png"
          alt="Kodash Logo"
          width={100}
          height={100}
          className="mb-5"
        />
        <h1 className="text-xl font-semibold">You&apos;ve been invited</h1>
        <p className="mt-2">Email: {invite.email}</p>
        <p className="mt-1 capitalize">Resigter to kodask to accept the invitation</p>
        <div className="mt-4 space-x-3">
          <a
            href={`/api/auth/google?redirectTo=${redirect}`}
            className="inline-block px-4 py-2    text-white rounded"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  // Authenticated: verify email matches
  if ((user.email || "").toLowerCase() !== (invite.email || "").toLowerCase()) {
    return (
      <div className="p-6 text-textNa h-screen flex flex-col justify-center items-center ">
        <Image
          src="/Logo.png"
          alt="Kodash Logo"
          width={100}
          height={100}
          className="mb-5"
        />
        <h1 className="text-xl font-semibold">
          This invite is not for your email
        </h1>
        <p className="mt-2">Signed in as: {user.email}</p>
        <p className="mt-1">Invite for: {invite.email}</p>
      </div>
    );
  }

  let worspaceName;

  if (invite && user) {
    const { data } = await svc
      .from("tenants")
      .select("name")
      .eq("id", invite.workspace_id)
      .maybeSingle();

    if (data) {
      worspaceName = data.name;
    }
  }
  // Client component for accepting the invite
  return (
    <div className="p-6 text-textNa h-screen flex flex-col justify-center items-center">
      <Image
        src="/Logo.png"
        alt="Kodash Logo"
        width={100}
        height={100}
        className="mb-5"
      />
      <h1 className="text-xl font-semibold">Accept workspace invite</h1>
      <p className="mt-2 text-textNb">You are signing in as {user.email}</p>
      <p className="mt-1 text-textNb">
        to {worspaceName} workspace as a {invite.role}
      </p>
      <AcceptButton token={token} />
    </div>
  );
}

// Accept button is implemented in a client component at ./AcceptButton
