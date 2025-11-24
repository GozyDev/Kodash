import TaskClient from "@/components/TaskClient";
import React from "react";

export default async function Taskpage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  console.log("tenant_ID", orgId);

  console.log("project", orgId);
  return (
    <div>
      <TaskClient orgId={orgId} />
    </div>
  );
}
