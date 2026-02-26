import { createClient } from "@/lib/superbase/superbase-server";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";

interface PaymentRow {
  id: string;
  amount: number;
  status: "held" | "releasing" | "released";
  created_at: string;
  issueId: string;
  taskTitle: string;
}

interface PaymentTableProps {
  orgId: string;
  searchParams: { status?: string; sortBy?: string };
  userRole: "CLIENT" | "FREELANCER" | null;
}

export async function PaymentTable({
  orgId,
  searchParams,
  userRole,
}: PaymentTableProps) {
  const supabase = await createClient();

  try {
    // Base query: fetch payments, then join with tasks via issueId
    let query = supabase
      .from("payments")
      .select(
        `
        id,
        amount,
        status,
        created_at,
        issueId,
        tasks!issueId(title, tenant_id)
      `
      )
      .order("created_at", { ascending: searchParams.sortBy === "oldest" });

    // Apply status filter if provided
    if (searchParams.status && searchParams.status !== "all") {
      query = query.eq("status", searchParams.status);
    }

    const { data: payments, error } = await query;

    if (error) {
      console.error("Failed to fetch payments:", error);
      return (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-6 text-center text-red-300">
          Failed to load payments. Please try again later.
        </div>
      );
    }

    // Filter payments by orgId since we couldn't do it in the query
    const filteredPayments = payments?.filter((payment: any) => {
      return payment.tasks && payment.tasks.tenant_id === orgId;
    }) || [];

    // Check if this is a filtered view (status filter applied)
    const isFiltered = searchParams.status && searchParams.status !== "all";

    // If no payments in filtered view, show status-specific message
    if (filteredPayments.length === 0 && isFiltered) {
      const statusLabel = getStatusLabel(searchParams.status);
      return (
        <div className="rounded-lg border border-cardCB bg-bgPrimary p-6 text-center text-textNc">
          {getFilteredEmptyMessage(searchParams.status, statusLabel)}
        </div>
      );
    }

    // If absolutely no payments exist, show role-based empty state
    if (filteredPayments.length === 0 && !isFiltered) {
      return (
        <div className="rounded-lg border border-cardCB bg-bgPrimary p-6 text-center text-textNc">
          {getRoleBasedEmptyMessage(userRole)}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-cardCB bg-bgPrimary">
        <table className="w-full">
          <thead className="border-b border-cardCB bg-cardC/50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] md:text-sm tracking-wider font-semibold text-textNb">
                Project Name
              </th>
              <th className="px-6 py-4 text-left text-[10px] md:text-sm tracking-wider font-semibold text-textNb">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-[10px] md:text-sm tracking-wider font-semibold text-textNb">
                Status
              </th>
              <th className="px-6 py-4 text-left text-[10px] md:text-sm tracking-wider font-semibold text-textNb">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cardCB">
            {filteredPayments.map((payment: any) => {
              const taskTitle = payment.tasks?.title || "Unknown Project";
              const amount = formatCurrency(payment.amount);
              const date = formatDate(payment.created_at);

              return (
                <tr
                  key={payment.id}
                  className="hover:bg-bgPrimary/50 transition-colors duration-200"
                >
                  {/* Project Name - Link to request */}
                  <td className="px-6 py-4">
                    <Link
                      href={
                        userRole === "FREELANCER"
                          ? `/dashboard/fr-org/${orgId}/request/${payment.issueId}`
                          : `/dashboard/cl-org/${orgId}/request/${payment.issueId}`
                      }
                      className=" text-[10px] md:text-sm tracking-wider text-textNc hover:text-green-300 hover:underline transition-colors no-wrap truncate border"
                    >
                      {taskTitle}
                    </Link>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <span className=" text-[10px] md:text-sm tracking-wider font-medium text-textNb">{amount}</span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <StatusBadge status={payment.status}  />
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    <span className=" text-[10px] md:text-sm tracking-wider text-textNc">{date}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  } catch (error) {
    console.error("PaymentTable error:", error);
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-6 text-center text-red-300">
        An unexpected error occurred. Please try again later.
      </div>
    );
  }
}

// Role-based empty state messages
function getRoleBasedEmptyMessage(userRole: "CLIENT" | "FREELANCER" | null): string {
  if (userRole === "CLIENT") {
    return "No payments found. Start accepting proposals to see transactions here.";
  } else if (userRole === "FREELANCER") {
    return "No payments yet. Payments from accepted projects will appear here.";
  }
  return "No payments found.";
}

// Status-specific filter empty messages
function getFilteredEmptyMessage(status: string | undefined, statusLabel: string): string {
  if (!status || status === "all") return "No payments found.";

  const messages: Record<string, string> = {
    held: `No payments in ${statusLabel.toLowerCase()} status.`,
    releasing: `No payments currently pending release.`,
    released: `No payments have been released yet.`,
  };

  return messages[status] || `No payments in ${statusLabel.toLowerCase()} status.`;
}

// Get readable status label
function getStatusLabel(status: string | undefined): string {
  const labels: Record<string, string> = {
    held: "Held",
    releasing: "Releasing",
    released: "Released",
  };
  return labels[status || "all"] || "Unknown";
}

// Utility function to format currency
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

// Utility function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
