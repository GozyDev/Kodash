"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/superbase/type";
import { useState } from "react";
import { Calendar, DollarSign, FileText } from "lucide-react";

interface WriteProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onSubmit: (data: { dod: string; price: number; deadline: string }) => void;
}

export default function WriteProposalDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
}: WriteProposalDialogProps) {
  const [dod, setDod] = useState("");
  const [price, setPrice] = useState<string | "">("");
  const [deadline, setDeadline] = useState("");

  const getStatusIcon = (status:string) => {
    switch (status) {
      case "draft":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="kodash-status kodash-draft"
          >
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
          </svg>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-cardC border border-cardCB text-textNa p-3 md:p-4 ">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-left text-textNb">
            Create Proposal
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-[50px]">
          {/* LEFT: Request (read-only) */}
          <div className="p justify-between flex-col  space-y-3 hidden md:flex">
            <div className=" space-y-3">
              <h3 className="font-semibold text-textNb clear-both  text-xl">
                {task.title}
              </h3>
              <p className="text-sm text-textNd mt-2">{task.description?.slice(0,110)}....</p>
              <small className="text-primaryC hover:text-primaryHC cursor-pointer" onClick={()=>onOpenChange(false)}>veiw request</small>
            </div>

            <div className=" flex items-center justify-center gap-2 bg-cardICB/50 p-2 px-4 rounded-xl w-max">
              {getStatusIcon(task.status)}{" "}
              <p className=" capitalize text-xs">{task.status}</p>
            </div>
          </div>

          {/* RIGHT: Proposal form */}

          <div className="space-y-6">
            {/* Definition of Done */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-md font-medium text-textNa">
                <FileText className="w-4 h-4" />
                Definition of Done
              </label>
              <textarea
                className="w-full border-b border-cardCB bg-transparent p-2 focus:outline-none text-sm text-textNb tracking-wider"
                rows={5}
                value={dod}
                onChange={(e) => setDod(e.target.value)}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-textNc">
                <DollarSign className="w-4 h-4" />
                Price
              </label>
              <input
                type="text"
                className="w-full border-b border-cardCB bg-transparent p-2 focus:outline-none"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-textNc">
                <Calendar className="w-4 h-4" />
                Delivery Date
              </label>
              <input
                type="date"
                className="w-full border-b border-cardCB bg-transparent p-2 focus:outline-none"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            {/* Submit */}
            <Button
              className="w-full butt"
              onClick={() =>
                onSubmit({
                  dod,
                  price: Number(price),
                  deadline,
                })
              }
            >
              Submit Proposal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
