'use client'

import {
  FolderPlus,
  Users,
  Handshake,
  Lock,
  CheckCircle2,
  Search,
  Send,
  FileCheck2,
  Briefcase,
  BadgeDollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { alfa_slab_one } from "@/lib/font";

type TabKey = "clients" | "freelancers";

type StepItem = {
  id: number;
  Icon: LucideIcon;
  title: string;
  subtitle: string;
};

type StepRowProps = {
  item: StepItem;
  index: number;
  visible: boolean;
};

 
// ─── DATA ─────────────────────────────────────────────────────────────────────
const DATA = {
  clients: [
    {
      id: 1,
      Icon: FolderPlus,
      title: "Start a Workspace",
      subtitle:
        "Create a new project environment. This will serve as your single source of truth for all deliverables, terms, and payments.",
    },
    {
      id: 2,
      Icon: Users,
      title: "Invite Your Freelancer",
      subtitle:
        "Bring your chosen talent into the workspace. A simple email invite gets them synced up with your project instantly.",
    },
    {
      id: 3,
      Icon: Handshake,
      title: "Agree on the Work",
      subtitle:
        "Review and sign off on the proposed scope. Ensure all milestones and deadlines match your exact expectations before starting.",
    },
    {
      id: 4,
      Icon: Lock,
      title: "Secure the Payment Upfront",
      subtitle:
        "Deposit the project funds into our smart escrow. The money is securely held and completely protected until you are satisfied.",
    },
    {
      id: 5,
      Icon: CheckCircle2,
      title: "Review and Release Funds",
      subtitle:
        "Once the work is complete and you're happy, release the escrowed funds to your freelancer with a single click.",
    },
  ],
  freelancers: [
    {
      id: 1,
      Icon: FolderPlus,
      title: "Create or Join a Workspace",
      subtitle:
        "Create or join a workspace to manage projects, collaborate easily, and keep communication, tasks, and work organized in one place.",
    },
    {
      id: 2,
      Icon: Users,
      title: "Bring Your Client Onboard",
      subtitle:
        "Invite your client to the platform to manage projects professionally, improve collaboration, and keep everything organized in one place.",
    },
    {
      id: 3,
      Icon: FileCheck2,
      title: "Define the Work Clearly",
      subtitle:
        "Work with your client to define clear deliverables and deadlines so both parties stay aligned throughout.",
    },
    {
      id: 4,
      Icon: Briefcase,
      title: "Start Delivering Work",
      subtitle:
        "Access your workspace and begin delivering outstanding results tracked against the agreed milestones.",
    },
    {
      id: 5,
      Icon: BadgeDollarSign,
      title: "Get Paid on Approval",
      subtitle:
        "Once your client approves the work, escrowed funds are released instantly and directly to your account.",
    },
  ],
};
 
// ─── STEP ROW ─────────────────────────────────────────────────────────────────
function StepRow({ item, index, visible }: StepRowProps) {
  const [hovered, setHovered] = useState(false);
  const { Icon, title, subtitle } = item;
 
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-[20px] cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: `opacity 0.42s ease ${index * 75}ms, transform 0.42s ease ${index * 75}ms`,
      }}
    >
      {/* Icon box */}
      <div className="p-2 bg-black/20 rounded-[14px]">
          <div
            className={[
              "relative z-10 flex-shrink-0 md:w-[80px] md:h-[80px] w-[70px] h-[70px] rounded-[14px]",
              "flex items-center justify-center",
              "border-3 transition-all duration-300",
              hovered
                ? "border-cardCB bg-black shadow-[0_0_0_5px_rgba(34,197,94,0.07),0_0_28px_rgba(34,197,94,0.12)]"
                : "bg-black border-cardCB/50",
            ].join(" ")}
          >
            <Icon
            
              strokeWidth={1.9}
              className={`transition-colors duration-300 lg:w-10 lg:h-10  ${
                hovered ? "text-textNd" : "text-textNd"
              }`}
            />
          </div>
      </div>
 
      {/* Card */}
      <div
        className={[
          "relative flex-1 p-4 md:p-8 rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(34,0,0,0),0_8px_36px_rgba(34,0,0,0)]",
          "border transition-all duration-300",
          hovered
            ? "bg-cardC/70 border-cardCB "
            : "bg-cardC/50 border-cardCB",
        ].join(" ")}
      >
        {/* Left accent line */}
        <div
          className={[
            "absolute left-0 top-[18%] h-[70%] w-[2px] rounded-r-[3px] blur",
            "bg-gradient-to-b from-transparent via-primaryC to-transparent",
            "transition-opacity duration-300",
            hovered ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
 
        {/* Title */}
        <p className="text-white  md:text-[20px] tracking-[-0.01em] mb-2">
          {title}
        </p>
 
        {/* Subtitle */}
        <p className="text-white/[0.44] text-[14px] md:text-[16px] leading-[1.7]">{subtitle}</p>
 
        {/* Ghost icon */}
        <div
          className={[
            "absolute top-[-3px] right-[0px] pointer-events-none",
            "transition-[opacity,color] duration-300",
            hovered ? "opacity-[0.16] text-primaryC" : "opacity-[0.02] text-white",
          ].join(" ")}
        >
          <Icon className="w-13 h-13 lg:w-20 lg:h-20" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
 
// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function KodashHowItWorks() {
  const [activeTab, setActiveTab] = useState<TabKey>("freelancers");
  const [visible, setVisible] = useState(true);

  function switchTab(tab: TabKey) {
    if (tab === activeTab) return;
    setVisible(false);
    setTimeout(() => {
      setActiveTab(tab);
      setVisible(true);
    }, 260);
  }
 
  return (
    <div className="min-h-screen bg-[#0b0b0b] flex items-start justify-center lg:px-10 px-3 lg:py-40 py-20 font-sans">
      <div className="w-full max-w-[1200px] grid lg:grid-cols-[400px_1fr] gap-16 items-start">
 
        {/* LEFT */}
        <div className="space-y-4 lg:sticky top-[150px]">
          <h2 className={`text-[50px] font-medium  ${alfa_slab_one.className}`}>
            How it works
          </h2>
 
          <p className="text-[18px] text-textNd leading-[1.75] mb-8">
            The most secure way to handle freelance payments, uniquely tailored
            to protect both sides of the contract.
          </p>
 
          {/* Toggle */}
          <div className="inline-flex bg-white/[0.04]  w-full rounded-xl p-[5px] gap-[2px] border border-cardCB">
            {(
              [
                { key: "freelancers", label: "For Freelancers" },
                { key: "clients", label: "For Clients" },
              ] as const satisfies ReadonlyArray<{ key: TabKey; label: string }>
            ).map(({ key, label }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => switchTab(key)}
                  className={[
                    "px-5 py-[9px] rounded-lg border-none cursor-pointer  whitespace-nowrap w-full",
                    "transition-all duration-[240ms]",
                    isActive
                      ? "bg-white/10 text-textNa font-normal"
                      : "bg-transparent text-white/40 font-normal",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
 
        {/* RIGHT: icon column + cards */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div
            className="absolute left-[50px] top-[30px] bottom-[31px] w-px z-0 "
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.1) 6%, rgba(255,255,255,0.1) 94%, transparent 100%)",
            }}
          />
 
          <div className="flex flex-col gap-[70px]">
            {DATA[activeTab].map((item, index) => (
              <StepRow
                key={`${activeTab}-${item.id}`}
                item={item}
                index={index}
                visible={visible}
              />
            ))}
          </div>
        </div>
 
      </div>
    </div>
  );
}