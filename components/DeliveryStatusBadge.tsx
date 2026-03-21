"use client";

import { Clock, Eye, CheckCircle2, XCircle, ScanEye } from "lucide-react";

interface DeliveryStatusBadgeProps {
  status: "pending" | "in_review" | "approved" | "disputed" | "revision" | "accepted_revision";
}

const statusConfig = {
  pending: {
    label: "Pending",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    icon: Clock,
  },
  in_review: {
    label: "In Review",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
    icon: Eye,
  },
  revision: {
    label: "In Review",
    bgColor: "bg-[#F59E0B]/10",
    textColor: "text-[#F59E0B]/60",
    icon: ScanEye,
  },
  approved: {
    label: "Approved",
    bgColor: "bg-green-100",
    textColor: "text-green-600",
    icon: CheckCircle2,
  },
  disputed: {
    label: "Disputed",
    bgColor: "bg-red-900/60",
    textColor: "text-red-500",
    icon: XCircle,
  },

   accepted_revision: {
    label: "review_accepted",
    bgColor: "bg-[#F59E0B]/10",
    textColor: "text-[#F59E0B]/60",
    icon: CheckCircle2,
  },
};

export function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor} ${config.textColor}`}
    >
      <Icon size={16} />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
}
