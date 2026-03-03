import IndivisualIssuepageClient from "@/components/IndivisualIssuepageClient";
import React from "react";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request",
  description:
    "Kodash is a contract first platform for client and freelancer to make agreement upfront before work actually  start",
};

export default async function IndivisualIssuepage({
  params,
}: {
  params: Promise<{ orgId: string; issueId: string }>;
}) {
  const { orgId, issueId } = await params;

  return (
    <IndivisualIssuepageClient
      orgId={orgId}
      issueId={issueId}
      userRole = "freelancer"
    ></IndivisualIssuepageClient>
  );
}
