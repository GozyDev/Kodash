// app/api/auth/logout/route.ts
import { createClient } from "@/lib/superbase/superbase-server";
import { redirect } from "next/navigation";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/dashboard/auth/sign_in")
}
