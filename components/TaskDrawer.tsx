// app/tasks/TaskDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task, TaskInsert, TaskUpdate } from "@/lib/superbase/type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Save, Trash2, Maximize2, Minimize2, Circle, Minus } from "lucide-react";

interface TaskDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskUpdate | Omit<TaskInsert, "project_id">) => void;
  onDelete?: () => void;
}

export default function TaskDrawer({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: TaskDrawerProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    status: "to-do" as Task["status"],
    due_date: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        due_date: task.due_date || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "to-do",
        due_date: "",
      });
    }
    // Reset expand state when modal opens/closes
    if (!isOpen) {
      setIsExpanded(false);
    }
  }, [task, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleSave = () => {
    setIsSaving(true);
    try {
      onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    if (!onDelete) {
      return;
    }
    try {
      onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "to-do":
        return <Circle className="w-3.5 h-3.5" />;
      case "in-progress":
        return <Minus className="w-3.5 h-3.5 rotate-90" />;
      case "done":
        return <Circle className="w-3.5 h-3.5 fill-current" />;
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "to-do":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20";
      case "done":
        return "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Centered Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                height: isExpanded ? "90vh" : "auto"
              }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-2xl bg-cardC  rounded-lg shadow-2xl pointer-events-auto border border-cardCB flex flex-col relative ${
                isExpanded ? "h-[90vh]" : "max-h-[85vh]"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-cardCB/80">
                <div className="flex items-center gap-2 text-sm text-textNd">
                  <span className="text-textNb">{task ? "Edit" : "New"} issue</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-7 w-7 p-0 text-textNd hover:text-textNb hover:bg-bgPrimary/30"
                  >
                    {isExpanded ? (
                      <Minimize2 className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-7 w-7 p-0 text-textNd hover:text-textNb hover:bg-bgPrimary/30"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className={`flex-1 overflow-y-auto px-5 py-4 ${isExpanded ? "min-h-0" : ""}`}>
                {/* Title - No border, just placeholder */}
                <div className="mb-4">
                  <Input
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Issue title"
                    className="text-base font-medium border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-1 placeholder:text-textNd h-auto"
                    autoFocus
                  />
                </div>

                {/* Description - No border */}
                <div className="mb-6">
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Add description..."
                    rows={isExpanded ? 20 : 6}
                    className="resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-1 placeholder:text-textNd text-sm min-h-[100px]"
                  />
                </div>

                {/* Status & Priority Row - Button style like Linear */}
                <div className="flex items-center gap-2 flex-wrap border-t border-cardCB/80 pt-4 abosolute bottom-0 w-full">
                  {/* Status */}
                  <Select
                    value={formData.status}
                    onValueChange={(value: Task["status"]) =>
                      handleChange("status", value)
                    }
                  >
                    <SelectTrigger className={`h-7 px-2.5 border rounded-md text-xs font-medium transition-colors ${getStatusColor(formData.status)} focus:ring-0 focus:ring-offset-0`}>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(formData.status)}
                        <span className="capitalize">
                          {formData.status === "to-do" ? "Todo" : formData.status === "in-progress" ? "In Progress" : "Done"}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-cardCB text-textNb border-cardCB">
                      <SelectItem value="to-do" className="flex items-center gap-2">
                        <Circle className="w-3.5 h-3.5 text-gray-400" />
                        <span>Todo</span>
                      </SelectItem>
                      <SelectItem value="in-progress" className="flex items-center gap-2">
                        <Minus className="w-3.5 h-3.5 rotate-90 text-blue-400" />
                        <span>In Progress</span>
                      </SelectItem>
                      <SelectItem value="done" className="flex items-center gap-2">
                        <Circle className="w-3.5 h-3.5 fill-current text-green-400" />
                        <span>Done</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Priority */}
                  <Select
                    value={formData.priority}
                    onValueChange={(value: Task["priority"]) =>
                      handleChange("priority", value)
                    }
                  >
                    <SelectTrigger className={`h-7 px-2.5 border rounded-md text-xs font-medium transition-colors capitalize ${getPriorityColor(formData.priority)} focus:ring-0 focus:ring-offset-0`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-cardCB text-textNb border-cardCB">
                      <SelectItem value="high" className="capitalize">High</SelectItem>
                      <SelectItem value="medium" className="capitalize">Medium</SelectItem>
                      <SelectItem value="low" className="capitalize">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-cardCB/50 bg-bgPrimary/10">
                <div>
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="h-7 text-xs text-red-400 border-red-800/30 hover:bg-red-950/20 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-7 px-3 text-xs text-textNd hover:text-textNb hover:bg-bgPrimary/30"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!formData.title.trim() || isSaving}
                    className="h-7 px-3 text-xs butt"
                  >
                    {task ? (isSaving ? "Saving..." : "Save") : (isSaving ? "Creating..." : "Create issue")}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
