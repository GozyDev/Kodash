import { Task, TaskInsert } from "@/lib/superbase/type";
import { create } from "zustand";

interface TaskStore {
  task: Task[];
  setTask: (data: Task[]) => void;
  handleCreateTask: (
    taskdata: Omit<TaskInsert, "project_id">,
    orgId: string
  ) => Promise<void>;
  handleOptimisticPriority: (
    id: string,
    newPriority: Task["priority"]
  ) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  task: [],
  setTask: (data) => set({ task: data }),
  handleCreateTask: async (taskdata, orgId) => {
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

    console.log("Data", data);

    set((state) => ({
      task: [data, ...state.task],
    }));
  },
  handleOptimisticPriority: async (
    id: string,
    newPriority: Task["priority"]
  ) => {
    const revertedBackup = [...get().task];
    set((state) => ({
      task: state.task.map((t) =>
        t.id === id ? { ...t, priority: newPriority } : t
      ),
    }));

       // send update to DB
        fetch(`/api/task/${orgId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, priority: newPriority }),
        }).then(async (res) => {
          if (!res.ok) {
            console.error("DB failed. Reverting.");
            set({ ...task }); // revert
          }
        });
  },
}));
