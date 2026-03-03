import React from "react";
import TeamClient from "@/components/TeamClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Members",
  description:
    "Kodash is a contract first platform for client and freelancer to make agreement upfront before work actually  start",
};
export default async function TeamPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  return <TeamClient orgId={orgId} />;
}

