import { Suspense } from "react";
import { PaymentStats } from "@/components/PaymentStats";

export default async function PaymentsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  console.log(orgId,"orgId")

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-textNb">Payments</h1>

      {/* Composable Stats Section */}
      <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-bgPrimary border border-cardCB" />}>
        <PaymentStats orgId={orgId} />
      </Suspense>

      {/* Your Transaction Table will go here next */}
    </main>
  );
}