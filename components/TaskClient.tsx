// app/tasks/page.tsx
"use client";
import { useTaskStore } from "@/app/store/useTask";
import { useOrgIdStore } from "@/app/store/useOrgId";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task, TaskInsert, TaskUpdate } from "@/lib/superbase/type";
import TaskList from "@/components/TaskList";
import TaskFilters from "@/components/TaskFilters";
import TaskDrawer from "@/components/TaskDrawer";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/superbase/superbase-server";
import { createBrowserClient } from "@supabase/ssr";

export default function TaskClient({
  orgId,
  userRole,
}: {
  orgId: string;
  userRole: "client" | "freelancer";
}) {
  const task = useTaskStore((state) => state.task);
  const setTask = useTaskStore((state) => state.setTask);

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<
    Task["status"] | null
  >(null);
  const [filters, setFilters] = useState({
    status: "All" as "All" | Task["status"],
    priority: "All" as "All" | Task["priority"],
  });

  //   // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      // If the client store already has tasks for this org, skip network call.
      const current = useTaskStore.getState().task;
      const currentOrg = useOrgIdStore.getState().orgId;

      // Only use cache if it matches the current org and orgId is set
      if (
        current &&
        current.length > 0 &&
        currentOrg === orgId &&
        orgId !== ""
      ) {
        // Just set loading false; filtered tasks will be derived from store
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/task/${orgId}`);

      if (!res.ok) {
        const errorMessage = await res.json();
        console.log(errorMessage);
      } else {
        const data = await res.json();
        setTask(data || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  // keep the global orgId in sync so other components can use it when checking cache
  // also clear old tasks immediately when switching orgs to prevent stale data
  useEffect(() => {
    setLoading(true);
    setTask([]);
    useOrgIdStore.getState().setOrgId(orgId);
  }, [orgId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!orgId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    let channel: any;

    const setupRealtime = async () => {
      // 🔍 PROOF STEP — DO NOT SKIP
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("realtime user:", user?.id);

      if (!user) {
        console.error("❌ NO AUTH USER — REALTIME WILL NOT FIRE");
        return;
      }

      channel = supabase
        .channel(`tasks-${orgId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "tasks",
            filter: `tenant_id=eq.${orgId}`,
          },
          (payload) => {
            console.log("INSERT realtime fired");
            const newTask = payload.new as Task;

            const current = useTaskStore.getState().task;
            const exists = current.some((t) => t.id === newTask.id);

            useTaskStore.setState({
              task: exists
                ? current.map((t) => (t.id === newTask.id ? newTask : t))
                : [newTask, ...current],
            });
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "tasks",
            filter: `tenant_id=eq.${orgId}`,
          },
          (payload) => {
            console.log("UPDATE realtime fired");
            const updatedTask = payload.new as Task
            const current = useTaskStore.getState().task
            const exists = current.some((t) => t.id === updatedTask.id)
            useTaskStore.setState({
              task: exists ? current.map((t) => t.id === updatedTask.id ? updatedTask : t) : [updatedTask, ...current],
            })
            console.log("WrapedTask")
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "tasks",
            filter: `tenant_id=eq.${orgId}`,
          },
          (payload) => {
            console.log("DELETE realtime fired");
            const removed = payload.old as Task;

            useTaskStore.setState({
              task: useTaskStore
                .getState()
                .task.filter((t) => t.id !== removed.id),
            });
          },
        )
        .subscribe((status) =>
          console.log("Realtime status:", status),
        );
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [orgId]);


  // Apply filters
  useEffect(() => {
    let result = task;

    if (filters.status !== "All") {
      result = result.filter((task) => task.status === filters.status);
    }

    if (filters.priority !== "All") {
      result = result.filter((task) => task.priority === filters.priority);
    }

    setFilteredTasks(result);
  }, [task, filters]);

  // Keyboard shortcut - only for clients
  useEffect(() => {
    if (userRole !== "client") return;

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
  }, [userRole]);

  const progress =
    task.length > 0
      ? (task.filter((t) => t.status === "complete").length / task.length) * 100
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
      <div className="border-b border-cardCB px-6 pb-4 py-[5px] ">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className="px-2 py-0.5 rounded border border-cardCB bg-cardC text-textNd">
                {/* Todo: {task.filter((t) => t.status === "to-do").length} */}
                All request
              </span>
              <span className="px-2 py-0.5 rounded border border-cardCB bg-cardC text-textNd">
                {/* In Progress:{" "}
                {task.filter((t) => t.status === "in-progress").length} */}
                Proposed
              </span>
              <span className="px-2 py-0.5 rounded border border-cardCB bg-cardC text-textNd">
                {/* Done: {task.filter((t) => t.status === "done").length} */}
                Completed
              </span>
            </div>
          </div>

          {userRole === "client" && (
            <button
              onClick={() => {
                setSelectedTask(null);
                setIsDrawerOpen(true);
              }}
              className="butt w-10 h-5 flex items-center justify-center rounded text-sm"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {/* {
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
        } */}
      </div>

      {/* Filters */}
      {/* {<TaskFilters filters={filters} onFiltersChange={setFilters} />} */}

      {/* Task List */}
      <div className="px-6 py-4">
        <TaskList
          tasks={filteredTasks}
          userRole={userRole}
          onCreateWithStatus={
            userRole === "client"
              ? (status) => {
                setSelectedTask(null);
                setCreateInitialStatus(status);
                setIsDrawerOpen(true);
              }
              : undefined
          }
        />
      </div>

      {/* Task Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <TaskDrawer
            task={selectedTask}
            isOpen={isDrawerOpen}
            userRole={userRole}
            onClose={() => {
              setIsDrawerOpen(false);
              setSelectedTask(null);
              setCreateInitialStatus(null);
            }}
            onDelete={undefined}
            initialStatus={createInitialStatus ?? undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
