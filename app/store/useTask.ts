import { Task} from "@/lib/superbase/type";
import { create } from "zustand";
import { useOrgIdStore } from "./useOrgId";

interface CreateTaskInput {
  title: string;
  description?: string;
  priority: string;
  due_date?: string | null;
  attachments?: Array<{
    file_url: string;
    file_type?: string | null;
    file_size?: number | null;
    file_name?: string | null;
  }>;
  links?: { url: string; label: string }[];
}

interface TaskStore {
  task: Task[];
  setTask: (data: Task[]) => void;
  handleCreateTask: (taskdata:CreateTaskInput) => Promise<void>;
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
      console.log("Error creating task:", data.error);
      return;
    }

    // Do NOT update local state here. The UI should update when the
    // subscription (read-time updates) emits the new task. Leaving the
    // server-created task in `data` for callers if needed.
  },

  handleOptimisticPriority: async (id, newPriority) => {
    const orgId = useOrgIdStore.getState().orgId; // 🔥 FIXED

    // Do not update local state here. The UI should update when the
    // realtime subscription emits the updated task row.
    const res = await fetch(`/api/task/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, priority: newPriority }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.error("DB failed to update priority:", err?.error || res.statusText);
    }
  },

  handleOptimisticStatus: async (id, newStatus) => {
    const orgId = useOrgIdStore.getState().orgId;

    // Do not update local state here. The UI should update when the
    // realtime subscription emits the updated task row.
    const res = await fetch(`/api/task/${orgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      console.error("DB failed to update status:", err?.error || res.statusText);
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
