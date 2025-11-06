// app/tasks/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task, TaskInsert, TaskUpdate } from "@/lib/superbase/type";
import TaskList from "@/components/TaskList";
import TaskFilters from "@/components/TaskFilters";
import TaskDrawer from "@/components/TaskDrawer";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

export default function TaskClient({ project_id }: { project_id: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<Task["status"] | null>(null);
  const [filters, setFilters] = useState({
    status: "All" as "All" | Task["status"],
    priority: "All" as "All" | Task["priority"],
  });

  //   // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/task/${project_id}`);

      if (!res.ok) {
        const errorMessage = await res.json();
        console.log(errorMessage);
      } else {
        const data = await res.json();
        console.log("Data", data);
        setTasks(data || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Apply filters
  useEffect(() => {
    let result = tasks;

    if (filters.status !== "All") {
      result = result.filter((task) => task.status === filters.status);
    }

    if (filters.priority !== "All") {
      result = result.filter((task) => task.priority === filters.priority);
    }

    setFilteredTasks(result);
  }, [tasks, filters]);

  // Create task
  // Client-side methods now use fetch()

  const handleCreateTask = async (taskData: Omit<TaskInsert, "project_id">) => {
    const res = await fetch(`/api/task/${project_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Error creating task:", data.error);
      return;
    }

    setTasks((prev) => [data, ...prev]);
    setIsDrawerOpen(false);
    setCreateInitialStatus(null);
  };

  const handleUpdateTask = async (id: string, updates: TaskUpdate) => {
    const res = await fetch(`/api/task/${project_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Error updating task:", data.error);
      return;
    }
    console.log(selectedTask);
    setTasks((prev) => prev.map((task) => (task.id === id ? data : task)));
    setSelectedTask(data);
  };

  const handleDeleteTask = async (id: string) => {
    const res = await fetch(`/api/task/${project_id}?id=${id}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (!res.ok) {
      console.error("Error deleting task:", data.error);
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== id));
    setIsDrawerOpen(false);
    setSelectedTask(null);
    setCreateInitialStatus(null);
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ignore when typing in inputs, textareas or contenteditable elements
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" || tag === "textarea" || target?.isContentEditable;
      if (isTyping) return;

      if (e.key.toLowerCase() === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // optional: e.stopPropagation();
        setSelectedTask(null);
        setIsDrawerOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress); // MATCH event
  }, []);

  const progress =
    tasks.length > 0
      ? (tasks.filter((t) => t.status === "done").length / tasks.length) * 100
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="text-textNb p">
      {/* Header */}
      <div className="border-b border-cardCB px-6 pb-4 py-[30px] ">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold ">Issues</h1>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="px-2 py-0.5 rounded border border-cardCB bg-cardC text-textNd">Todo: {tasks.filter((t) => t.status === "to-do").length}</span>
              <span className="px-2 py-0.5 rounded border border-cardCB bg-cardC text-textNd">In Progress: {tasks.filter((t) => t.status === "in-progress").length}</span>
              <span className="px-2 py-0.5 rounded border border-cardCB bg-cardC text-textNd">Done: {tasks.filter((t) => t.status === "done").length}</span>
            </div>
          </div>

          <Button
            onClick={() => {
              setSelectedTask(null);
              setIsDrawerOpen(true);
            }}
            className="butt"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-cardC rounded-full h-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters filters={filters} onFiltersChange={setFilters} />

      {/* Task List */}
      <div className="px-6 py-4">
        <TaskList
          tasks={filteredTasks}
          onTaskClick={(task) => {
            setSelectedTask(task);
            setIsDrawerOpen(true);
          }}
          onCreateWithStatus={(status) => {
            setSelectedTask(null);
            setCreateInitialStatus(status);
            setIsDrawerOpen(true);
          }}
        />
      </div>

      {/* Task Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <TaskDrawer
            task={selectedTask}
            isOpen={isDrawerOpen}
            onClose={() => {
              setIsDrawerOpen(false);
              setSelectedTask(null);
              setCreateInitialStatus(null);
            }}
            onSave={(payload) => {
              if (selectedTask) {
                handleUpdateTask(selectedTask.id, payload as TaskUpdate);
              } else {
                handleCreateTask(payload as Omit<TaskInsert, "project_id">);
              }
            }}   
            onDelete={
              selectedTask ? () => handleDeleteTask(selectedTask.id) : undefined
            }
            initialStatus={createInitialStatus ?? undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
