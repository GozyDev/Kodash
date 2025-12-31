// app/tasks/TaskCard.tsx
"use client";

import { Task } from "@/lib/superbase/type";
import { motion } from "framer-motion";
import { Calendar, MoreHorizontal } from "lucide-react";
import PriorityCard from "./piortyCard";
import WriteProposalDialog from "./WriteProposalDialog";
import { useState } from "react";

import StatusCard from "./StatusCard";
import Link from "next/link";
import { useOrgIdStore } from "@/app/store/useOrgId";
import { useRouter } from "next/navigation";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const router = useRouter();
  const [openProposal, setOpenProposal] = useState(false);

  const orgId = useOrgIdStore((state) => state.orgId);
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20";
      case "medium":
        return "bg-yellow-500/20";
      case "low":
        return "bg-green-500/20";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "draft":
        return "border-[#f9be00]/10 bg-[#f9be00]/2";

      case "proposed":
        return "border-[#f97316]/10 bg-[#f97316]/2";

      case "active":
        return "border-[#2563eb]/10 bg-[#2563eb]/2";

      case "deliver":
        return "border-[#7c3aed]/10 bg-[#7c3aed]/2";

      case "complete":
        return "border-[#22c55e]/10 bg-[#22c55e]/2";

      case "cancel":
        return "border-[#ef4444]/10 bg-[#ef4444]/2";

      default:
        return "border-gray-300/10 bg-gray-50/2";
    }
  };

  const basePath = `/dashboard/fr-og/${orgId}`;

  return (
    // <Link href={`${basePath}/issue/${task.id}`}>

    // </Link>
    <motion.div
      className={`
          border rounded-lg p-4 cursor-pointer transition-all duration-200
          hover:shadow-md ${getStatusColor(task.status)}
        `}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault()
        router.push(`${basePath}/issue/${task.id}`);
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <div className={``}>
              <PriorityCard task={task} priority={task.priority}></PriorityCard>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-textNc capitalize">
                {task.status.toLowerCase()}
              </span>
              <StatusCard task={task} status={task.status}></StatusCard>
            </div>
          </div>
          <h3 className="font-semibold  truncate">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-textNd  mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          {task.due_date && (
            <div className="flex items-center mt-2 text-sm text-textNd">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(task.due_date).toLocaleDateString()}
            </div>
          )}
          {task.status === "draft" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault()
                setOpenProposal(true);
              }}
              className="text-sm bg-cardC py-1 px-3 mt-[20px] rounded-lg text-textNd"
            >
              Write Proposal
            </button>
          )}

          <WriteProposalDialog
            open={openProposal}
            onOpenChange={setOpenProposal}
            task={task}
            onSubmit={(proposal) => {
              const response = fetch("/api/proposal", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ ...proposal, requestId: task.id }),
              });
              // setOpenProposal(false);
            }}
          />
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </motion.div>
  );
}
