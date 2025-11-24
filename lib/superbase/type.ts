// Types
export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low" | "ugency" | "no priority";
  status: "to-do" | "in-progress" | "done";
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskInsert = Omit<Task, "id" | "created_at" | "updated_at">;
export type TaskUpdate = Partial<TaskInsert>;
