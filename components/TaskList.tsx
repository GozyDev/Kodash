// app/tasks/TaskList.tsx
"use client";

import { Task } from "@/lib/superbase/type";
import { displayStatusForStatusCard } from "@/lib/status";
import { motion, AnimatePresence } from "framer-motion";
import TaskCard from "./TaskCard";
import { useMemo, useState, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  totalTasksCount: number;
  userRole: "client" | "freelancer";
  onTaskClick?: (task: Task) => void;
  onCreateWithStatus?: (status: Task["status"]) => void;
}

export default function TaskList({
  tasks,
  totalTasksCount,
  userRole,
}: TaskListProps) {
  const groups = useMemo(() => {
    const byStatus: Partial<Record<Task["status"], Task[]>> = {
      draft: [],
      propose: [],
      "on-going": [],
      deliver: [],
      complete: [],
      cancel: [],
    };

    for (const t of tasks) {
      // normalize stored status to present-tense for grouping (DB may store past-tense)
      const present = displayStatusForStatusCard(t.status) as Task["status"];
      if (byStatus[present]) byStatus[present].push(t);
    }

    return [
      {
        key: "draft" as Task["status"],
        label: "Draft",
        items: byStatus["draft"],
      },
      {
        key: "propose" as Task["status"],
        label: "Proposed",
        items: byStatus["propose"],
      },
      {
        key: "on-going" as Task["status"],
        label: "On-going",
        items: byStatus["on-going"],
      },
      {
        key: "deliver" as Task["status"],
        label: "Delivered",
        items: byStatus["deliver"],
      },
      {
        key: "complete" as Task["status"],
        label: "Completed",
        items: byStatus["complete"],
      },
      {
        key: "cancel" as Task["status"],
        label: "Cancelled",
        items: byStatus["cancel"],
      },
    ];
  }, [tasks]);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = useCallback((key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);
  if (totalTasksCount === 0) {
    return (
      <div className="flex gap-3 justify-center items-center flex-col h-[60vh] border-2 border-dashed border-cardCB rounded-lg m-4">
        <img
          src="/linear.png"
          alt="no tasks"
          className="w-[100px] grayscale-80"
        />
        <div className="text-textNb capitalize text-center">
          {userRole === "client"
            ? "Create your first request to get started"
            : "No requests made yet"}
        </div>
      </div>
    );
  }

  // STATE 2: Tasks exist, but the FILTER result is empty
  if (tasks.length === 0) {
    return (
      <div className="flex gap-3 justify-center items-center flex-col h-[60vh] border-2 border-dashed border-cardCB rounded-lg m-4">
        <div className="bg-cardC p-4 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-textNd"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-textNa font-medium">No matches found</h3>
          <p className="text-textNd text-sm mt-1">
            Try adjusting your filters to find what you're looking for.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {groups.map((group) => {
        if (!group.items) {
          return;
        }
        if (group.items.length === 0) return null; // render section only if it has tasks
        const isCollapsed = !!collapsed[group.key];
        return (
          <div
            key={group.key}
            className="border border-cardCB rounded-md overflow-hidden"
          >
            <button
              className="w-full flex items-center justify-between px-3 py-2 bg-cardC/60 hover:bg-cardC text-textNb"
              onClick={() => toggle(group.key)}
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{group.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-textNd">
                  {group.items.length}
                </span>
                {/* {!!onCreateWithStatus && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateWithStatus(group.key);
                    }}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-cardCB bg-white/90 text-black hover:bg-white cursor-pointer select-none"
                    title="Create task in this section"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 4.5a.75.75 0 0 1 .75.75v6h6a.75.75 0 0 1 0 1.5h-6v6a.75.75 0 0 1-1.5 0v-6h-6a.75.75 0 0 1 0-1.5h6v-6A.75.75 0 0 1 12 4.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    New
                  </span>
                )} */}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-3 space-y-3"
                >
                  {group.items.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <TaskCard task={task} userRole={userRole} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
