import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  amount: string;
  description: string;
  icon: React.ReactNode;
  variant: "success" | "pending" | "released";
  showBadge?: boolean;
}

export function StatCard({ title, amount, description, icon, variant, showBadge = true }: StatCardProps) {
  const badgeConfig = {
    pending: {
      label: "Processing",
      className: "bg-amber-500/10 text-amber-500",
    },
    released: {
      label: "Released",
      className: "bg-purple-500/10 text-purple-500",
    },
    success: {
      label: "Vault",
      className: "bg-emerald-500/10 text-emerald-500",
    },
  };

  const badge = badgeConfig[variant];

  return (
    <div className="bg-cardC/50 border border-cardCB rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          {icon}
        </div>
        {showBadge && badge && (
          <span className={cn("text-[13px] uppercase font-bold px-2 py-0.5 rounded-full tracking-widest", badge.className)}>
            {badge.label}
          </span>
        )}
      </div>
      <div>
        <p className="text text-textNd font-medium">{title}</p>
        <h2 className="text-4xl font-bold text-textNc mt-1">{amount}</h2>
        <p className="text-xs text-textNe mt-2 flex items-center gap-1">
          {description}
        </p>
      </div>
    </div>
  );
}