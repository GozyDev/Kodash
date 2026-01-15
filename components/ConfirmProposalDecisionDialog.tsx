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

interface ConfirmProposalDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "accept" | "cancel";
  onConfirm: () => void;
}

const ConfirmProposalDecisionDialog = ({
  open,
  onOpenChange,
  action,
  onConfirm,
}: ConfirmProposalDecisionDialogProps) => {
  const isAccept = action === "accept";

  const title = isAccept ? "Accept Proposal" : "Cancel Proposal";
  const message = isAccept
    ? "Are you sure you want to accept this proposal? This action cannot be undone."
    : "Are you sure you want to cancel this proposal? This action cannot be undone.";

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <div className="p-4">
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px] bg-cardC text-textNa  border-cardCB">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{message}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 flex flex-col">
              <Button
        
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-cardCB/50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className={`flex-1 ${
                  isAccept ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default ConfirmProposalDecisionDialog;
