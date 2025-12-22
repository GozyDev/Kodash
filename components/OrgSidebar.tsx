// components/OrgSidebar.tsx
"use client";

import { Users, Settings, LayoutGrid, FilePenLine, HandCoins } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";

const toolItems = [{ title: "Settings", icon: Settings, url: "/settings" }];

export function OrgSidebar({ orgId }: { orgId: string }) {
  const pathname = usePathname();
  const basePath = `/dashboard/org/${orgId}`;

  const navItems = [
    { title: "Overview", icon: LayoutGrid, url: `${basePath}/overview` },
    { title: "Request", icon: FilePenLine, url: `${basePath}/issues` },
    { title: "Members", icon: Users, url: `${basePath}/team` },
    { title: "Payment", icon:HandCoins, url: basePath },
  ];

  return (
    <Sidebar
      className={cn(
        "bg-bgPrimary border-cardCB",
        "transition-all duration-300 ease-in-out",
        "shadow-sm backdrop-blur-sm",
        "top-[65px] h-[calc(100vh-65px)]"
      )}
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col gap-6">
        {/* Main Navigation Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium px-3">
            Navigation
          </SidebarGroupLabel>
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
                          isActive ? "text-textNb" : "text-muted-foreground"
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
                            isActive ? "text-accent" : "text-muted-foreground"
                          )}
                        />

                        <span className={cn()}>{item.title}</span>

                        {/* Hover gradient effect */}
                        <div
                          className={cn(
                            "absolute inset-0 rounded-xl",
                            "bg-gradient-to-r from-accent/5 to-transparent",
                            "opacity-0 hover:opacity-100",
                            "transition-opacity duration-200",
                            "pointer-events-none"
                          )}
                        />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            <SidebarMenu>
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
                        {/* Active indicator */}
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
