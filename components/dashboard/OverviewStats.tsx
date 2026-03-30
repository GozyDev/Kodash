import { ListTodo, ShieldCheck, Wallet } from "lucide-react";
import { createClient } from "@/lib/superbase/superbase-server";
import { StatCard } from "@/components/StatCard";

interface OverviewStatsProps {
  orgId: string;
}

export default async function OverviewStats({ orgId }: OverviewStatsProps) {
  const supabase = await createClient();

  const [{ count: totalRequests }, { data: payments }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", orgId),
    supabase
      .from("payments")
      .select("amount, status, issueId")
      .eq("orgId", orgId)
      .in("status", ["held", "releasing", "released"]),
  ]);

  const paymentList = (payments ?? []) as {
    amount: number;
    status: string;
    issueId: string | null;
  }[];

  const issueMap = new Map<string, { heldTotal: number; hasReleased: boolean }>();

  for (const p of paymentList) {
    if (!p.issueId) continue;

    const current = issueMap.get(p.issueId) ?? {
      heldTotal: 0,
      hasReleased: false,
    };

    if (p.status === "held") {
      current.heldTotal += p.amount;
    }

    if (p.status === "released") {
      current.hasReleased = true;
    }

    issueMap.set(p.issueId, current);
  }

  const securedCents =
    Array.from(issueMap.values())
      .filter((entry) => !entry.hasReleased)
      .reduce((sum, entry) => sum + entry.heldTotal, 0) || 0;

  const payoutMadeCents =
    paymentList
      .filter((p) => p.status === "released")
      .reduce((sum, p) => sum + p.amount, 0) || 0;

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Total Requests Made"
        amount={String(totalRequests ?? 0)}
        description="All requests created in this workspace"
        icon={<ListTodo className="text-blue-500" />}
        variant="success"
        showBadge={false}
      />
      <StatCard
        title="Total Secured"
        amount={formatCurrency(securedCents)}
        description="Funds held safely in escrow"
        icon={<ShieldCheck className="text-emerald-500" />}
        variant="success"
      />
      <StatCard
        title="Total Payout Made"
        amount={formatCurrency(payoutMadeCents)}
        description="Released payouts completed"
        icon={<Wallet className="text-purple-500" />}
        variant="warning"
      />
    </div>
  );
}
