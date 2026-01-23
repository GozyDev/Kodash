// components/user/UserMenu.tsx (SERVER)
import { createClient } from "@/lib/superbase/superbase-server";
import UserMenuClient from "./UserMenuClient";

export default async function UserMenu() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) return null;

  const user = data.user;

  return (
    <UserMenuClient
      user={{
        id: user.id,
        email: user.email,
        full_name: user.user_metadata.full_name,
        avatar_url: user.user_metadata.avatar_url,
      }}
    />
  );
}
