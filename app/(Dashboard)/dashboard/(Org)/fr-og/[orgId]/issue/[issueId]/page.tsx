import IndivisualIssuepageClient from "@/components/IndivisualIssuepageClient";
import React from "react";

function IndivisualIssuepage({
  params,
}: {
  params: { orgId: string; issueId: string };
}) {
  const { orgId, issueId } = params;

  return (
    <IndivisualIssuepageClient
      orgId={orgId}
      issueId={issueId}
    ></IndivisualIssuepageClient>
  );
}

export default IndivisualIssuepage;
