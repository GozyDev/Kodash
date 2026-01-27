// app/dashboard/organization/[orgId]/layout.tsx
import type { ReactNode } from "react";

import { createClient } from "@/lib/superbase/superbase-server";


export default async function OrgLayout({
  children,

}: {
  children: ReactNode;
 
}) {
  const supabase = await createClient();
  const { data: orgs, error } = await supabase
    .from("tenants")
    .select("id, name, plan");

  if (error) {
    console.log("Error", error.message);
  }

  console.log("Org", orgs);

  // handle if org not found: redirect or show fallback
  if (!orgs) {
    // optional: throw or show fallback UI
  }

  return (
    <>
      {/* OrgHeader can be a server component that accepts org */}
      
      <main>{children}</main>
    </>
  );
}
