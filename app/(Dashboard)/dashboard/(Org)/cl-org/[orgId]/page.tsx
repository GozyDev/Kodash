import AnalyticClient from "@/components/AnalyticClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
  description:
    "Kodash is a contract first platform for client and freelancer to make agreement upfront before work actually  start",
};
export default function OrgProjectsPage() {
  return <AnalyticClient></AnalyticClient>;
}
