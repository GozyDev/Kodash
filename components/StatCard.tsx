import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  amount: string;
  description: string;
  icon: React.ReactNode;
  variant: "success" | "warning";
  showBadge?: boolean;
}

export function StatCard({ title, amount, description, icon, variant, showBadge = true }: StatCardProps) {
  return (
    <div className="bg-cardC/50 border border-cardCB rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          {icon}
        </div>
        {showBadge && (variant === "warning" ? (
          <span className="text-[13px] uppercase font-bold px-2 py-0.5 rounded-full tracking-widest bg-purple-500/10 text-purple-500">
            Released
          </span>
        ) : (
          <span className="text-[13px] uppercase font-bold px-2 py-0.5 rounded-full tracking-widest bg-emerald-500/10 text-emerald-500">
            Vault
          </span>
        ))}
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
