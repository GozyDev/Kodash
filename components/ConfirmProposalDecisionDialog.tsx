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

// ConfirmProposalDecisionDialog.tsx
interface ConfirmProposalDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "accept" | "cancel";
  onConfirm: () => void;
  loading?: boolean; // Add this
}

const ConfirmProposalDecisionDialog = ({
  open,
  onOpenChange,
  action,
  onConfirm,
  loading, // Destructure this
}: ConfirmProposalDecisionDialogProps) => {
  const isAccept = action === "accept";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-cardC text-textNa border-cardCB">
        <DialogHeader>
          <DialogTitle>
            {isAccept ? "Accept Proposal" : "Cancel Proposal"}
          </DialogTitle>
          <DialogDescription>
            {isAccept
              ? "Are you sure you want to accept this proposal? You will be redirected to Stripe for payment."
              : "Are you sure you want to cancel this proposal? This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 flex sm:flex-row flex-col">
          <Button
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-cardCB/50"
          >
            Go Back
          </Button>
          <Button
            disabled={loading} // Disable button while loading
            onClick={onConfirm} // Call onConfirm directly
            className={`flex-1 ${
              isAccept
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmProposalDecisionDialog
