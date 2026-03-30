import OrgOverviewSections from "@/components/dashboard/OrgOverviewSections";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
  description:
    "Kodash is a contract first platform for client and freelancer to make agreement upfront before work actually  start",
};
export default async function OrgProjectsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  return <OrgOverviewSections orgId={orgId} />;
}
