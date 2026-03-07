import { Shield, Users, Zap } from "lucide-react";
import React from "react";

const Features = () => {
  return (
    <section id="features" className="py-20 px-6 ">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Users className="text-emerald-400" />}
            title="1:1 Focused"
            description="Built specifically for one client and one freelancer. No noise, just dedicated collaboration."
          />
          <FeatureCard
            icon={<Shield className="text-emerald-400" />}
            title="The Vault"
            description="Funds are secured upfront and released only when milestones are met. Total peace of mind."
          />
          <FeatureCard
            icon={<Zap className="text-emerald-400" />}
            title="Real-time Tracking"
            description="Stay updated with live status changes, request logs, and instant notifications."
          />
        </div>
      </div>
    </section>
  );
};

export default Features;

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-2xl bg-[#0f172a]/50 border border-slate-800 hover:border-emerald-500/50 transition-all group">
      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
