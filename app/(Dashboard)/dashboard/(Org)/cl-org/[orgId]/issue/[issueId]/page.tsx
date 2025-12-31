import IndivisualIssuepageClient from "@/components/IndivisualIssuepageClient";
import React from "react";

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
    ></IndivisualIssuepageClient>
  );
}

