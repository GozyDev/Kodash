// Types
export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low" | "ugency" | "no priority";
  status:
    | "propose" | "proposed"
    | "on-going"
    | "deliver" | "delivered"
    | "draft"
    | "complete" | "completed"
    | "cancel" | "canceled" ; 
  due_date: string | null;
  created_at: string;
  updated_at: string;
};
export type Comment = {
  id: string;
  content: string;
  created_at: string;
  attachment_url?: string | null;
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    created_at: string;
  };
};

export type Membership = {
  role: string;
  tenant: {
    id: string;
    name: string;
    plan?: string;
    created_at?: string;
    created_by?: string | null;
  };
};

export type Workspace = {
  id: string;
  name: string;
  plan?: string;
  role:"FREELANCER"|"CLIENT"
  created_at?: string;
  created_by?: string | null;
};

export interface RequestProposal {
  id: string; // Typically a UUID
  price: number;
  currency?: string;
  due_date: string ; // ISO date string
  dod: string ;      // "Definition of Done" or similar text/json
  status: "draft" | "pending" | "accepted" | "rejected"; // Replace with your actual status union
}

export type TaskInsert = Omit<Task, "id" | "created_at" | "updated_at">;
export type TaskUpdate = Partial<TaskInsert>;
