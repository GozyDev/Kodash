import TaskClient from "@/components/TaskClient";
import React from "react";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Requests",
  description:
    "Kodash is a contract first platform for client and freelancer to make agreement upfront before work actually  start",
};

export default async function Taskpage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  return (
    <div>
      <TaskClient orgId={orgId} userRole="freelancer" />
    </div>
  );
}
