// app/tasks/TaskList.tsx
"use client";

import { Task } from "@/lib/superbase/type";
import { motion, AnimatePresence } from "framer-motion";
import TaskCard from "./TaskCard";
import { useMemo, useState, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TaskListProps {
  tasks: Task[];

  onTaskClick: (task: Task) => void;
  onCreateWithStatus?: (status: Task["status"]) => void;
}

export default function TaskList({
  tasks,
  onTaskClick,
  onCreateWithStatus,
}: TaskListProps) {
  const groups = useMemo(() => {
    const byStatus: Record<Task["status"], Task[]> = {
      "to-do": [],
      "in-progress": [],
      done: [],
    } as Record<Task["status"], Task[]>;

    for (const t of tasks) {
      if (byStatus[t.status]) byStatus[t.status].push(t);
    }

    return [
      {
        key: "to-do" as Task["status"],
        label: "Todo",
        items: byStatus["to-do"],
      },
      {
        key: "in-progress" as Task["status"],
        label: "In Progress",
        items: byStatus["in-progress"],
      },
      { key: "done" as Task["status"], label: "Done", items: byStatus["done"] },
    ];
  }, [tasks]);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = useCallback((key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const hasAny = tasks.length > 0;

  if (!hasAny) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">No tasks found</div>
        <div className="text-gray-500 text-sm mt-2">
          Create your first task to get started
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
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
                {!!onCreateWithStatus && (
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
                )}
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
                      <TaskCard task={task} onClick={() => onTaskClick(task)} />
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
