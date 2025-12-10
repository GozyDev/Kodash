import IndivisualIssuepageClient from "@/components/IndivisualIssuepageClient";
import React from "react";

async function IndivisualIssuepage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

    return <IndivisualIssuepageClient orgId={orgId} ></IndivisualIssuepageClient>;
}

export default IndivisualIssuepage;
