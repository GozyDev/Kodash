import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  amount: string;
  description: string;
  icon: React.ReactNode;
  variant: "success" | "warning";
}

export function StatCard({ title, amount, description, icon, variant }: StatCardProps) {
  return (
    <div className="bg-cardC border border-cardCB rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          {icon}
        </div>
        <span className={cn(
          "text-[13px] uppercase font-bold  px-2 py-0.5 rounded-full tracking-widest",
          variant === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
        )}>
          {variant === "success" ? "Vault" : "Processing"}
        </span>
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
