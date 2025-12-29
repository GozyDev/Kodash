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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-cardC border border-cardCB text-textNa">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium">
            Create Proposal
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* LEFT: Request (read-only) */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-textNb clear-both  text-xl">
              {task.title}
            </h3>
            <p className="text-sm text-textNd mt-2">{task.description}</p>
          </div>

          {/* RIGHT: Proposal form */}

          <div className="space-y-6">
            {/* Definition of Done */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-textNc">
                <FileText className="w-4 h-4" />
                Definition of Done
              </label>
              <textarea
                className="w-full border-b border-cardCB bg-transparent p-2 focus:outline-none"
                rows={4}
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
                onChange={(e) => setPrice(Number(e.target.value))}
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
