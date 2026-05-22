"use client";

import { ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmPayoutDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const ConfirmPayoutDisputeDialog = ({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  error,
}: ConfirmPayoutDisputeDialogProps) => {
  const isDisabled = loading;

  return (
    <Dialog open={open} onOpenChange={(v) => !isDisabled && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[520px] border border-cardCB bg-cardC text-textNa">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert className="text-red-500" size={20} />
            <DialogTitle>Raise payout dispute?</DialogTitle>
          </div>
          <DialogDescription className="text-textNd">
            Raising a dispute will pause the payout flow and move this delivery
            into a disputed state for review.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-cardCB bg-black/20 p-4">
          <p className="text-sm text-textNb">
            Use this when there is a serious issue with the delivery outcome and
            payout should not proceed automatically.
          </p>
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <DialogFooter className="gap-2 sm:gap-3 flex flex-col  md:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-cardCB text-textNb"
            disabled={isDisabled}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDisabled}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Processing..." : "Raise Dispute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmPayoutDisputeDialog;
