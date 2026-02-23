import { createClient } from "@/lib/superbase/superbase-server";
import { StatCard } from "@/components/StatCard";
import { ShieldCheck, Clock } from "lucide-react";

export async function PaymentStats({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  // Fetch only the columns we need to aggregate
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, status")
    .eq("orgId", orgId); // Or link via proposalId if org_id isn't in payments table

  console.log("Payment", payments);
  // Calculate Totals
  const securedCents =
    payments
      ?.filter((p) => p.status === "held")
      .reduce((acc, p) => acc + p.amount, 0) || 0;

  const releasingCents =
    payments
      ?.filter((p) => p.status === "releasing")
      .reduce((acc, p) => acc + p.amount, 0) || 0;

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <StatCard
        title="Total Secured"
        amount={formatCurrency(securedCents)}
        description="Funds held safely in escrow"
        icon={<ShieldCheck className="text-emerald-500" />}
        variant="success"
      />
      <StatCard
        title="Pending Release"
        amount={formatCurrency(releasingCents)}
        description="Awaiting bank processing"
        icon={<Clock className="text-amber-500" />}
        variant="warning"
      />
    </div>
  );
}
