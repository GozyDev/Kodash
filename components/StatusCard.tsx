import React, { ReactNode, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/lib/superbase/type";
import { useTaskStore } from "@/app/store/useTask";
import { useOrgIdStore } from "@/app/store/useOrgId";
import {
  presentToPast,
  displayStatusForStatusCard,
} from "@/lib/status";

interface StatusData {
  // use present-tense values for selection/display in the StatusCard UI
  name: string;
  svg?: React.ReactNode;
}

const statusData: StatusData[] = [
  {
    name: "draft",
    svg: (
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
    ),
  },
  {
    name: "propose",
    svg: (
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
    ),
  },
  {
    name: "on-going",
    svg: (
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
    ),
  },
  {
    name: "deliver",
    svg: (
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
    ),
  },

  {
    name: "complete",
    svg: (
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
    ),
  },
  {
    name: "cancel",
    svg: (
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
    ),
  },
];

const getStatusImage = (status: Task["status"]) => {
  // ensure we compare using present-tense for selecting images
  const present = displayStatusForStatusCard(status);
  switch (present) {
    case "draft":
      return (
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
      );

    case "propose":
      return (
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
      );

    case "on-going":
      return (
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
      );

    case "deliver":
      return (
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
      );

    case "cancel":
      return (
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
      );

    default:
      return null;
  }
};

const StatusCard = ({
  task,
  status,
}: {
  task: Task;
  status: Task["status"];
}) => {
  const handleOptimisticStatus = useTaskStore(
    (state) => state.handleOptimisticStatus
  );
  const orgId = useOrgIdStore((state) => state.orgId);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="p-1 rounded cursor-pointer text-[10px] tracking-widest"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {getStatusImage(status)}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="outline-0 border-none w-[200px]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <DropdownMenuSeparator className="bg-cardCB/50" />
        {/* Only show Deliver and Cancel controls. Enabled only when status is on-going. */}
        {(() => {
          const present = displayStatusForStatusCard(status);
          const enabled = present === "on-going";
          return (
            <>
              <DropdownMenuItem
                className={`text-[12px] tracking-widest text-textNc flex items-center gap-2 ${
                  enabled ? "" : "opacity-50 cursor-not-allowed"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!enabled) return;
                  const dbStatus = presentToPast("deliver");
                  handleOptimisticStatus(task.id, dbStatus as Task["status"]);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={!enabled}
              >
                <span>
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
                </span>
                Deliver
              </DropdownMenuItem>

              <DropdownMenuItem
                className={`text-[12px] tracking-widest text-textNc flex items-center gap-2 ${
                  enabled ? "" : "opacity-50 cursor-not-allowed"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!enabled) return;
                  const dbStatus = presentToPast("cancel");
                  handleOptimisticStatus(task.id, dbStatus as Task["status"]);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={!enabled}
              >
                <span>
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
                </span>
                Cancel
              </DropdownMenuItem>
            </>
          );
        })()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusCard;
