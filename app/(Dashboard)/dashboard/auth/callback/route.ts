import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server"; 
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  let next = searchParams.get("next") ?? "/dashboard/organizations";
  if (!next.startsWith("/")) next = "/";

  if (code) {
    console.log("gottenode",code)
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    // ✅ if login successful, create/update profile
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
         await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            full_name:
              user.user_metadata.full_name || user.user_metadata.name || "",
            avatar_url: user.user_metadata.avatar_url || "",
          });

       
      }

      // ✅ handle redirects depending on environment
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // ❌ if something went wrong
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
