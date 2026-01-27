import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/superbase/superbase-server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (error) {
      // redirect user to error page with error message
      redirect(`/error?msg=${error.message}`);
    } else {
      // redirect user to specified redirect URL or root of app
      redirect("/dashboard/organization");
    }
  }

  // redirect the user to an error page with some instructions
  redirect("/error");
}
