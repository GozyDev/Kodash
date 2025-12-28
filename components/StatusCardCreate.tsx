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
import { useOrgIdStore } from "@/app/store/useOrgId";

interface StatusData {
  name: Task["status"];
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
    name: "proposed",
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
    name: "active",
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
  switch (status) {
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

    case "proposed":
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

    case "active":
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

const StatusCardCreate = ({
  handleChange,
  status,
}: {
  handleChange: (field: string, value: string) => void;
  status: Task["status"];
}) => {
  const orgId = useOrgIdStore((state) => state.orgId);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-1 rounded text-[10px] tracking-widest">
        <div className=" flex items-center justify-center gap-2 bg-cardICB/50 p-2 rounded-xl">
          {getStatusImage(status)} <p className=" capitalize ">{status}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="outline-0 border-none w-[200px]">
        {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
        <DropdownMenuSeparator className="bg-cardCB/50" />
        {statusData.map((data, idx) => (
          <DropdownMenuItem
            key={idx}
            className="text-[12px] tracking-widest text-textNc"
            onClick={() => handleChange("status", data.name)}
          >
            <span>{data.svg}</span> {data.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusCardCreate;
