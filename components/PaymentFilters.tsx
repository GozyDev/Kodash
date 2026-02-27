"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PaymentFiltersProps {
  orgId: string;
}

export function PaymentFilters({}: PaymentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const currentStatus = searchParams.get("status") || "all";
  const currentSort = searchParams.get("sortBy") || "newest";

  const handleStatusChange = (newStatus: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", newStatus);
    router.push(`?${params.toString()}`);
    setStatusOpen(false);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sortBy", newSort);
    router.push(`?${params.toString()}`);
    setSortOpen(false);
  };

  const getStatusLabel = () => {
    switch (currentStatus) {
      case "held":
        return "In Escrow";
      case "releasing":
        return "Releasing";
      case "released":
        return "Released";
      default:
        return "All Statuses";
    }
  };

  const getSortLabel = () => {
    return currentSort === "newest" ? "Newest First" : "Oldest First";
  };

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {/* Status Filter Dropdown */}
      <DropdownMenu open={statusOpen} onOpenChange={setStatusOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg border border-cardCB bg-bgPrimary px-4 py-2 text-sm font-medium text-textNb hover:bg-bgPrimary/80 transition-colors">
            {getStatusLabel()}
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                statusOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-bgPrimary border-cardCB">
          <DropdownMenuLabel className="text-textNb">Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-cardCB" />
          
          <DropdownMenuItem
            onClick={() => handleStatusChange("all")}
            className={`cursor-pointer text-sm ${
              currentStatus === "all"
                ? "bg-cardICB/50 text-textNb"
                : "text-textNc hover:bg-cardCB/50"
            }`}
          >
            <Check
              size={16}
              className={`mr-2 ${currentStatus === "all" ? "opacity-100" : "opacity-0"}`}
            />
            All Statuses
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleStatusChange("held")}
            className={`cursor-pointer text-sm ${
              currentStatus === "held"
                ? "bg-amber-500/20 text-amber-300"
                : "text-textNc hover:bg-cardCB/50"
            }`}
          >
            <Check
              size={16}
              className={`mr-2 ${currentStatus === "held" ? "opacity-100" : "opacity-0"}`}
            />
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
            In Escrow
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleStatusChange("releasing")}
            className={`cursor-pointer text-sm ${
              currentStatus === "releasing"
                ? "bg-blue-500/20 text-blue-300"
                : "text-textNc hover:bg-cardCB/50"
            }`}
          >
            <Check
              size={16}
              className={`mr-2 ${currentStatus === "releasing" ? "opacity-100" : "opacity-0"}`}
            />
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
            Releasing
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleStatusChange("released")}
            className={`cursor-pointer text-sm ${
              currentStatus === "released"
                ? "bg-green-500/20 text-green-300"
                : "text-textNc hover:bg-cardCB/50"
            }`}
          >
            <Check
              size={16}
              className={`mr-2 ${currentStatus === "released" ? "opacity-100" : "opacity-0"}`}
            />
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
            Released
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Filter Dropdown */}
      <DropdownMenu open={sortOpen} onOpenChange={setSortOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg border border-cardCB bg-bgPrimary px-4 py-2 text-sm font-medium text-textNb hover:bg-bgPrimary/80 transition-colors">
            {getSortLabel()}
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                sortOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-bgPrimary border-cardCB">
          <DropdownMenuLabel className="text-textNb">Sort by Date</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-cardCB" />
          
          <DropdownMenuItem
            onClick={() => handleSortChange("newest")}
            className={`cursor-pointer text-sm ${
              currentSort === "newest"
                ? "bg-cardICB/50 text-textNb"
                : "text-textNc hover:bg-cardCB/50"
            }`}
          >
            <Check
              size={16}
              className={`mr-2 ${currentSort === "newest" ? "opacity-100" : "opacity-0"}`}
            />
            Newest First
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSortChange("oldest")}
            className={`cursor-pointer text-sm ${
              currentSort === "oldest"
                ? "bg-cardICB/50 text-textNb"
                : "text-textNc hover:bg-cardCB/50"
            }`}
          >
            <Check
              size={16}
              className={`mr-2 ${currentSort === "oldest" ? "opacity-100" : "opacity-0"}`}
            />
            Oldest First
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
