// app/tasks/page.tsx
"use client";
import { useTaskStore } from "@/app/store/useTask";
import { useOrgIdStore } from "@/app/store/useOrgId";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Task } from "@/lib/superbase/type";
import TaskList from "@/components/TaskList";
import TaskFilters from "@/components/TaskFilters";
import TaskDrawer from "@/components/TaskDrawer";
import { RealtimeChannel } from "@supabase/supabase-js";

import Image from "next/image";

import { createBrowserClient } from "@supabase/ssr";
import { FilePenLine } from "lucide-react";

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
  const [memberCount, setMemberCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<
    Task["status"] | null
  >(null);
  const [filters, setFilters] = useState({
    status: "All" as "All" | Task["status"],
    priority: "All" as "All" | Task["priority"],
  });

  const fetchTasks = useCallback(async () => {
    try {
      const current = useTaskStore.getState().task;
      const currentOrg = useOrgIdStore.getState().orgId;

      if (
        current &&
        current.length > 0 &&
        currentOrg === orgId &&
        orgId !== ""
      ) {
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
    }
  }, [orgId, setTask]);

  const fetchMemberships = useCallback(async () => {
    try {
      const res = await fetch(`/api/memberships?orgId=${orgId}`);
      if (!res.ok) {
        console.error("Failed to fetch memberships");
        return;
      }
      const json = await res.json();
      setMemberCount(json.memberships?.length ?? 0);
    } catch (error) {
      console.error("Error fetching memberships:", error);
    }
  }, [orgId]);

  useEffect(() => {
    setLoading(true);
    setTask([]);
    setMemberCount(0);
    useOrgIdStore.getState().setOrgId(orgId);

    const load = async () => {
      await Promise.all([fetchTasks(), fetchMemberships()]);
      setLoading(false);
    };

    load();
  }, [orgId, setTask, fetchTasks, fetchMemberships]);

  useEffect(() => {
    if (!orgId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    let channel: RealtimeChannel;

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
            const updatedTask = payload.new as Task;
            const current = useTaskStore.getState().task;
            const exists = current.some((t) => t.id === updatedTask.id);
            useTaskStore.setState({
              task: exists
                ? current.map((t) =>
                    t.id === updatedTask.id ? updatedTask : t,
                  )
                : [updatedTask, ...current],
            });
            console.log("WrapedTask");
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
        .subscribe((status) => console.log("Realtime status:", status));
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel(`memberships-${orgId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "memberships",
            filter: `tenant_id=eq.${orgId}`,
          },
          () => {
            setMemberCount((prev) => prev + 1);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "memberships",
            filter: `tenant_id=eq.${orgId}`,
          },
          () => {
            setMemberCount((prev) => Math.max(0, prev - 1));
          },
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [orgId]);

  const isSoloWorkspace = memberCount === 1;

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

  // Keyboard shortcut - only for clients in multi-member workspaces
  useEffect(() => {
    if (userRole !== "client" || isSoloWorkspace) return;

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
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [userRole, isSoloWorkspace]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <Image
          src="/Logo.png"
          alt="Kodash Logo"
          width={100}
          height={100}
          className="mb-5 animate-pulse"
        />
      </div>
    );
  }

  return (
    <div className="text-textNb ">
      <div className="flex justify-between items-center py-2 p-3 border-b border-b-cardCB">
        {
          <TaskFilters
            filters={filters}
            onFiltersChange={setFilters}
            userRole={userRole}
          />
        }

        {userRole === "client" && !isSoloWorkspace && (
          <button
            className="butt  px-4 py-1.5 rounded"
            onClick={() => setIsDrawerOpen(true)}
          >
           <FilePenLine size={15}/>
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="px-2 md:px-4 py-4">
        <TaskList
          tasks={filteredTasks}
          totalTasksCount={task.length}
          memberCount={memberCount}
          orgId={orgId}
          userRole={userRole}
          onOpenDrawer={setIsDrawerOpen}
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
