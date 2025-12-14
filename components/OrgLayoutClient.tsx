"use client";

import { ReactNode, useEffect } from "react";
import { useOrgIdStore } from "@/app/store/useOrgId";
import { OrgSidebar } from "@/components/OrgSidebar";

export default function OrgLayoutClient({
  orgId,
  children,
}: {
  orgId: string;

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
          <OrgSidebar orgId={orgId} />
        </aside>
        <main className="flex-1 pt-[74px]">
          <div className="flex w-full">
            <div className="flex-1">{children}</div>
          </div>
        </main>
      </div>
    </>
  );
}
