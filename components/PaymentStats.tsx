import { createClient } from "@/lib/superbase/superbase-server";
import { StatCard } from "./StatCard";
import { ShieldCheck, Clock } from "lucide-react";

export async function PaymentStats({ orgId }: { orgId: string }) {
    const supabase = await createClient();

    // Fetch only the columns we need to aggregate
    const { data: payments } = await supabase
        .from("payments")
        .select("amount, status, issueId")
        .eq("orgId", orgId)
        .in("status", ["held", "releasing", "released"]); // Limit to relevant statuses

    const paymentList = (payments ?? []) as {
        amount: number;
        status: string;
        issueId: string | null;
    }[];

    // Group by issueId to compute escrow balance
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

    const releasingCents =
        paymentList
            .filter((p) => p.status === "releasing")
            .reduce((acc, p) => acc + p.amount, 0) || 0;

    const formatCurrency = (cents: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

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