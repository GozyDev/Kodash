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

interface PriorityData {
  name: Task["status"];
  svg?: React.ReactNode;
}

const priorityData: PriorityData[] = [
  {
    name: "to-do",
    svg: (
      <svg
        aria-label="Todo"
        className="color-override"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="1"
          y="1"
          width="12"
          height="12"
          rx="6"
          stroke="#e2e2e2"
          stroke-width="1.5"
          fill="none"
        ></rect>
        <path
          fill="#e2e2e2"
          stroke="none"
          d="M 3.5,3.5 L3.5,0 A3.5,3.5 0 0,1 3.5, 0 z"
          transform="translate(3.5,3.5)"
        ></path>
      </svg>
    ),
  },
  {
    name: "in-progress",
    svg: (
      <svg
        aria-label="In Progress"
        className="color-override"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        role="img"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="1"
          y="1"
          width="12"
          height="12"
          rx="6"
          stroke="lch(80% 90 85)"
          stroke-width="1.5"
          fill="none"
        ></rect>
        <path
          fill="lch(80% 90 85)"
          stroke="none"
          d="M 3.5,3.5 L3.5,0 A3.5,3.5 0 0,1 3.5, 7 z"
          transform="translate(3.5,3.5)"
        ></path>
      </svg>
    ),
  },
  {
    name: "done",
    svg: (
      <svg
        className="color-override"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="lch(48% 59.31 288.43)"
        role="img"
        focusable="false"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        //   style="--icon-color: lch(48% 59.31 288.43);"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0ZM11.101 5.10104C11.433 4.76909 11.433 4.23091 11.101 3.89896C10.7691 3.56701 10.2309 3.56701 9.89896 3.89896L5.5 8.29792L4.10104 6.89896C3.7691 6.56701 3.2309 6.56701 2.89896 6.89896C2.56701 7.2309 2.56701 7.7691 2.89896 8.10104L4.89896 10.101C5.2309 10.433 5.7691 10.433 6.10104 10.101L11.101 5.10104Z"
        ></path>
      </svg>
    ),
  },
];

const getPriorityImage = (priority: Task["status"]) => {
  switch (priority) {
    case "to-do":
      return (
        <svg
          aria-label="Todo"
          className="color-override"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          role="img"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1"
            y="1"
            width="12"
            height="12"
            rx="6"
            stroke="#e2e2e2"
            stroke-width="1.5"
            fill="none"
          ></rect>
          <path
            fill="#e2e2e2"
            stroke="none"
            d="M 3.5,3.5 L3.5,0 A3.5,3.5 0 0,1 3.5, 0 z"
            transform="translate(3.5,3.5)"
          ></path>
        </svg>
      );
    case "in-progress":
      return (
        <svg
          aria-label="In Progress"
          className="color-override"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          role="img"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1"
            y="1"
            width="12"
            height="12"
            rx="6"
            stroke="lch(80% 90 85)"
            stroke-width="1.5"
            fill="none"
          ></rect>
          <path
            fill="lch(80% 90 85)"
            stroke="none"
            d="M 3.5,3.5 L3.5,0 A3.5,3.5 0 0,1 3.5, 7 z"
            transform="translate(3.5,3.5)"
          ></path>
        </svg>
      );
    case "done":
      return (
        <svg
          className="color-override"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="lch(48% 59.31 288.43)"
          role="img"
          focusable="false"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          //   style="--icon-color: lch(48% 59.31 288.43);"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0ZM11.101 5.10104C11.433 4.76909 11.433 4.23091 11.101 3.89896C10.7691 3.56701 10.2309 3.56701 9.89896 3.89896L5.5 8.29792L4.10104 6.89896C3.7691 6.56701 3.2309 6.56701 2.89896 6.89896C2.56701 7.2309 2.56701 7.7691 2.89896 8.10104L4.89896 10.101C5.2309 10.433 5.7691 10.433 6.10104 10.101L11.101 5.10104Z"
          ></path>
        </svg>
      );

    default:
      return (
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
      );
  }
};

const StatusCard = ({
  task,
  status,
}: {
  task: Task;
  status: Task["status"];
}) => {
  const handleOptimisticPriority = useTaskStore(
    (state) => state.handleOptimisticPriority
  );
  const orgId = useOrgIdStore((state) => state.orgId);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-1 rounded cursor-pointer text-[10px] tracking-widest">
        {getPriorityImage(status)}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="outline-0 border-none w-[200px]">
        {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
        <DropdownMenuSeparator className="bg-cardCB/50" />
        {priorityData.map((data, idx) => (
          <DropdownMenuItem
            key={idx}
            className="text-[12px] tracking-widest text-textNc"
            onClick={() => handleOptimisticPriority(task.id, data.name)}
          >
            <span>{data.svg}</span> {data.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusCard;
