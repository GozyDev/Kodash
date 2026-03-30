import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";

type StatusCount = {
  status: string;
  count: number;
};

const ORDERED_STATUSES = [
  "draft",
  "proposed",
  "ongoing",
  "delivered",
  "on-revision",
  "disputed",
  "completed",
] as const;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "orgId required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("status")
      .eq("tenant_id", orgId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const status = row.status ?? "unknown";
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }

    const knownSet = new Set<string>(ORDERED_STATUSES);
    const normalized: StatusCount[] = ORDERED_STATUSES.map((status) => ({
      status,
      count: counts.get(status) ?? 0,
    }));

    for (const [status, count] of counts.entries()) {
      if (!knownSet.has(status)) {
        normalized.push({ status, count });
      }
    }

    return NextResponse.json(normalized);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
