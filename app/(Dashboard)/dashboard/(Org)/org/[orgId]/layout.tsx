// app/dashboard/organization/[orgId]/layout.tsx
import type { ReactNode } from "react";
import OrgHeader from "@/components/OrgHeader";
import { OrgSidebar } from "@/components/OrgSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/superbase/superbase-server";

export default async function OrgLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
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
    <SidebarProvider>
      <OrgHeader orgs={orgs} orgId={orgId} />
      <div className="text-textNa flex w-full">
        <aside>
          <OrgSidebar orgId={orgId} />
        </aside>
        <main className="flex-1 pt-[74px]">
          <div className="flex w-full">
            {/* <SidebarTrigger /> */}
            <div className="flex-1">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}