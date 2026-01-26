// app/tasks/TaskCard.tsx
"use client";

import { Task } from "@/lib/superbase/type";
import { motion } from "framer-motion";
import { Calendar, MoreHorizontal } from "lucide-react";
import PriorityCard from "./piortyCard";
import WriteProposalDialog from "./WriteProposalDialog";
import { useState } from "react";

import StatusCard from "./StatusCard";
import { displayStatusForTaskCard, presentToPast } from "@/lib/status";
import Link from "next/link";
import { useOrgIdStore } from "@/app/store/useOrgId";
import { useTaskStore } from "@/app/store/useTask";
import { useRouter } from "next/navigation";

interface TaskCardProps {
  task: Task;
  userRole: "client" | "freelancer";
}

export default function TaskCard({ task, userRole }: TaskCardProps) {
  const router = useRouter();
  const [openProposal, setOpenProposal] = useState(false);

  const orgId = useOrgIdStore((state) => state.orgId);
  const handleOptimisticStatus = useTaskStore(
    (state) => state.handleOptimisticStatus
  );

  const getStatusColor = (status: Task["status"]) => {
    const normalized = displayStatusForTaskCard(status);
    switch (normalized) {
      case "proposed":
        return "border-[#f97316]/10 bg-[#f97316]/2";

      case "on-going":
        return "border-[#2563eb]/10 bg-[#2563eb]/2";

      case "delivered":
        return "border-[#7c3aed]/10 bg-[#7c3aed]/2";

      case "completed":
        return "border-[#22c55e]/10 bg-[#22c55e]/2";

      case "canceled":
        return "border-[#ef4444]/10 bg-[#ef4444]/2";

      default:
        return "border-gray-300/10 bg-gray-50/2";
    }
  };

  const basePath =
    userRole === "freelancer"
      ? `/dashboard/fr-org/${orgId}`
      : `/dashboard/cl-org/${orgId}`;

  const handleCardClick = () => {
    router.push(`${basePath}/issue/${task.id}`);
  };

  return (
    <motion.div
      className={`
          border rounded-lg p-4 cursor-pointer transition-all duration-200
          hover:shadow-md ${getStatusColor(task.status)}
        `}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <PriorityCard task={task} priority={task.priority}></PriorityCard>
            </div>
            <div
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <span className="text-sm font-medium text-textNc capitalize">
                {displayStatusForTaskCard(task.status).toLowerCase()}
              </span>
              <StatusCard task={task} status={task.status} userRole={userRole}></StatusCard>
            </div>
          </div>
          <h3 className="font-semibold text-[15px] md:text-base">{task.title}</h3>
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
          {/* Only show "Write Proposal" for freelancers on draft requests */}
          {task.status === "draft" && userRole === "freelancer" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenProposal(true);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="text-sm bg-cardC py-1 px-3 mt-[20px] rounded-lg text-textNd"
            >
              Write Proposal
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <WriteProposalDialog
              open={openProposal}
              onOpenChange={setOpenProposal}
              task={task}
              onSubmit={async (proposal) => {
                try {
                  const response = await fetch("/api/proposal", {
                    method: "POST",
                    headers: { "Content-type": "application/json" },
                    body: JSON.stringify({ ...proposal, requestId: task.id }),
                  });

                  if (response.ok) {
                    // If proposal was created successfully and task is draft, update status to proposed
                    if (task.status === "draft") {
                      // convert present-tense selection to past-tense for DB
                      const dbStatus = presentToPast("propose");
                      handleOptimisticStatus(task.id, dbStatus as Task["status"]);
                    }
                    setOpenProposal(false);
                  } else {
                    const error = await response.json();
                    console.error("Failed to create proposal:", error);
                  }
                } catch (err) {
                  console.error("Error creating proposal:", err);
                }
              }}
            />
          </div>
        </div>
     
      </div>
    </motion.div>
  );
}
