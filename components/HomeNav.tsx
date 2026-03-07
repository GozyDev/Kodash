import React from "react";
import { createClient } from "@/lib/superbase/superbase-server";
import HomeNavClient from "./HomeNavClient";
import HomeNavClientMobile from "./HomeNacMobile";

const HomeNav = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <HomeNavClient user={user} />
      <HomeNavClientMobile user={user}  />
    </>
  );
};

export default HomeNav;
