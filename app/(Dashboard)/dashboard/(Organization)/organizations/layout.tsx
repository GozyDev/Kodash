import type { Metadata } from "next";
import "@/app/globals.css";
import OrganizationHeader from "@/components/OrganizationHeader";

export const metadata: Metadata = {
  title: "Workspace",
  description:
    "Kodash is a contract first platform for client and freelancer to make agreement upfront before work actually  start",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <OrganizationHeader />
      {children}
    </div>
  );
}
