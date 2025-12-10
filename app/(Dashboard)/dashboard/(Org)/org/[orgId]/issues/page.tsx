import TaskClient from "@/components/TaskClient";
import React from "react";

export default async function Taskpage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  return (
    <div>
      <TaskClient orgId={orgId} />
    </div>
  );
}
