// app/dashboard/organization/[orgId]/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import OrgHeader from "@/components/OrgHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/superbase/superbase-server";
import OrgLayoutClient from "@/components/OrgLayoutClient";
import { getUserRole } from "@/lib/utils/role";

export const revalidate = 0;

export default async function OrgLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const supabase = await createClient();

  // Get authenticated user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    redirect("/dashboard/auth/sign_in");
  }

  // Verify user has FREELANCER role for this workspace
  const userRole = await getUserRole(authData.user.id, orgId);
  if (!userRole || userRole !== "FREELANCER") {
    // User doesn't have access or has wrong role - redirect to organizations
    redirect("/dashboard/organizations");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_onboarding_status,email")
    .eq("id", authData.user.id)
    .single();

  const { data: orgs, error } = await supabase
    .from("tenants")
    .select("id, name, plan");

  if (error) {
    console.log("Error", error.message);
  }
  if (!orgs) {
    return;
  }
  return (
    <SidebarProvider>
      <OrgHeader orgs={orgs} orgId={orgId} />
      <OrgLayoutClient
        orgId={orgId}
        role="freelancer"
        stripeStatus={profile?.stripe_onboarding_status || "not_started"}
      >
        {children}
      </OrgLayoutClient>
    </SidebarProvider>
  );
}
