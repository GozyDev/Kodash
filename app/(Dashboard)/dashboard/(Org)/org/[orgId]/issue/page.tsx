import React from "react";

async function IndivisualIssuepage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  return <div>IndivisualIssuepage</div>;
}

export default IndivisualIssuepage;
