"use client";

import * as React from "react";
import { Plus, CircleDashed, SignalHigh, } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/lib/superbase/type";


type StatusOption = {
  value: Task["status"]; // This ensures it matches your database/Task type
  label: string;
  svg: React.JSX.Element;
};

type PriorityOption = {
  value: Task["priority"]; // This ensures it matches your database/Task type
  label: string;
  svg: React.JSX.Element;
};

// Define our options based on your specific requirements
const STATUS_OPTIONS:StatusOption[] = [
  {
    value: "draft", svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="kodash-status kodash-draft"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      </svg>
    ), label: "Draft"
  },
  {
    value: "proposed", svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="kodash-status kodash-proposed"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" />
      </svg>
    ), label: "Proposed"
  },
  {
    value: "on-going", svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
        className="kodash-status kodash-active"
      >
        <circle cx="12" cy="12" r="9" />
      </svg>
    ), label: "Ongoing"
  },
  {
    value: "delivered", svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="kodash-status kodash-delivered"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 16V8" />
        <path d="M8.5 11.5L12 8l3.5 3.5" />
      </svg>
    ), label: "Delivered"
  },
  {
    value: "canceled", svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="kodash-status kodash-completed"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5l2.5 2.5 4.5-5" />
      </svg>
    ), label: "Canceled"
  },
  {
    value: "completed", svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="kodash-status kodash-cancelled"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 8l8 8" />
      </svg>
    ), label: "Completed"
  },
];

const PRIORITY_OPTIONS:PriorityOption[] = [
  {
    value: "no priority", svg: (
      <svg
        aria-label="No Priority"
        className=""
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="lch(62.6% 1.35 272 / 1)"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      // style="--icon-color: lch(62.6% 1.35 272 / 1);"
      >
        <rect
          x="1.5"
          y="7.25"
          width="3"
          height="1.5"
          rx="0.5"
          opacity="0.9"
        ></rect>
        <rect
          x="6.5"
          y="7.25"
          width="3"
          height="1.5"
          rx="0.5"
          opacity="0.9"
        ></rect>
        <rect
          x="11.5"
          y="7.25"
          width="3"
          height="1.5"
          rx="0.5"
          opacity="0.9"
        ></rect>
      </svg>
    ), label: "No priority"
  },
  {
    value: "ugency", svg: (
      <svg
        aria-label="Urgent Priority"
        className=""
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="lch(62.6% 1.35 272 / 1)"
        // fill="lch(66% 80 48)"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      // style="--icon-color: lch(66% 80 48);"
      >
        <path d="M3 1C1.91067 1 1 1.91067 1 3V13C1 14.0893 1.91067 15 3 15H13C14.0893 15 15 14.0893 15 13V3C15 1.91067 14.0893 1 13 1H3ZM7 4L9 4L8.75391 8.99836H7.25L7 4ZM9 11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11C7 10.4477 7.44772 10 8 10C8.55228 10 9 10.4477 9 11Z"></path>
      </svg>
    ), label: "Urgent"
  },
  {
    value: "high", svg: (
      <svg
        aria-label="High Priority"
        className=""
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="lch(62.6% 1.35 272 / 1)"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      // style="--icon-color: lch(62.6% 1.35 272 / 1);"
      >
        <rect x="1.5" y="8" width="3" height="6" rx="1"></rect>
        <rect x="6.5" y="5" width="3" height="9" rx="1"></rect>
        <rect x="11.5" y="2" width="3" height="12" rx="1"></rect>
      </svg>
    ), label: "High"
  },
  {
    value: "medium", svg: (
      <svg
        aria-label="Medium Priority"
        className=""
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="lch(62.6% 1.35 272 / 1)"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      // style="--icon-color: lch(62.6% 1.35 272 / 1);"
      >
        <rect x="1.5" y="8" width="3" height="6" rx="1"></rect>
        <rect x="6.5" y="5" width="3" height="9" rx="1"></rect>
        <rect
          x="11.5"
          y="2"
          width="3"
          height="12"
          rx="1"
          fillOpacity="0.4"
        ></rect>
      </svg>
    ), label: "Medium"
  },
  {
    value: "low", svg: (
      <svg
        aria-label="Low Priority"
        className=""
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="lch(62.6% 1.35 272 / 1)"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      // style="--icon-color: lch(62.6% 1.35 272 / 1);"
      >
        <rect x="1.5" y="8" width="3" height="6" rx="1"></rect>
        <rect
          x="6.5"
          y="5"
          width="3"
          height="9"
          rx="1"
          fillOpacity="0.4"
        ></rect>
        <rect
          x="11.5"
          y="2"
          width="3"
          height="12"
          rx="1"
          fillOpacity="0.4"
        ></rect>
      </svg>
    ), label: "Low"
  },
];

type FilterState = {
  status: "All" | Task["status"];
  priority: "All" | Task["priority"];
};

interface TaskFiltersProp {
  filters: FilterState;
  // This is the specific type for a useState setter function
  onFiltersChange: React.Dispatch<React.SetStateAction<FilterState>>;
  userRole: string;
}

export default function TaskFilters({ filters, onFiltersChange, userRole }:TaskFiltersProp) {
  return (
    <div className="flex items-center gap-2 border-cardCB">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="h-8 border-dashed gap-1 text-xs font-normal ">
            <Plus className="h-3.5 w-3.5" />
            Add Filter
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-48 border-cardCB" align="start">
          {/* Status Sub-menu */}
          <DropdownMenuSub  >
            <DropdownMenuSubTrigger className="text-xs    ">
              <CircleDashed className="mr-2 h-3.5 w-3.5" />
              <span>Status</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-40 ml-1 bg-cardC border-cardCB">
                {STATUS_OPTIONS.map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    className="text-xs gap-2"
                    onClick={() => onFiltersChange({ ...filters, status: status.value })}
                  >
                    {status.svg}
                    {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Priority Sub-menu */}
          {userRole === "freelancer" && <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs">
              <SignalHigh className="mr-2 h-3.5 w-3.5" />
              <span>Priority</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-40 ml-1 bg-cardC border-cardCB">
                {PRIORITY_OPTIONS.map((priority) => (
                  <DropdownMenuItem
                    key={priority.value}
                    className="text-xs gap-2"
                    onClick={() => onFiltersChange({ ...filters, priority: priority.value })}
                  >
                    {priority.svg}
                    {priority.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Optional: Show active filters as badges if needed */}
      {filters.status !== "All" && (
        <div className="text-[10px] px-2 py-1 rounded border-cardCB capitalize bg-cardC flex items-center gap-3">
          <p>Status: {filters.status}</p>

          <span className="bg-cardICB py-1 px-3 rounded cursor-pointer" onClick={() => onFiltersChange({ ...filters, status: "All" })}>x</span>
        </div>

      )}


      {filters.priority !== "All" && (
        <div className="text-[10px] px-2 py-1 rounded border-cardCB capitalize bg-cardC flex items-center gap-3">
          <p>Status: {filters.priority}</p>

          <span className="bg-cardICB py-1 px-3 rounded cursor-pointer" onClick={() => onFiltersChange({ ...filters, priority: "All" })}>x</span>
        </div>

      )}
    </div>
  );
}