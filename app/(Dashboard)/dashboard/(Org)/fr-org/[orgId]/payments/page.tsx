import { Suspense } from "react";
import { PaymentStats } from "@/components/PaymentStats";
import { PaymentTable } from "@/components/PaymentTable";
import { PaymentFilters } from "@/components/PaymentFilters";
import { createClient } from "@/lib/superbase/superbase-server";
import { getUserRole } from "@/lib/utils/role";

export default async function PaymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ status?: string; sortBy?: string }>;
}) {
  const { orgId } = await params;
  const filters = await searchParams;
  
  // Get current user
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  
  // Get user role
  let userRole: "CLIENT" | "FREELANCER" | null = null;
  if (authData.user) {
    userRole = await getUserRole(authData.user.id, orgId);
  }

  return (
    <main className="py-6 px-3 md:px-6 ">
      <h1 className="text-2xl font-bold mb-6 text-textNb">Payments</h1>

      {/* Composable Stats Section */}
      <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-bgPrimary border border-cardCB" />}>
        <PaymentStats orgId={orgId} />
      </Suspense>

      {/* Your Transaction Table will go here next */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-textNb">Transaction History</h2>
        
        {/* Filters */}
        <PaymentFilters orgId={orgId} />

        {/* Payment Table */}
        <Suspense
          fallback={
            <div className="rounded-lg border border-cardCB bg-bgPrimary p-8 text-center">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-cardCB/50 rounded"></div>
                <div className="h-4 bg-cardCB/50 rounded"></div>
                <div className="h-4 bg-cardCB/50 rounded"></div>
              </div>
            </div>
          }
        >
          <PaymentTable orgId={orgId} searchParams={filters} userRole={userRole} />
        </Suspense>
      </div>
    </main>
  );
}