"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReleaseFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function ReleaseFundsDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: ReleaseFundsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Release funds error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = loading || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(v) => !isDisabled && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[400px] bg-cardC border-cardCB">
        <DialogHeader>
          <DialogTitle className="text-textNb">Release Funds</DialogTitle>
          <DialogDescription className="text-textNc">
            Are you sure you want to release funds for this delivery? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDisabled}
            className="border-cardCB text-textNc hover:bg-cardCB/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDisabled}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? "Releasing..." : "Confirm Release"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
