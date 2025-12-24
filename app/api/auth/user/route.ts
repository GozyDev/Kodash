import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";

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

  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
