"use client";

import { ReactNode, useEffect } from "react";
import { useOrgIdStore } from "@/app/store/useOrgId";
import OrgHeader from "@/components/OrgHeader";
import { OrgSidebar } from "@/components/OrgSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function OrgLayoutClient({
  orgId,
  orgs,
  children,
}: {
  orgId: string;
  orgs: any;
  children: ReactNode;
}) {
  const setOrgId = useOrgIdStore((s) => s.setOrgId);

  useEffect(() => {
    setOrgId(orgId);
  }, [orgId]);

  return (
    <SidebarProvider>
      <OrgHeader orgs={orgs} orgId={orgId} />
      <div className="text-textNa flex w-full">
        <aside>
          <OrgSidebar orgId={orgId} />
        </aside>
        <main className="flex-1 pt-[74px]">
          <div className="flex w-full">
            <div className="flex-1">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
