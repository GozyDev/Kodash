"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { displayStatusForStatusCard } from "@/lib/status";
import { statusIconFromPresent } from "@/components/StatusCard";

type StatusKey =
  | "draft"
  | "proposed"
  | "ongoing"
  | "delivered"
  | "on-revision"
  | "disputed"
  | "completed";

export type StatusDatum = {
  status: string;
  count: number;
};

type StatusChartProps = {
  data?: StatusDatum[];
  orgId?: string;
  className?: string;
};

const STATUS_COLORS: Record<StatusKey, string> = {
  draft: "#94a3b8",
  proposed: "#f97316",
  ongoing: "#3b82f6",
  delivered: "#a855f7",
  "on-revision": "#f59e0b",
  disputed: "#ef4444",
  completed: "#22c55e",
};

const chartConfig = {
  draft: { label: "Draft", color: STATUS_COLORS.draft },
  proposed: { label: "Proposed", color: STATUS_COLORS.proposed },
  ongoing: { label: "Ongoing", color: STATUS_COLORS.ongoing },
  delivered: { label: "Delivered", color: STATUS_COLORS.delivered },
  "on-revision": {
    label: "On Revision",
    color: STATUS_COLORS["on-revision"],
  },
  disputed: { label: "Disputed", color: STATUS_COLORS.disputed },
  completed: { label: "Completed", color: STATUS_COLORS.completed },
} satisfies ChartConfig;

function getIconForStatus(status: string) {
  const present = displayStatusForStatusCard(status);
  return statusIconFromPresent(present);
}

function StatusChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value?: string | number;
    name?: string | number;
    payload?: { status?: string; count?: number };
  }>;
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const status = String(
    item.payload?.status ?? item.name ?? ""
  ).trim();
  const count = Number(item.value ?? item.payload?.count ?? 0);

  const label =
    (chartConfig as Record<string, { label?: string }>)[status]?.label ??
    status;
  const icon = getIconForStatus(status);
  const color =
    (STATUS_COLORS as Record<string, string>)[status] ?? "#94a3b8";

  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl"
      style={{ color }}
    >
      {icon ? <span className="inline-flex">{icon}</span> : null}
      <div className="flex flex-col">
        <span className="font-medium text-textNb">{label}</span>
        <span className="text-textNd">
          {count} {count === 1 ? "request" : "requests"}
        </span>
      </div>
    </div>
  );
}

function StatusAxisTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
}) {
  const status = String(payload?.value ?? "").trim();
  if (!status) return null;

  const label =
    (chartConfig as Record<string, { label?: string }>)[status]?.label ??
    status;
  const icon = getIconForStatus(status);
  const color =
    (STATUS_COLORS as Record<string, string>)[status] ?? "#94a3b8";

  return (
    <g transform={`translate(${x},${y})`} style={{ color }}>
      {icon ? <g transform="translate(-7,-18)">{icon}</g> : null}
      <text
        x={0}
        y={0}
        dy={18}
        textAnchor="middle"
        fontSize={10}
        fill="currentColor"
      >
        {label}
      </text>
    </g>
  );
}

export default function StatusChart({ data, orgId, className }: StatusChartProps) {
  const [fetchedData, setFetchedData] = useState<StatusDatum[]>([]);
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setLoading(false);
      setError(null);
      return;
    }

    if (!orgId) {
      setLoading(false);
      setError("Missing orgId for status distribution fetch.");
      return;
    }
    const currentOrgId = orgId;

    let ignore = false;

    async function fetchDistribution() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/tasks/distribution?orgId=${encodeURIComponent(currentOrgId)}`,
          { method: "GET", cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Failed to load task distribution");
        }

        const json = (await response.json()) as StatusDatum[];
        if (!ignore) {
          setFetchedData(json);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Unexpected error");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchDistribution();

    return () => {
      ignore = true;
    };
  }, [data, orgId]);

  const chartData = useMemo(() => data ?? fetchedData, [data, fetchedData]);
  if (loading) {
    return <Skeleton className={cn("h-[320px] w-full", className)} />;
  }

  if (error) {
    return (
      <div className={cn("rounded-md border p-4 text-sm text-red-500", className)}>
        {error}
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className={cn("h-[320px] w-full", className)}>
      <BarChart data={chartData} margin={{ top: 10, right: 8, left: 8, bottom: 10 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="status"
          tickLine={false}
          axisLine={false}
          tickMargin={14}
          minTickGap={12}
          tick={<StatusAxisTick />}
        />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
        <ChartTooltip cursor={false} content={<StatusChartTooltip />}  />
        <Bar dataKey="count" radius={4}>
          {chartData.map((entry) => (
            <Cell
              key={`cell-${entry.status}`}
              fill={STATUS_COLORS[entry.status as StatusKey] ?? "#64748b"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );

}
