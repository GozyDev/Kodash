"use client";

import { ReactNode, useEffect } from "react";
import { useOrgIdStore } from "@/app/store/useOrgId";
import { OrgSidebar } from "@/components/OrgSidebar";
import { SidebarHeader, SidebarTrigger } from "./ui/sidebar";

export default function OrgLayoutClient({
  orgId,
  role,
  children,
}: {
  orgId: string;
  role: "client" | "freelancer";
  children: ReactNode;
}) {
  const setOrgId = useOrgIdStore((s) => s.setOrgId);

  useEffect(() => {
    setOrgId(orgId);
  }, [orgId]);

  return (
    <>
      <div className="text-textNa flex w-full">
        <aside>
          <OrgSidebar orgId={orgId} role={role} />
        </aside>
        <main className="flex-1 pt-[68px] ">
          <div className="flex w-full">
            <div className="flex-1">{children}</div>
          </div>
        </main>
      </div>
    </>
  );
}
