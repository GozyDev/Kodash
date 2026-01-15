import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmStatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "deliver" | "cancel";
  onConfirm: () => void;
}

const ConfirmStatusChangeDialog = ({
  open,
  onOpenChange,
  action,
  onConfirm,
}: ConfirmStatusChangeDialogProps) => {
  const isDeliver = action === "deliver";

  const title = isDeliver ? "Mark as Delivered" : "Cancel Task";
  const message = isDeliver
    ? "Are you sure you want to mark this task as delivered? This action cannot be undone."
    : "Are you sure you want to cancel this task? This action cannot be undone.";

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-cardC text-textNa border-none border border-cardCB">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-cardICB/50 hover:bg-cardICB/50 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={`flex-1 cursor-pointer ${
              isDeliver
                ? "bg-[#7c3aed] hover:bg-[#7c3aede8]"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmStatusChangeDialog;
