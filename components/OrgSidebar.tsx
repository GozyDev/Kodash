// components/OrgSidebar.tsx
"use client";
import Image from "next/image";
import {
  Users,
  // Settings,
  FilePenLine,
  LayoutGrid,
  Banknote,
  AlertCircle,
  ExternalLink,
  HandCoins,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import onboardFreelancer, { getStripeDashboardLink } from "@/action/strpe";

// const toolItems = [{ title: "Settings", icon: Settings, url: "/settings" }];

export function OrgSidebar({
  orgId,
  role,
  stripeStatus,
}: {
  orgId: string;
  role: "client" | "freelancer";
  stripeStatus: string;
}) {
  const pathname = usePathname();
  const basePath =
    role === "freelancer"
      ? `/dashboard/fr-org/${orgId}`
      : `/dashboard/cl-org/${orgId}`;

  const navItems = [
    { title: "Overview", icon: LayoutGrid, url: basePath },
    { title: "Request", icon: FilePenLine, url: `${basePath}/requests` },
    { title: "Members", icon: Users, url: `${basePath}/team` },
    { title: "Payment", icon: HandCoins, url: `${basePath}/payments` },
  ];

  const handleDashboardClick = async () => {
    try {
      const url = await getStripeDashboardLink();
      window.open(url, "_blank"); // Open Stripe Dashboard in new tab
    } catch (error) {
      console.error("Failed to load dashboard", error);
    }
  };

  return (
    <Sidebar
      className={cn(
        "bg-bgPrimary border-r border-r-cardCB",
        "transition-all duration-300 ease-in-out",
        "shadow-sm backdrop-blur-sm",
        "top-[65px] h-[calc(100vh-65px)]",
      )}
      collapsible="icon"
    >
      <SidebarHeader className="text-textNa flex flex-row py-3 md:hidden items-center">
        <Image src="/Logo.png" alt="KodashLogo" width={45} height={45}></Image>
        <p className=" uppercase">kodash</p>
      </SidebarHeader>
      <div className="border-b border-b-cardCB md:hidden"></div>
      <SidebarContent className="flex flex-col gap-6 border-none">
        {/* Main Navigation Section */}
        <SidebarGroup>
          <SidebarGroupContent className="mt-3">
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url === basePath &&
                    pathname.startsWith(basePath) &&
                    pathname === basePath);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className=" hover:bg-transparent"
                      asChild
                    >
                      <Link
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3",
                          "rounded-xl px-3 py-2.5",
                          "text-sm transition-all duration-200",
                          "group relative hover:text-textNb",
                          isActive ? "text-textNb" : "text-muted-foreground",
                        )}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-full  rounded-r-full bg-gradient-to-r from-accent/5 to-transparent" />
                        )}

                        <item.icon
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            "group-hover:scale-110",
                            isActive ? "text-accent" : "text-muted-foreground",
                          )}
                        />

                        <span className="text-md">{item.title}</span>

                        {/* Hover gradient effect */}
                        <div
                          className={cn(
                            "absolute inset-0 rounded-xl",
                            "bg-gradient-to-r from-accent/5 to-transparent",
                            "opacity-0 hover:opacity-100",
                            "transition-opacity duration-200",
                            "pointer-events-none",
                          )}
                        />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            {/* <SidebarMenu>
              {toolItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className=" hover:bg-transparent hover:text-white text-muted-foreground"
                    >
                      <a
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3",
                          "rounded-xl px-3 py-2.5",
                          "text-sm transition-all duration-200",
                          "group relative",
                          "text-foreground-muted",
                          isActive && [
                            "text-white font-medium",
                            "shadow-xs border border-accent/20",
                          ]
                        )}
                      >
                       
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
                        )}

                        <item.icon
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            "group-hover:scale-110",
                            isActive ? "text-accent" : "text-muted-foreground"
                          )}
                        />

                        <span
                          className={cn(
                            "transition-all duration-300",
                            "sidebar:opacity-0 sidebar:w-0 sidebar:min-w-0"
                          )}
                        >
                          {item.title}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu> */}

            {role === "freelancer" && (
              <SidebarMenu className="mt-auto">
                {" "}
                {/* mt-auto pushes it to bottom if you want */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    {/* LOGIC BRANCHING:
                  We use a ternary or if-else logic here to swap the button 
                */}

                    {/* CASE 1: COMPLETED */}
                    {stripeStatus === "completed" ? (
                      <button
                        onClick={handleDashboardClick}
                        className="w-full py-2 rounded-xl flex gap-3 items-center px-3 text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                      >
                        <ExternalLink size={18} />
                        <span className="font-medium text-[12px]">
                          Payout Dashboard
                        </span>
                      </button>
                    ) : /* CASE 2: PENDING (Account exists, but details missing) */
                    stripeStatus === "pending" ? (
                      <button
                        onClick={() =>
                          onboardFreelancer({ returnTo: pathname })
                        }
                        className="w-full py-2 rounded-xl flex gap-3 items-center px-3 text-amber-500 hover:bg-amber-500/10 transition-colors"
                      >
                        <AlertCircle size={18} />
                        <span className="font-medium text-[12px]">
                          Finish Setup
                        </span>
                      </button>
                    ) : (
                      /* CASE 3: NOT STARTED (Default) */
                      <button
                        onClick={() =>
                          onboardFreelancer({ returnTo: pathname })
                        }
                        className="w-full py-2 rounded-xl flex gap-3 items-center px-3 hover:bg-accent/10 transition-colors"
                      >
                        <Banknote size={18} />
                        <span className="font-medium text-[12px]">
                          Connect Bank
                        </span>
                      </button>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
