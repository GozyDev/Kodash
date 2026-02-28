"use client";

import { ReactNode, useEffect } from "react";
import { useOrgIdStore } from "@/app/store/useOrgId";
import { OrgSidebar } from "@/components/OrgSidebar";
import StripeReturnListener from "./StripeReturnListener";

export default function OrgLayoutClient({
  orgId,
  role,
  stripeStatus,
  children,
}: {
  orgId: string;
  role: "client" | "freelancer";
  children: ReactNode;
  stripeStatus: string;
}) {
  const { setOrgId } = useOrgIdStore();

  useEffect(() => {
    setOrgId(orgId);
  }, [orgId, setOrgId]);

  return (
    <>
      <div className="text-textNa flex w-full">
        <aside>
          <StripeReturnListener />
          <OrgSidebar orgId={orgId} role={role} stripeStatus={stripeStatus} />
        </aside>
        <main className=" w-full pt-[68px] flex">
          <div className=" flex-1 min-w-0">{children}</div>
        </main>
      </div>
    </>
  );
}
