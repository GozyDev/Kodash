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
import { AlertCircle } from "lucide-react";

interface ReleaseFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
  amount?: number;
  currency?: string;
  isApproval?: boolean;
  error?: string | null;
}

export function ReleaseFundsDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  amount,
  currency = "USD",
  isApproval = false,
  error = null,
}: ReleaseFundsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setInternalError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Release funds error:", err);
      setInternalError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = loading || isSubmitting;
  const displayError = error || internalError;
  const displayAmount = amount ? (amount / 100).toFixed(2) : "0.00";

  return (
    <Dialog open={open} onOpenChange={(v) => !isDisabled && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[400px] bg-cardC border-cardCB">
        <DialogHeader>
          <DialogTitle className="text-textNb">
            {isApproval ? "Approve & Release Funds" : "Release Funds"}
          </DialogTitle>
          <DialogDescription className="text-textNc">
            {isApproval
              ? "Approving this delivery will release the held funds to the freelancer. This action cannot be undone."
              : "Are you sure you want to release funds for this delivery? This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        {amount && (
          <div className="bg-cardCB rounded-lg p-4 my-4">
            <p className="text-sm text-textNd mb-1">Amount to Release</p>
            <p className="text-2xl font-bold text-textNa">
              {currency} {displayAmount}
            </p>
          </div>
        )}

        {displayError && (
          <div className="flex gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700">{displayError}</p>
          </div>
        )}

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
            {isSubmitting
              ? isApproval
                ? "Approving..."
                : "Releasing..."
              : isApproval
              ? "Approve & Release"
              : "Confirm Release"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
