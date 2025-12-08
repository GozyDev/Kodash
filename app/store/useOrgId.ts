import { create } from "zustand";

interface OrgIdStore {
  orgId: string;
  setOrgId: (id: string) => void;
}

export const useOrgIdStore = create<OrgIdStore>((set) => ({
  orgId: "",
  setOrgId: (id) => set({ orgId: id }),
}));
