// app/tasks/TaskCard.tsx
"use client";

import { Task } from "@/lib/superbase/type";
import { motion } from "framer-motion";
import { Calendar, MoreHorizontal } from "lucide-react";
import PriorityCard from "./piortyCard";
import { useState } from "react";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
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
      case "to-do":
        return "border-gray-300/10 bg-gray-200/5";
      case "in-progress":
        return "border-blue-300/10 bg-blue-800/5";
      case "done":
        return "border-green-300/10 bg-green-800/5";
      default:
        return "border-gray-300/10 bg-gray-50/5";
    }
  };

  return (
    <motion.div
      className={`
        border rounded-lg p-4 cursor-pointer transition-all duration-200
        hover:shadow-md ${getStatusColor(task.status)}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <div className={``}>
              <PriorityCard task={task} priority={task.priority}></PriorityCard>
            </div>
            <span className="text-sm font-medium text-textNc capitalize">
              {task.status.toLowerCase()}
            </span>
          </div>

          <h3 className="font-semibold  truncate">{task.title}</h3>

          {task.description && (
            <p className="text-sm text-textNc  mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {task.due_date && (
            <div className="flex items-center mt-2 text-sm text-textNd">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(task.due_date).toLocaleDateString()}
            </div>
          )}
        </div>

        <MoreHorizontal className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </motion.div>
  );
}
