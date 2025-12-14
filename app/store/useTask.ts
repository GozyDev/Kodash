import { Task, TaskInsert } from "@/lib/superbase/type";
import { create } from "zustand";
import { useOrgIdStore } from "./useOrgId";

interface TaskStore {
  task: Task[];
  setTask: (data: Task[]) => void;
  handleCreateTask: (taskdata: Omit<TaskInsert, "project_id">) => Promise<void>;
  handleOptimisticPriority: (
    id: string,
    newPriority: Task["priority"]
  ) => Promise<void>;

  handleOptimisticStatus: (
    id: string,
    newStatus: Task["status"]
  ) => Promise<void>;

  handleOptimisticTitle: (
    id: string,
    newTitle: string
  ) => Promise<void>;

  handleOptimisticDescription: (
    id: string,
    newDescription: string | null
  ) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  task: [],

  setTask: (data) => set({ task: data }),

  handleCreateTask: async (taskdata) => {
    const orgId = useOrgIdStore.getState().orgId; // 🔥 FIXED

    const res = await fetch(`/api/task/${orgId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskdata),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Error creating task:", data.error);
      return;
    }

    set((state) => ({
      task: [data, ...state.task],
    }));
  },

  handleOptimisticPriority: async (id, newPriority) => {
    const orgId = useOrgIdStore.getState().orgId; // 🔥 FIXED

    const backup = [...get().task];

    set((state) => ({
      task: state.task.map((t) =>
        t.id === id ? { ...t, priority: newPriority } : t
      ),
    }));

    const res = await fetch(`/api/task/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, priority: newPriority }),
    });

    if (!res.ok) {
      console.error("DB failed. Reverting.");
      set({ task: backup });
    }
  },

  handleOptimisticStatus: async (id, newStatus) => {
    const orgId = useOrgIdStore.getState().orgId;
    const backupRevert = [...get().task];
    set((state) => ({
      task: state.task.map((t) =>
        t.id === id ? { ...t, status: newStatus } : t
      ),
    }));

    const res = await fetch(`/api/task/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    if (!res.ok) {
      console.error("DB failed. Reverting.");
      set({ task: backupRevert });
    }
  },

  handleOptimisticTitle: async (id, newTitle) => {
    const orgId = useOrgIdStore.getState().orgId;
    const backup = [...get().task];

    set((state) => ({
      task: state.task.map((t) =>
        t.id === id ? { ...t, title: newTitle } : t
      ),
    }));

    const res = await fetch(`/api/task/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: newTitle }),
    });

    if (!res.ok) {
      console.error("DB failed. Reverting.");
      set({ task: backup });
    }
  },

  handleOptimisticDescription: async (id, newDescription) => {
    const orgId = useOrgIdStore.getState().orgId;
    const backup = [...get().task];

    set((state) => ({
      task: state.task.map((t) =>
        t.id === id ? { ...t, description: newDescription } : t
      ),
    }));

    const res = await fetch(`/api/task/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, description: newDescription }),
    });

    if (!res.ok) {
      console.error("DB failed. Reverting.");
      set({ task: backup });
    }
  },
}));
