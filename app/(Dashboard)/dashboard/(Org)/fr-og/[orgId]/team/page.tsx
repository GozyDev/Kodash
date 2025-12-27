import React from "react";
import TeamClient from "@/components/TeamClient";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  return <TeamClient orgId={orgId} />;
}