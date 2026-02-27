"use client";

export type PaymentStatus = "held" | "releasing" | "released";

interface StatusBadgeProps {
  status: PaymentStatus;
}

const statusConfig: Record<PaymentStatus, { label: string; bgColor: string; textColor: string }> = {
  held: {
    label: "In-Escrow",
    bgColor: "bg-amber-500/20",
    textColor: "text-amber-300",
  },
  releasing: {
    label: "Releasing",
    bgColor: "bg-blue-500/20",
    textColor: "text-blue-300",
  },
  released: {
    label: "Released",
    bgColor: "bg-green-500/20",
    textColor: "text-green-300",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={` w-max rounded-full px-2 py-1 text-[10px] md:text-sm tracking-wider font-medium ${config.bgColor} ${config.textColor}`}
    >
      {config.label}
    </div>
  );
}
