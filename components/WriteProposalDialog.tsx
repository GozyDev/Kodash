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

interface WriteProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onSubmit: (data: {
    dod: string;
    price: number;
    deadline: string;
  }) => void;
}

export default function WriteProposalDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
}: WriteProposalDialogProps) {
  const [dod, setDod] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [deadline, setDeadline] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Proposal</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* LEFT: Request (read-only) */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">{task.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {task.description}
            </p>
          </div>

          {/* RIGHT: Proposal form */}
          <div className="space-y-4">
            <textarea
              placeholder="Definition of Done"
              className="w-full border rounded-md p-2"
              rows={4}
              value={dod}
              onChange={(e) => setDod(e.target.value)}
            />

            <input
              type="number"
              placeholder="Price"
              className="w-full border rounded-md p-2"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />

            <input
              type="date"
              className="w-full border rounded-md p-2"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />

            <Button
              className="w-full"
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
