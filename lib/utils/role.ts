import { createClient } from "@/lib/superbase/superbase-server";

/**
 * Get user's role for a specific workspace
 * @param userId - User ID
 * @param orgId - Workspace/Organization ID
 * @returns User's role ("CLIENT" | "FREELANCER") or null if not a member
 */
export async function getUserRole(
  userId: string,
  orgId: string
): Promise<"CLIENT" | "FREELANCER" | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", userId)
    .eq("tenant_id", orgId)
    .single();

  if (error || !data) {
    return null;
  }

  const role = data.role?.toUpperCase();
  if (role === "CLIENT" || role === "FREELANCER") {
    return role as "CLIENT" | "FREELANCER";
  }

  return null;
}

/**
 * Check if user has access to a role-based dashboard
 * @param userId - User ID
 * @param orgId - Workspace/Organization ID
 * @param expectedRole - Expected role for the route ("client" | "freelancer")
 * @returns true if user has the correct role, false otherwise
 */
export async function hasRoleAccess(
  userId: string,
  orgId: string,
  expectedRole: "client" | "freelancer"
): Promise<boolean> {
  const userRole = await getUserRole(userId, orgId);
  if (!userRole) return false;

  const expectedRoleUpper = expectedRole.toUpperCase();
  return userRole === expectedRoleUpper;
}

